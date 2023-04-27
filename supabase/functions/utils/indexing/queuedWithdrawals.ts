import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { rangeChunkMap } from "./utils/chunk.ts";
import {
  INDEXING_BLOCK_CHUNK_SIZE,
  STRATEGY_MANAGER_ADDRESS,
  STETH_STRATEGY_ADDRESS,
  STETH_ADDRESS,
  RETH_STRATEGY_ADDRESS,
  RETH_ADDRESS,
} from "./utils/constants.ts";
import { getIndexingEndBlock, getIndexingStartBlock, setLastIndexedBlock } from "./utils/updates.ts";
import { IStrategy__factory, StrategyManager__factory } from "../../typechain/index.ts";

// serialization polyfill
import "./utils/bigint.ts";

interface QueuedWithdrawal {
  block: number;
  depositor: string;
  nonce: bigint;
  withdrawer: string;
  delegatedAddress: string;
  withdrawalRoot: string;
}

interface QueuedShareWithdrawal {
  depositor: string;
  nonce: bigint;
  token: string;
  strategy: string;
  shares: bigint;
}

/**
 * Gets indexable withdrawal data from a block range. Basically, filters
 * WithdrawalQueued and ShareWithdrawalQueued from the StrategyManager for
 * each block range chunk.
 * The idea is a withdrawal is actually composed of multiple share
 * withdrawals, which are then the actual strategy withdrawal. These can be
 * linked through the (depositor, nonce) pair, which acts as a withdrawal (not
 * share withdrawal) ID.
 * @param provider Network provider.
 * @param startBlock Starting block.
 * @param endBlock End block.
 * @param chunkSize Maximum block range for log filtering calls.
 * @returns Indexable queued withdrawal and queued share withdrawal data for a
 * block range.
 */
async function indexQueuedWithdrawalsRange(
  provider: ethers.Provider,
  startBlock: number,
  endBlock: number,
  chunkSize: number
) {
  const index: { withdrawals: QueuedWithdrawal[], shareWithdrawals: QueuedShareWithdrawal[] } = {
    withdrawals: [],
    shareWithdrawals: []
  };

  const strategyManager = StrategyManager__factory.connect(STRATEGY_MANAGER_ADDRESS, provider);
  const strategyUnderlyingToken: Record<string, string | Promise<string>> = {
    [STETH_STRATEGY_ADDRESS]: STETH_ADDRESS,
    [RETH_STRATEGY_ADDRESS]: RETH_ADDRESS,
  };
  
  await Promise.all(
    rangeChunkMap(startBlock, endBlock, chunkSize, async (fromBlock, toBlock) => {
      const [withdrawalLogs, shareWithdrawalLogs] = await Promise.all([
        strategyManager.queryFilter(strategyManager.getEvent("WithdrawalQueued"), fromBlock, toBlock),
        strategyManager.queryFilter(strategyManager.getEvent("ShareWithdrawalQueued"), fromBlock, toBlock),
      ]);

      withdrawalLogs.forEach(log => {
        index.withdrawals.push({
          block: log.blockNumber,
          depositor: log.args.depositor,
          nonce: log.args.nonce,
          withdrawer: log.args.withdrawer,
          delegatedAddress: log.args.delegatedAddress,
          withdrawalRoot: log.args.withdrawalRoot,
        });
      });

      shareWithdrawalLogs.forEach(log => {
        const strategy = log.args.strategy;

        if (!strategyUnderlyingToken[strategy]) {
          strategyUnderlyingToken[strategy] = IStrategy__factory.connect(strategy, provider).underlyingToken();
        }
      });

      await Promise.all(
        shareWithdrawalLogs.map(async log => {
          index.shareWithdrawals.push({
            depositor: log.args.depositor,
            nonce: log.args.nonce,
            token: await strategyUnderlyingToken[log.args.strategy],
            strategy: log.args.strategy,
            shares: log.args.shares,
          });
        })
      );
    })
  );

  return index;
}

/**
 * Does the default indexing procedure, getting the start block through the DB
 * and setting the end block to the default indexing end block (at the moment
 * the current finalized block), then fetches the indexable queued withdrawal
 * data and feeds it to the QueuedWithdrawals and QueuedShareWithdrawals
 * tables in the Supabase DB, while also updating the last indexed block
 * record.
 * The `getIndexingStartBlock` -> `setLastIndexedBlock` procedure also acts as
 * a 'mutex' through the `lock` column in LastIndexedBlocks, preventing
 * simultaneous runs, which would end up inserting duplicate data.
 * @param supabase Supabase client.
 * @param provider Network provider.
 */
export async function indexQueuedWithdrawals(
  supabase: SupabaseClient,
  provider: ethers.Provider,
) {
  const startBlock = await getIndexingStartBlock(supabase, "QueuedWithdrawals", true);
  const endBlock = await getIndexingEndBlock(provider);

  let results;
  try {
    results = await indexQueuedWithdrawalsRange(provider, startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE);
  }
  catch (err) {
    await releaseBlockLock("QueuedWithdrawals");
    throw err;
  }

  await setLastIndexedBlock(supabase, "QueuedWithdrawals", endBlock);
  await Promise.all([
    supabase.from("_QueuedWithdrawals").insert(results.withdrawals),
    supabase.from("_QueuedShareWithdrawals").insert(results.shareWithdrawals),
  ]);
  await releaseBlockLock("QueuedWithdrawals");

  return { startBlock, endBlock };
}
