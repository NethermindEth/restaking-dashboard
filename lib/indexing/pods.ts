import { provider } from "../provider";
import { supabase } from "../supabaseClient";
import { chunkMap } from "./utils/chunk";
import { EigenPodManager__factory } from "../../typechain";
import { EIGEN_POD_ADDRESS } from "./utils/constants";

// serialization polyfill
import "./utils/bigint";

interface Pod {
  block: number;
  address: string;
  owner: string;
}

async function indexPodsRange(
  startingBlock: number,
  currentBlock: number,
  chunkSize: number
): Promise<Pod[]> {
  const index: Pod[] = [];

  const eigenPodManager = EigenPodManager__factory.connect(EIGEN_POD_ADDRESS, provider);

  await Promise.all(
    chunkMap(startingBlock, currentBlock, chunkSize, async (fromBlock, toBlock) => {
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
  const lastRow = await supabase
    .from("_Pods")
    .select("block")
    .order("block", { ascending: false })
    .limit(1);
  const startingBlock = (lastRow.data !== null && lastRow.data.length !== 0)? lastRow.data[0].block + 1 : 8705851;
  const currentBlock = await provider.getBlockNumber();

  const results = await indexPodsRange(startingBlock, currentBlock, 2_000);

  await supabase.from("_Pods").insert(results);
}

indexPods();
