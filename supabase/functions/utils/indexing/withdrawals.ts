import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { rangeChunkMap } from "./utils/chunk.ts";
import { INDEXING_BLOCK_CHUNK_SIZE, STRATEGY_MANAGER_ADDRESS } from "./utils/constants.ts";
import { getIndexingEndBlock, getIndexingStartBlock, setLastIndexedBlock } from "./utils/updates.ts";
import { StrategyManager__factory } from "../../typechain/index.ts";

// serialization polyfill
import "./utils/bigint.ts";

interface Withdrawal {
  block: number;
  // (depositor, nonce) should be replaced by queued withdrawal ID
  depositor: string;
  nonce: bigint;
}

/**
 * Gets indexable withdrawal data from a block range. Basically, filters
 * WithdrawalCompleted events from any contract for each block range chunk.
 * This data is related to queued withdrawals that were made effective, so to
 * get the actual amounts withdrawn and additional info this should be linked
 * to recorded queued withdrawals and queued share withdrawals.
 * @param startBlock Starting block.
 * @param endBlock End block.
 * @param chunkSize Maximum block range for log filtering calls.
 * @returns Indexable withdrawal data for a block range.
 */
async function indexWithdrawalsRange(
  provider: ethers.Provider,
  startBlock: number,
  endBlock: number,
  chunkSize: number
) {
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

/**
 * Does the default indexing procedure, getting the start block through the DB
 * and setting the end block to the default indexing end block (at the moment
 * the current finalized block), then fetches the indexable withdrawals data
 * and feeds it to the Withdrawals table in the Supabase DB, while also
 * updating the last indexed block record.
 * The `getIndexingStartBlock` -> `setLastIndexedBlock` procedure also acts as
 * a 'mutex' through the `lock` column in LastIndexedBlocks, preventing
 * simultaneous runs, which would end up inserting duplicate data.
 * @param supabase Supabase client.
 * @param provider Network provider.
 */
export async function indexWithdrawals(
  supabase: SupabaseClient,
  provider: ethers.Provider,
) {
  const startBlock = await getIndexingStartBlock(supabase, "Withdrawals", true);
  const endBlock = await getIndexingEndBlock(provider);

  let results;
  try {
    results = await indexWithdrawalsRange(provider, startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE);
  }
  catch (err) {
    await releaseBlockLock("Withdrawals");
    throw err;
  }

  await setLastIndexedBlock(supabase, "Withdrawals", endBlock);
  await supabase.from("_Withdrawals").insert(results);
  await releaseBlockLock("Withdrawals");

  return { startBlock, endBlock };
}
