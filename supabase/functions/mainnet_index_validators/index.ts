import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createClient } from "@supabase/supabase-js";

import { indexValidators } from "../utils/indexing/validators.ts";

serve(async () => {
  try {
    const { startIndex, endIndex } = await indexValidators(
      createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        {
          db: { schema: "mainnet" },
        },
      ),
      Deno.env.get("MAINNET_BEACON_PROVIDER_URL") ?? ""
    );

    console.log(`Indexing successful! Validator index range: ${startIndex}-${endIndex}`);
    return new Response(`Indexing successful! Validator index range: ${startIndex}-${endIndex}\n`, { status: 200 });
  }
  catch (err) {
    console.error(err);
    return new Response("Got an error while indexing, check the logs\n", { status: 500 });
  }
});
