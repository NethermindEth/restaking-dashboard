import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { rangeChunkMap } from "./utils/chunk.ts";
import { EIGEN_POD_MANAGER_ADDRESS, INDEXING_BLOCK_CHUNK_SIZE } from "./utils/constants.ts";
import { getIndexingEndBlock, getIndexingStartBlock, releaseBlockLock, setLastIndexedBlock } from "./utils/updates.ts";
import { EigenPodManager__factory } from "../../typechain/index.ts";

// serialization polyfill
import "./utils/bigint.ts";

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
  chunkSize: number
): Promise<Pod[]> {
  const index: Pod[] = [];

  const eigenPodManager = EigenPodManager__factory.connect(EIGEN_POD_MANAGER_ADDRESS, provider);

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
          address: log.args.eigenPod,
          owner: log.args.podOwner,
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
 * The `getIndexingStartBlock` -> `setLastIndexedBlock` procedure also acts as
 * a 'mutex' through the `lock` column in LastIndexedBlocks, preventing
 * simultaneous runs, which would end up inserting duplicate data.
 * @param supabase Supabase client.
 * @param provider Network provider.
 */
export async function indexPods(
  supabase: SupabaseClient,
  provider: ethers.Provider,
): Promise<{ startBlock: number; endBlock: number }> {
  const startBlock = await getIndexingStartBlock(supabase, "Pods", true);
  const endBlock = await getIndexingEndBlock(provider);

  let results;
  try {
    results = await indexPodsRange(provider, startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE);
  }
  catch (err) {
    await releaseBlockLock("Pods");
    throw err;
  }

  await setLastIndexedBlock(supabase, "Pods", endBlock);
  await supabase.from("_Pods").insert(results);
  await releaseBlockLock("Pods");

  return { startBlock, endBlock };
}
