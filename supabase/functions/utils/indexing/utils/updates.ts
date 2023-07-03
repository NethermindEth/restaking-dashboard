import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { CHAIN_DATA, INDEXING_MAX_BLOCK_RANGE } from "./constants.ts";
import { Database } from "../../database.types.ts";

export type BlockIndexingKey = "Deposits" | "Pods" | "QueuedWithdrawals" | "Withdrawals";

/**
 * Gets the block the indexing should start from through the DB stored last
 * indexed block.
 * @param supabase Supabase client.
 * @param key Key used in the LastIndexingStates DB table.
 * @returns The block height the indexing should start from.
 */
export async function getIndexingStartBlock(
  supabase: SupabaseClient<Database>,
  key: BlockIndexingKey,
  chain: "mainnet" | "goerli",
): Promise<number> {
  const entry = await supabase
    .from("LastIndexingStates")
    .select("key, state")
    .eq("key", key);

  if (entry.error) throw entry.error;

  const state = (entry.data !== null && entry.data.length !== 0)
    ? entry.data[0].state
    : CHAIN_DATA[chain].indexingStartBlock - 1;
  
  if (!entry.data.length) {
    const insert = await supabase
      .from("LastIndexingStates")
      .insert({ key, state });

    if (insert.error) throw insert.error;
  }

  return state + 1;
}

/**
 * Gets the validator index the validator indexing should start from through
 * the DB stored last indexed index.
 * @param supabase Supabase client.
 * @returns The block height the indexing should start from.
 */
export async function getIndexingStartValidatorIndex(
  supabase: SupabaseClient<Database>,
): Promise<number> {
  const entry = await supabase
    .from("LastIndexingStates")
    .select("key, state")
    .eq("key", "Validators");

  if (entry.error) throw entry.error;

  const state = (entry.data !== null && entry.data.length !== 0)
    ? entry.data[0].state
    : -1;
  
  if (!entry.data.length) {
    const insert = await supabase
      .from("LastIndexingStates")
      .insert({ key: "Validators", state });

    if (insert.error) throw insert.error;
  }

  return state + 1;
}

/**
 * Gets the block the indexing should end at.
 * @param startBlock Current start block, used to consider the maximum indexing
 * range.
 * @param provider Network provider.
 * @returns The block height the indexing should end at.
 */
export async function getIndexingEndBlock(startBlock: number, provider: ethers.Provider) {
  const finalizedBlockNumber = (await provider.getBlock("finalized"))?.number;

  if (finalizedBlockNumber === undefined) {
    throw new Error("Failed while fetching finalized block number");
  }

  return Math.min(finalizedBlockNumber, startBlock + INDEXING_MAX_BLOCK_RANGE - 1);
}
