import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { ethers } from "ethers";
import { createClient } from "@supabase/supabase-js";

import { indexWithdrawals } from "../utils/indexing/withdrawals.ts";

serve(async () => {
  try {
    await indexWithdrawals(
      createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      ),
      new ethers.JsonRpcProvider(Deno.env.get("RPC_URL") ?? "", "goerli"),
    );
  
    return new Response("Indexing successful!\n", { status: 200 });
  }
  catch (err) {
    console.error(err);
    return new Response("Got an error while indexing, check the logs\n", { status: 500 });
  }
});
