import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { rangeChunkMap } from "./utils/chunk.ts";
import { addressToPsqlHexString } from "./utils/address.ts";
import { CHAIN_DATA, INDEXING_BLOCK_CHUNK_SIZE } from "./utils/constants.ts";
import { getIndexingEndBlock, getIndexingStartBlock } from "./utils/updates.ts";
import { IStrategy__factory, StrategyManager__factory } from "../../typechain/index.ts";

// serialization polyfill
import "./utils/bigint.ts";
import { Database } from "../database.types.ts";

interface WithdrawalData {
  block: number;
  depositor: string;
  nonce: number;
}

interface RatesUpdateData {
  block: number;
  strategy: string;
  rate: bigint;
}

/**
 * Gets indexable withdrawal data from a block range. Basically, filters
 * WithdrawalCompleted events from any contract for each block range chunk.
 * This data is related to queued withdrawals that were made effective, so to
 * get the actual amounts withdrawn and additional info this should be linked
 * to recorded queued withdrawals and queued share withdrawals.
 * @param startBlock Starting block.
 * @param endBlock End block.
 * @param chunkSize Maximum block range for log filtering calls.
 * @returns Indexable withdrawal data for a block range.
 */
async function indexWithdrawalsRange(
  provider: ethers.Provider,
  startBlock: number,
  endBlock: number,
  chunkSize: number,
  chain: "mainnet" | "goerli",
) {
  const index: WithdrawalData[] = [];

  const strategyManager = StrategyManager__factory.connect(CHAIN_DATA[chain].strategyManagerAddress, provider);
  
  await Promise.all(
    rangeChunkMap(startBlock, endBlock, chunkSize, async (fromBlock, toBlock) => {
      const withdrawalLogs = await strategyManager.queryFilter(strategyManager.getEvent("WithdrawalCompleted"), fromBlock, toBlock);

      withdrawalLogs.forEach(log => {
        index.push({
          block: log.blockNumber,
          depositor: addressToPsqlHexString(log.args.depositor),
          nonce: Number(log.args.nonce),
        });
      });
    })
  );

  return index;
}

/**
 * Does the default indexing procedure, getting the start block through the DB
 * and setting the end block to the default indexing end block (at the moment
 * the current finalized block), then fetches the indexable withdrawals data
 * and feeds it to the Withdrawals table in the Supabase DB, while also
 * updating the last indexed block record.
 * The `getIndexingStartBlock` -> `setLastIndexedBlock` procedure also acts as
 * a 'mutex' through the `lock` column in LastIndexedBlocks, preventing
 * simultaneous runs, which would end up inserting duplicate data.
 * @param supabase Supabase client.
 * @param provider Network provider.
 */
export async function indexWithdrawals(
  supabase: SupabaseClient<Database>,
  provider: ethers.Provider,
  chain: "mainnet" | "goerli",
): Promise<{ startBlock: number; endBlock: number }> {
  const startBlock = await getIndexingStartBlock(supabase, "Withdrawals", chain);
  const endBlock = await getIndexingEndBlock(startBlock, provider);

  const results = await indexWithdrawalsRange(provider, startBlock, endBlock, INDEXING_BLOCK_CHUNK_SIZE, chain);
  const { data: strategies, error: strategiesError } = await supabase.rpc("share_withdrawal_strategies", {
    p_rows: results,
  });

  if (strategiesError) throw strategiesError;

  const ratesUpdateData: RatesUpdateData[] = await Promise.all(strategies.map(async ({ block, strategy }) => {
    return {
      block,
      strategy: addressToPsqlHexString(strategy),
      rate: await IStrategy__factory.connect(strategy, provider).sharesToUnderlyingView(BigInt(1e22), { blockTag: block }),
    };
  }));

  const { error } = await supabase.rpc("update_share_withdrawals", {
    p_withdrawal_data: results,
    p_rates_data: ratesUpdateData,
    p_block: endBlock,
  });

  if (error) throw error;

  return { startBlock, endBlock };
}
