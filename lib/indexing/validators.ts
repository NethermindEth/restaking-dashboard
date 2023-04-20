import Bottleneck from "bottleneck";
import { supabase } from "../supabaseClient";

// serialization polyfill
import "./utils/bigint";
import { ethers } from "ethers";

interface Validator {
  index: number;
  balance: bigint;
  withdrawalAddress: string;
}
export async function indexValidators() {
  const limiter = new Bottleneck({
    maxConcurrent: 1,
    minTime: (60000 / 10) + 500,
  });
  const chunkSize = 800;

  for (let i = 0; ; i += chunkSize) {
    console.log(`Indexing validator ${i}-${i + chunkSize - 1}`);

    const request = await limiter.schedule(() => fetch(
      "https://goerli.beaconcha.in/api/v1/validator/"
        + Array.from({ length: chunkSize }).map((_, idx) => `${i + idx}`).join("%2C"),
      {
        method: "POST"
      }
    ));

    const result: { status: string; data: any[] } = await request.json();

    if (result.data.length === 0) break;

    const validators: Validator[] = result.data
      .filter(validator => validator.withdrawalcredentials.startsWith("0x01"))
      .map(validator => ({
        index: validator.validatorindex,
        balance: BigInt(validator.balance),
        withdrawalAddress: ethers.getAddress("0x" + validator.withdrawalcredentials.slice(-40)),
      }));

    if (validators.length) {
      await supabase.from("_Validators").upsert(validators);
    }
  }
}
