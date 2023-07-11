import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { rangeChunkMap } from "./utils/chunk.ts";
import { addressToPsqlHexString } from "./utils/address.ts";
import { CHAIN_DATA, INDEXING_BLOCK_CHUNK_SIZE } from "./utils/constants.ts";
import { getIndexingEndBlock, getIndexingStartBlock } from "./utils/updates.ts";
import { EigenPodManager__factory } from "../../typechain/index.ts";

// serialization polyfill
import "./utils/bigint.ts";
import { Database } from "../database.types.ts";

interface Pod {
  block: number;
  address: string;
  owner: string;
}

/**
 * Gets indexable pod creation data from a block range. Basically, filters
 * PodDeployed events from the EigenPodManager contract for each block range
 * chunk.
 * @param provider Network provider.
 * @param startBlock Starting block.
 * @param endBlock End block.
 * @param chunkSize Maximum block range for log filtering calls.
 * @returns Indexable pod creation data for a block range.
 */
async function indexPodsRange(
  provider: ethers.Provider,
  startBlock: number,
  endBlock: number,
  chunkSize: number,
  chain: "mainnet" | "goerli",
): Promise<Pod[]> {
  const index: Pod[] = [];

  const eigenPodManager = EigenPodManager__factory.connect(CHAIN_DATA[chain].eigenPodManagerAddress, provider);

  await Promise.all(
    rangeChunkMap(startBlock, endBlock, chunkSize, async (fromBlock, toBlock) => {
      const deployedPodsLogs = await eigenPodManager.queryFilter(
        eigenPodManager.getEvent("PodDeployed"),
        fromBlock,
        toBlock
      );

      deployedPodsLogs.forEach(log => {
        index.push({
          block: log.blockNumber,
          address: addressToPsqlHexString(log.args.eigenPod),
          owner: addressToPsqlHexString(log.args.podOwner),
        });
      });
    })
  );

  return index;
}

/**
 * Does the default indexing procedure, getting the start block through the DB
 * and setting the end block to the default indexing end block (at the moment
 * the current finalized block), then fetches the indexable pod creation data
 * and feeds it to the Pods table in the Supabase DB, while also updating the
 * last indexed block record.
 * @param supabase Supabase client.
 * @param provider Network provider.
 */
export async function indexPods(
  supabase: SupabaseClient<Database>,
  provider: ethers.Provider,
  chain: "mainnet" | "goerli",
): Promise<{ startBlock: number; endBlock: number }> {
  const startBlock = await getIndexingStartBlock(supabase, "Pods", chain);
  const endBlock = await getIndexingEndBlock(startBlock, provider);

  const results = await indexPodsRange(provider, startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE, chain);
  const { error } = await supabase.rpc("index_pods", { p_rows: results, p_block: endBlock });

  if (error) throw error;

  return { startBlock, endBlock };
}
