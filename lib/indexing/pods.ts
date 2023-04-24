import { provider } from "../provider";
import { supabase } from "../supabaseClient";
import { rangeChunkMap } from "./utils/chunk";
import { EIGEN_POD_MANAGER_ADDRESS, INDEXING_BLOCK_CHUNK_SIZE } from "./utils/constants";
import { getIndexingEndBlock, getIndexingStartBlock, setLastIndexedBlock } from "./utils/updates";
import { EigenPodManager__factory } from "../../typechain";

// serialization polyfill
import "./utils/bigint";

interface Pod {
  block: number;
  address: string;
  owner: string;
}

async function indexPodsRange(
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

export async function indexPods() {
  const startBlock = await getIndexingStartBlock("Pods");
  const endBlock = await getIndexingEndBlock();

  const results = await indexPodsRange(startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE);

  await supabase.from("_Pods").insert(results);
  await setLastIndexedBlock("Pods", endBlock);
}
