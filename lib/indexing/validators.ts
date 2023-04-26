import { ethers } from "ethers";
import { supabase } from "../supabaseClient";
import { getAllValidators } from "./utils/beaconProvider";

// serialization polyfill
import "./utils/bigint";

interface Validator {
  index: number;
  balance: bigint;
  effectiveBalance: bigint;
  withdrawalAddress: string;
}

export async function indexValidators() {
  const validators: Validator[] = (
    await getAllValidators(1200, 20)
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
