import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { rangeChunkMap } from "./utils/chunk.ts";
import { addressToPsqlHexString } from "./utils/address.ts";
import { CHAIN_DATA, INDEXING_BLOCK_CHUNK_SIZE } from "./utils/constants.ts";
import { getIndexingEndBlock, getIndexingStartBlock } from "./utils/updates.ts";
import { StrategyManager__factory } from "../../typechain/index.ts";

// serialization polyfill
import "./utils/bigint.ts";
import { Database } from "../database.types.ts";

interface ShareWithdrawal {
  queued_block: number;
  log_index: number;
  depositor: string;
  nonce: bigint;
  strategy: string;
  shares: bigint;
  withdrawer: string;
  delegated_address: string;
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
  chunkSize: number,
  chain: "mainnet" | "goerli",
) {
  const index: ShareWithdrawal[] = [];
  const strategyManager = StrategyManager__factory.connect(CHAIN_DATA[chain].strategyManagerAddress, provider);
  
  await Promise.all(
    rangeChunkMap(startBlock, endBlock, chunkSize, async (fromBlock, toBlock) => {
      const [withdrawalLogs, shareWithdrawalLogs] = await Promise.all([
        strategyManager.queryFilter(strategyManager.getEvent("WithdrawalQueued"), fromBlock, toBlock),
        strategyManager.queryFilter(strategyManager.getEvent("ShareWithdrawalQueued"), fromBlock, toBlock),
      ]);

      const withdrawalInfo: Record<string, { withdrawer: string; delegatedAddress: string; withdrawalRoot: string }> = {};

      withdrawalLogs.forEach(log => {
        withdrawalInfo[`${log.args.depositor}_${log.args.nonce}`] = log.args;
      });

      shareWithdrawalLogs.forEach(log => {
        const { withdrawer, delegatedAddress } = withdrawalInfo[`${log.args.depositor}_${log.args.nonce}`];

        index.push({
          queued_block: log.blockNumber,
          log_index: log.index,
          depositor: addressToPsqlHexString(log.args.depositor),
          nonce: log.args.nonce,
          strategy: addressToPsqlHexString(log.args.strategy),
          shares: log.args.shares,
          withdrawer: addressToPsqlHexString(withdrawer),
          delegated_address: addressToPsqlHexString(delegatedAddress),
        });
      });
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
 * @param supabase Supabase client.
 * @param provider Network provider.
 */
export async function indexQueuedWithdrawals(
  supabase: SupabaseClient<Database>,
  provider: ethers.Provider,
  chain: "mainnet" | "goerli",
): Promise<{ startBlock: number; endBlock: number }> {
  const startBlock = await getIndexingStartBlock(supabase, "QueuedWithdrawals", chain);
  const endBlock = await getIndexingEndBlock(startBlock, provider);

  const results = await indexQueuedWithdrawalsRange(provider, startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE, chain);
  const { error } = await supabase.rpc("index_share_withdrawals", { p_rows: results, p_block: endBlock });

  if (error) throw error;

  return { startBlock, endBlock };
}
