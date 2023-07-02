import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { addressToPsqlHexString } from "./utils/address.ts";
import { batchGetValidators } from "./utils/beaconProvider.ts";
import { getIndexingStartValidatorIndex } from "./utils/updates.ts";

// serialization polyfill
import "./utils/bigint.ts";
import { Database } from "../database.types.ts";

interface Validator {
  index: number;
  pubkey: string;
  balance: bigint;
  effective_balance: bigint;
  withdrawal_address: string;
  activation_eligibility_epoch: number;
  exit_epoch: number;
  slashed: boolean;
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
export async function indexValidators(
  supabase: SupabaseClient<Database>,
  beaconProviderUrl: string,
): Promise<{ startIndex: number; endIndex: number }> {
  const startIndex = await getIndexingStartValidatorIndex(supabase);
  const batches = 1;
  const chunkSize = 1200;
  const concurrentChunks = 10;

  const result = await batchGetValidators(
    beaconProviderUrl,
    startIndex,
    batches,
    chunkSize,
    concurrentChunks,
  );
  const endIndex = result.validators.reduce((acc, validator) => (acc < validator.index)? validator.index : acc, 0);

  const validators: Validator[] = result.validators
    .filter(el => {
      return el.validator.withdrawalCredentials.startsWith("0x01");
    }).map(el => ({
      index: el.index,
      pubkey: addressToPsqlHexString(el.validator.pubkey),
      balance: el.balance,
      effective_balance: el.validator.effectiveBalance,
      withdrawal_address: addressToPsqlHexString(ethers.getAddress("0x" + el.validator.withdrawalCredentials.slice(-40))),
      activation_eligibility_epoch: el.validator.activationEligibilityEpoch,
      exit_epoch: el.validator.exitEpoch,
      slashed: el.validator.slashed,
    }));

  const { error } = await supabase.rpc("index_validators", {
    p_rows: validators,
    p_index: (!result.reachedLast)? endIndex : -1,
  });

  if (error) throw error;

  return { startIndex, endIndex };
}
