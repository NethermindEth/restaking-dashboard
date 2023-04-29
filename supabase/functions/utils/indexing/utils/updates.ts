import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { INDEXING_START_BLOCK } from "./constants.ts";

export type UpdateKey = "Deposits" | "PodStakes" | "Pods" | "QueuedWithdrawals" | "Withdrawals";

/**
 * Gets the block the indexing should start from through the DB stored last
 * indexed block.
 * @param supabase Supabase client.
 * @param key Key used in the LastIndexedBlocks DB table.
 * @param lock Whether the indexing lock should be set to avoid simultaneous
 * indexing.
 * @returns The block height the indexing should start from.
 */
export async function getIndexingStartBlock(
  supabase: SupabaseClient,
  key: UpdateKey,
  lock: boolean = false
): Promise<number> {
  const entry = await supabase
    .from("LastIndexedBlocks")
    .select("key, block")
    .eq("key", key);

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
 * @param provider Network provider.
 * @returns The block height the indexing should end at.
 */
export async function getIndexingEndBlock(provider: ethers.Provider) {
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
 * @param supabase Supabase client.
 * @param key Key used in the LastIndexedBlocks DB table.
 * @param block Last indexed block height.
 */
export async function setLastIndexedBlock(
  supabase: SupabaseClient,
  key: UpdateKey,
  block: number
) {
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
    .upsert({ key, block, lock: true }, { onConflict: "key" });

  if (upsert.error) throw upsert.error;
}

/**
 * Releases the lock set when starting the indexing process if the `lock` flag
 * on `getIndexingStartBlock` is active.
 * Don't consider `getIndexingStartBlock` or `setLastIndexedBlock` when
 * catching errors to trigger this function, as this would effectively make
 * the lock useless.
 * @param key Key used in the LastIndexedBlocks DB table.
 * @param requireSet Requires that the lock was initially set.
 */
export async function releaseBlockLock(key: UpdateKey, requireSet: boolean = true) {
  const entry = await supabase
    .from("LastIndexedBlocks")
    .select("key, block, lock")
    .eq("key", key);

  if (entry.error) throw entry.error;
  if (!entry.data.length) {
    throw new Error("Trying to release lock from unknown indexing process");
  }
  if (requireSet && !entry.data[0].lock) {
    throw new Error("Trying to release unset lock and requireSet is active");
  }

  const update = await supabase
    .from("LastIndexedBlocks")
    .update({ ...entry.data[0], lock: false })
    .eq("key", key);

  if (update.error) throw update.error;
}
