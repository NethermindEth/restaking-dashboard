import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createClient } from "@supabase/supabase-js";
import { Database } from "../utils/database.types.ts";

serve(async () => {
  try {
    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        db: { schema: "mainnet" }
      }
    );
    
    const { data, error } = await supabase.from("ValidatorsUnknownBlsEpoch").select("*").limit(3);

    if (error) throw error;

    await Promise.all(data.map(async ({ index, activation_eligibility_epoch }) => {
      const req = await fetch(`https://beaconcha.in/api/v1/validator/${index}/blsChange`);
      const { status, data: blsChangeData } = await req.json();

      if (status !== "OK") throw new Error(`Beaconcha.in API call failed. Status: ${status}`);

      const blsEpoch = (blsChangeData.length === 0)
        ? activation_eligibility_epoch
        : blsChangeData[0].epoch;

      const { error: updateError } = await supabase.from("Validators")
        .update({ bls_epoch: blsEpoch })
        .eq("index", index);

      if (updateError) throw updateError;
    }));

    console.log(`Indexing successful! Validators indexed: [${data.map(el => el.index)}]`);
    return new Response(`Indexing successful! Validators indexed: [${data.map(el => el.index)}]\n`, { status: 200 });
  }
  catch (err) {
    console.error(err);
    return new Response("Got an error while indexing, check the logs\n", { status: 500 });
  }
});
