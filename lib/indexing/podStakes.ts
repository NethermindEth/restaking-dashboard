import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { rangeChunkMap } from "./utils/chunk";
import { INDEXING_BLOCK_CHUNK_SIZE } from "./utils/constants";
import { getIndexingEndBlock, getIndexingStartBlock, releaseBlockLock, setLastIndexedBlock } from "./utils/updates";
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

/**
 * Gets indexable pod staking data from a block range. Basically, filters
 * EigenPodStaked events from any contract for each block range chunk.
 * This is not the restaking data, as it's still necessary to verify the
 * deposit to actually restake, and this part is tracked as ETH deposits.
 * @param provider Network provider.
 * @param startBlock Starting block.
 * @param endBlock End block.
 * @param chunkSize Maximum block range for log filtering calls.
 * @returns Indexable pod stake data for a block range.
 */
async function indexPodStakesRange(
  provider: ethers.Provider,
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

/**
 * Does the default indexing procedure, getting the start block through the DB
 * and setting the end block to the default indexing end block (at the moment
 * the current finalized block), then fetches the indexable pod staking data
 * and feeds it to the PodStakes table in the Supabase DB, while also updating
 * the last indexed block record.
 * The `getIndexingStartBlock` -> `setLastIndexedBlock` procedure also acts as
 * a 'mutex' through the `lock` column in LastIndexedBlocks, preventing
 * simultaneous runs, which would end up inserting duplicate data.
 * @param supabase Supabase client.
 * @param provider Network provider.
 */
export async function indexPodStakes(
  supabase: SupabaseClient,
  provider: ethers.Provider,
) {
  const startBlock = await getIndexingStartBlock(supabase, "PodStakes", true);
  const endBlock = await getIndexingEndBlock(provider);

  let results;
  try {
    results = await indexPodStakesRange(provider, startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE);
  }
  catch (err) {
    await releaseBlockLock("PodStakes");
    throw err;
  }

  await setLastIndexedBlock(supabase, "PodStakes", endBlock);
  await supabase.from("_PodStakes").insert(results);
  await releaseBlockLock("PodStakes");

  return { startBlock, endBlock };
}
