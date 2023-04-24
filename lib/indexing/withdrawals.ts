import { provider } from "../provider";
import { supabase } from "../supabaseClient";
import { rangeChunkMap } from "./utils/chunk";
import { INDEXING_BLOCK_CHUNK_SIZE, STRATEGY_MANAGER_ADDRESS } from "./utils/constants";
import { getIndexingEndBlock, getIndexingStartBlock, setIndexingStartBlock } from "./utils/updates";
import { StrategyManager__factory } from "../../typechain";

// serialization polyfill
import "./utils/bigint";

interface Withdrawal {
  block: number;
  // (depositor, nonce) should be replaced by queued withdrawal ID
  depositor: string;
  nonce: bigint;
}

async function indexWithdrawalsRange(startBlock: number, endBlock: number, chunkSize: number) {
  const index: Withdrawal[] = [];

  const strategyManager = StrategyManager__factory.connect(STRATEGY_MANAGER_ADDRESS, provider);
  
  await Promise.all(
    rangeChunkMap(startBlock, endBlock, chunkSize, async (fromBlock, toBlock) => {
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
  const startBlock = await getIndexingStartBlock("Withdrawals");
  const endBlock = await getIndexingEndBlock();

  const results = await indexWithdrawalsRange(startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE);

  await supabase.from("_Withdrawals").insert(results);
  await setIndexingStartBlock("Withdrawals", endBlock);
}
