import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";

import { indexPods } from "../utils/indexing/pods.ts";

serve(async () => {
  try {
    const { startBlock, endBlock } = await indexPods(
      createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
        {
          db: { schema: "mainnet" },
        },
      ),
      new ethers.JsonRpcProvider(Deno.env.get("MAINNET_RPC_URL") ?? "", "mainnet"),
      "mainnet",
    );

    console.log(`Indexing successful! Block range: ${startBlock}-${endBlock}`);
    return new Response(`Indexing successful! Block range: ${startBlock}-${endBlock}\n`, { status: 200 });
  }
  catch (err) {
    console.error(err);
    return new Response("Got an error while indexing, check the logs\n", { status: 500 });
  }
});
