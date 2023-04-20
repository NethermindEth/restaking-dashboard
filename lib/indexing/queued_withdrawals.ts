import { provider } from "../provider";
import { supabase } from "../supabaseClient";
import { chunkMap } from "./utils/chunk";
import { STRATEGY_MANAGER_ADDRESS } from "./utils/constants";
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

async function indexQueuedWithdrawalsRange(startingBlock: number, currentBlock: number, chunkSize: number) {
  const index: { withdrawals: QueuedWithdrawal[], shareWithdrawals: QueuedShareWithdrawal[] } = {
    withdrawals: [],
    shareWithdrawals: []
  };

  const strategyManager = StrategyManager__factory.connect(STRATEGY_MANAGER_ADDRESS, provider);
  
  await Promise.all(
    chunkMap(startingBlock, currentBlock, chunkSize, async (fromBlock, toBlock) => {
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

      const strategies = Array.from(new Set(shareWithdrawalLogs.map(el => el.args.strategy)));
      const underlyingTokens = await Promise.all(strategies.map(strategy => IStrategy__factory.connect(strategy, provider).underlyingToken()));
      const strategyUnderlyingToken = strategies.reduce((acc, strategy, idx) => {
        acc[strategy] = underlyingTokens[idx];
        return acc;
      }, {} as Record<string, string>);

      shareWithdrawalLogs.forEach(log => {
        index.shareWithdrawals.push({
          depositor: log.args.depositor,
          nonce: log.args.nonce,
          token: strategyUnderlyingToken[log.args.strategy],
          strategy: log.args.strategy,
          shares: log.args.shares,
        });
      });
    })
  );

  return index;
}

export async function indexQueuedWithdrawals() {
  const lastRow = await supabase
    .from("_QueuedWithdrawals")
    .select("block")
    .order("block", { ascending: false })
    .limit(1);
  const startingBlock = (lastRow.data !== null && lastRow.data.length !== 0)? lastRow.data[0].block + 1 : 0;
  const currentBlock = await provider.getBlockNumber();

  const results = await indexQueuedWithdrawalsRange(startingBlock, currentBlock, 10_000);

  await Promise.all([
    supabase.from("_QueuedWithdrawals").insert(results.withdrawals),
    supabase.from("_QueuedShareWithdrawals").insert(results.shareWithdrawals),
  ]);
}
