import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createClient } from "@supabase/supabase-js";

import { indexValidators } from "../utils/indexing/validators.ts";

serve(async () => {
  try {
    await indexValidators(
      createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      ),
      Deno.env.get("BEACON_PROVIDER_URL") ?? ""
    );
  
    return new Response("Indexing successful!\n", { status: 200 });
  }
  catch (err) {
    console.error(err);
    return new Response("Got an error while indexing, check the logs\n", { status: 500 });
  }
});
