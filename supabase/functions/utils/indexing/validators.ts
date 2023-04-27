import { ethers } from "ethers";
import { SupabaseClient } from "@supabase/supabase-js";
import { getAllValidators } from "./utils/beaconProvider.ts";

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
  const validators: Validator[] = (
    await getAllValidators(beaconProviderUrl, 1200, 20)
  ).filter(el => {
    return el.validator.withdrawalCredentials.startsWith("0x01");
  }).map(el => ({
    index: el.index,
    balance: el.balance,
    effectiveBalance: el.validator.effectiveBalance,
    withdrawalAddress: ethers.getAddress("0x" + el.validator.withdrawalCredentials.slice(-40)),
  }));

  await supabase.from("_Validators").upsert(validators);
}
