import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { batchGetValidators } from "./utils/beaconProvider.ts";

// serialization polyfill
import "./utils/bigint.ts";

interface Validator {
  index: number;
  balance: bigint;
  effectiveBalance: bigint;
  withdrawalAddress: string;
}

/**
 * Simply indexes validators, without any special procedure since in this case
 * the starting block and simultaneous runs don't really matter as all the
 * validator balances and withdrawal addresses need to be fully re-indexed
 * each time.
 * The data is fetched using the Beacon API and it's stored in the Validators
 * table in Supabase. Only validators with an L1 address as withdrawal
 * credentials are added to the database, as the goal of this database is
 * getting EigenPod-related stakes, and in this case the pod L1 address should
 * be used as the validator withdrawal credentials.
 * @param beaconProviderUrl URL of the Beacon API provider.
 */
export async function indexValidators(supabase: SupabaseClient, beaconProviderUrl: string) {
  const entry = await supabase.from("ValidatorIndexingState").select("*");

  if (entry.error) {
    throw entry.error;
  }
  if (!entry.data.length) {
    throw new Error("Missing state in ValidatorIndexingState table");
  }
  if (entry.data[0].lock) {
    throw new Error("Trying to index validators while other validator indexer is running");
  }

  const lockUpdate = await supabase
    .from("ValidatorIndexingState")
    .update({
      lastIndex: entry.data[0].lastIndex,
      lock: true,
    })
    .eq("id", entry.data[0].id)
    .eq("lock", false)
    .select();

  if (lockUpdate.error) throw lockUpdate.error;
  if (!lockUpdate.data.length) {
    throw new Error("Lock is already set on this indexing process");
  }

  const startIndex = entry.data[0].lastIndex + 1;
  const batches = 4;
  const chunkSize = 1200;
  const concurrentChunks = 10;
  const validatorAmount = batches * chunkSize * concurrentChunks;

  const result = await batchGetValidators(
    beaconProviderUrl,
    startIndex,
    batches,
    chunkSize,
    concurrentChunks,
  );

  const validators: Validator[] = result.validators
    .filter(el => {
      return el.validator.withdrawalCredentials.startsWith("0x01");
    }).map(el => ({
      index: el.index,
      balance: el.balance,
      effectiveBalance: el.validator.effectiveBalance,
      withdrawalAddress: ethers.getAddress("0x" + el.validator.withdrawalCredentials.slice(-40)),
    }));

  await supabase.from("_Validators").upsert(validators);
  
  const resultUpdate = await supabase
    .from("ValidatorIndexingState")
    .update({
      lastIndex: (!result.reachedLast)? entry.data[0].lastIndex + validatorAmount : -1,
      lock: false,
    })
    .eq("id", entry.data[0].id);

  if (resultUpdate.error) throw resultUpdate.error;
}
