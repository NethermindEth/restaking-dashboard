import { provider } from "../provider";
import { supabase } from "../supabaseClient";
import { rangeChunkMap } from "./utils/chunk";
import {
  INDEXING_BLOCK_CHUNK_SIZE,
  STRATEGY_MANAGER_ADDRESS,
  STETH_STRATEGY_ADDRESS,
  STETH_ADDRESS,
  RETH_STRATEGY_ADDRESS,
  RETH_ADDRESS,
} from "./utils/constants";
import { getIndexingEndBlock, getIndexingStartBlock, setLastIndexedBlock } from "./utils/updates";
import { IStrategy__factory, StrategyManager__factory } from "../../typechain";

// serialization polyfill
import "./utils/bigint";

interface QueuedWithdrawal {
  block: number;
  depositor: string;
  nonce: bigint;
  withdrawer: string;
  // currently the same as the depositor
  // caller: string;
  delegatedAddress: string;
  withdrawalRoot: string;
}

interface QueuedShareWithdrawal {
  // (depositor, nonce) should be replaced by queued withdrawal ID
  depositor: string;
  nonce: bigint;
  token: string;
  strategy: string;
  shares: bigint;
  // currently the same as the depositor
  // caller: string;
}

async function indexQueuedWithdrawalsRange(startBlock: number, endBlock: number, chunkSize: number) {
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

export async function indexQueuedWithdrawals() {
  const startBlock = await getIndexingStartBlock("QueuedWithdrawals");
  const endBlock = await getIndexingEndBlock();

  const results = await indexQueuedWithdrawalsRange(startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE);

  await Promise.all([
    supabase.from("_QueuedWithdrawals").insert(results.withdrawals),
    supabase.from("_QueuedShareWithdrawals").insert(results.shareWithdrawals),
  ]);
  await setLastIndexedBlock("QueuedWithdrawals", endBlock);
}
