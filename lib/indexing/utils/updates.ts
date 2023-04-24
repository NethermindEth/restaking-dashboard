import { provider } from "../../provider";
import { supabase } from "../../supabaseClient";
import { INDEXING_START_BLOCK } from "./constants";

export type UpdateKey = "Deposits" | "PodStakes" | "Pods" | "QueuedWithdrawals" | "Withdrawals";

/**
 * Gets the block the indexing should start from through the DB stored last
 * indexed block.
 * @param key Key used in the LastIndexedBlocks DB table.
 * @returns The block height the indexing should start from.
 */
export async function getIndexingStartBlock(key: UpdateKey): Promise<number> {
  const entry = await supabase.from("LastIndexedBlocks").select("key, block").eq("key", key);

  if (entry.error) throw entry.error;

  return (entry.data !== null && entry.data.length !== 0)
    ? entry.data[0].block + 1
    : INDEXING_START_BLOCK;
}

/**
 * Gets the block the indexing should end at. Currently only fetches the
 * "finalized" block.
 * @returns The block height the indexing should end at.
 */
export async function getIndexingEndBlock() {
  const finalizedBlockNumber = (await provider.getBlock("finalized"))?.number;

  if (!finalizedBlockNumber) {
    throw new Error("Failed while fetching finalized block number");
  }

  return finalizedBlockNumber;
}

/**
 * Stores the last indexed block in the DB so the next indexing for this key
 * starts at the next block.
 * @param key Key used in the LastIndexedBlocks DB table.
 * @param block Last indexed block height.
 */
export async function setIndexingStartBlock(key: UpdateKey, block: number) {
  await supabase.from("LastIndexedBlocks").upsert({ key, block });
}
