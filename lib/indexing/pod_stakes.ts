import { ethers } from "ethers";
import { provider } from "../provider";
import { supabase } from "../supabaseClient";
import { rangeChunkMap } from "./utils/chunk";
import { INDEXING_START_BLOCK } from "./utils/constants";
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
  startingBlock: number,
  currentBlock: number,
  chunkSize: number
): Promise<PodStake[]> {
  const index: PodStake[] = [];

  const eigenPod = EigenPod__factory.createInterface();

  await Promise.all(
    rangeChunkMap(startingBlock, currentBlock, chunkSize, async (fromBlock, toBlock) => {
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
  const lastRow = await supabase
    .from("_PodStakes")
    .select("block")
    .order("block", { ascending: false })
    .limit(1);
  const startingBlock = (lastRow.data !== null && lastRow.data.length !== 0)
    ? lastRow.data[0].block + 1
    : INDEXING_START_BLOCK;
  const currentBlock = await provider.getBlockNumber();

  const results = await indexPodStakesRange(startingBlock, currentBlock, 2_000);

  await supabase.from("_PodStakes").insert(results);
}
