import { provider } from "../provider";
import { supabase } from "../supabaseClient";
import { rangeChunkMap } from "./utils/chunk";
import { INDEXING_START_BLOCK, STRATEGY_MANAGER_ADDRESS } from "./utils/constants";
import { StrategyManager__factory } from "../../typechain";

// serialization polyfill
import "./utils/bigint";

interface Withdrawal {
  block: number;
  // (depositor, nonce) should be replaced by queued withdrawal ID
  depositor: string;
  nonce: bigint;
}

async function indexWithdrawalsRange(startingBlock: number, currentBlock: number, chunkSize: number) {
  const index: Withdrawal[] = [];

  const strategyManager = StrategyManager__factory.connect(STRATEGY_MANAGER_ADDRESS, provider);
  
  await Promise.all(
    rangeChunkMap(startingBlock, currentBlock, chunkSize, async (fromBlock, toBlock) => {
      const withdrawalLogs = await strategyManager.queryFilter(strategyManager.getEvent("WithdrawalCompleted"), fromBlock, toBlock);

      withdrawalLogs.forEach(log => {
        index.push({
          block: log.blockNumber,
          depositor: log.args.depositor,
          nonce: log.args.nonce,
        });
      });
    })
  );

  return index;
}

export async function indexWithdrawals() {
  const lastRow = await supabase
    .from("_Withdrawals")
    .select("block")
    .order("block", { ascending: false })
    .limit(1);
  const startingBlock = (lastRow.data !== null && lastRow.data.length !== 0)
    ? lastRow.data[0].block + 1
    : INDEXING_START_BLOCK;
  const currentBlock = await provider.getBlockNumber();

  const results = await indexWithdrawalsRange(startingBlock, currentBlock, 10_000);

  await supabase.from("_Withdrawals").insert(results);
}
