import { provider } from "../../provider";
import { supabase } from "../../supabaseClient";
import { INDEXING_START_BLOCK } from "./constants";

export type UpdateKey = "Deposits" | "PodStakes" | "Pods" | "QueuedWithdrawals" | "Withdrawals";

/**
 * Gets the block the indexing should start from through the DB stored last
 * indexed block.
 * @param key Key used in the LastIndexedBlocks DB table.
 * @param lock Whether the indexing lock should be set to avoid simultaneous
 * indexing.
 * @returns The block height the indexing should start from.
 */
export async function getIndexingStartBlock(
  key: UpdateKey,
  lock: boolean = false
): Promise<number> {
  const entry = await supabase.from("LastIndexedBlocks").select("key, block").eq("key", key);

  if (entry.error) throw entry.error;

  const block = (entry.data !== null && entry.data.length !== 0)
    ? entry.data[0].block
    : INDEXING_START_BLOCK - 1;
  
  if (!entry.data.length) {
    const insert = await supabase
      .from("LastIndexedBlocks")
      .insert({ key, block, lock: false });

    if (insert.error) throw insert.error;
  }

  if (lock) {
    const update = await supabase
      .from("LastIndexedBlocks")
      .update({ key, block, lock: true })
      .eq("key", key)
      .eq("lock", false)
      .select();

    if (update.error) throw update.error;
    if (!update.data.length) {
      throw new Error("Lock is already set on this indexing process");
    }
  }

  return block + 1;
}

/**
 * Gets the block the indexing should end at. Currently only fetches the
 * "finalized" block.
 * @returns The block height the indexing should end at.
 */
export async function getIndexingEndBlock() {
  const finalizedBlockNumber = (await provider.getBlock("finalized"))?.number;

  if (finalizedBlockNumber === undefined) {
    throw new Error("Failed while fetching finalized block number");
  }

  return finalizedBlockNumber;
}

/**
 * Stores the last indexed block in the DB so the next indexing for this key
 * starts at the next block. The entry in the DB must either not exist or be
 * locked (`lock` column set).
 * @param key Key used in the LastIndexedBlocks DB table.
 * @param block Last indexed block height.
 */
export async function setLastIndexedBlock(key: UpdateKey, block: number) {
  const entry = await supabase
    .from("LastIndexedBlocks")
    .select("key, block, lock")
    .eq("key", key);

  if (entry.error) throw entry.error;
  if (entry.data.length) {
    if (entry.data[0].block >= block) {
      throw new Error("Trying to set last indexed block lesser or equal than the previously last indexed block");
    }

    if (!entry.data[0].lock) {
      throw new Error("Trying to update last indexed block on process with unset lock");
    }
  } 

  const upsert = await supabase
    .from("LastIndexedBlocks")
    .upsert({ key, block, lock: false }, { onConflict: "key" });

  if (upsert.error) throw upsert.error;
}
