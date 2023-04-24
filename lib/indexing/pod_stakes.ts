import { ethers } from "ethers";
import { provider } from "../provider";
import { supabase } from "../supabaseClient";
import { rangeChunkMap } from "./utils/chunk";
import { INDEXING_BLOCK_CHUNK_SIZE } from "./utils/constants";
import { getIndexingEndBlock, getIndexingStartBlock, setIndexingStartBlock } from "./utils/updates";
import { EigenPod__factory } from "../../typechain";
import { TypedContractEvent, TypedEventLog } from "../../typechain/common";
import { EigenPodStakedEvent } from "../../typechain/EigenPod";

// serialization polyfill
import "./utils/bigint";

interface PodStake {
  block: number;
  address: string;
  pubKey: string;
}

type EigenPodStakedLog = TypedEventLog<
  TypedContractEvent<
    EigenPodStakedEvent.InputTuple,
    EigenPodStakedEvent.OutputTuple,
    EigenPodStakedEvent.OutputObject
  >
>;

async function indexPodStakesRange(
  startBlock: number,
  endBlock: number,
  chunkSize: number
): Promise<PodStake[]> {
  const index: PodStake[] = [];

  const eigenPod = EigenPod__factory.createInterface();

  await Promise.all(
    rangeChunkMap(startBlock, endBlock, chunkSize, async (fromBlock, toBlock) => {
      const stakeLogs = (await provider.getLogs({
        topics: [
          eigenPod.getEvent("EigenPodStaked").topicHash,
          null,
        ],
        fromBlock,
        toBlock,
      })).map(log => {
        return new ethers.EventLog(
          log,
          eigenPod,
          eigenPod.getEvent("EigenPodStaked")
        ) as unknown as EigenPodStakedLog;
      });;

      stakeLogs.forEach(log => {
        index.push({
          block: log.blockNumber,
          address: log.address,
          pubKey: log.args.pubkey,
        });
      });
    })
  );

  return index;
}

export async function indexPodStakes() {
  const startBlock = await getIndexingStartBlock("PodStakes");
  const endBlock = await getIndexingEndBlock();

  const results = await indexPodStakesRange(startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE);

  await supabase.from("_PodStakes").insert(results);
  await setLastIndexedBlock("PodStakes", endBlock);
}
