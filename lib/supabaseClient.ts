import { PostgrestError, createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_NEW_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_NEW_SUPABASE_KEY || "";

export const mainnetSupabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    db: { schema: "mainnet" },
  }
);

export const goerliSupabaseClient = createClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    db: { schema: "goerli" },
  }
);

export function supabaseUnwrap<T>(resp: {
  data: T;
  error: PostgrestError | null;
}) {
  if (resp.error) throw resp.error;

  return resp.data;
}
