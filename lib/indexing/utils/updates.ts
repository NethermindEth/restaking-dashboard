import { supabase } from "../../supabaseClient";
import { INDEXING_START_BLOCK } from "./constants";

export type UpdateKey = "Deposits" | "PodStakes" | "Pods" | "QueuedWithdrawals" | "Withdrawals";

export async function getIndexingStartBlock(key: UpdateKey): Promise<number> {
  const entry = await supabase.from("LastIndexedBlocks").select("key, block").eq("key", key);

  if (entry.error) throw entry.error;

  return (entry.data !== null && entry.data.length !== 0)
    ? entry.data[0].block + 1
    : INDEXING_START_BLOCK;
}

export async function setIndexingStartBlock(key: UpdateKey, block: number) {
  await supabase.from("LastIndexedBlocks").upsert({ key, block });
}
