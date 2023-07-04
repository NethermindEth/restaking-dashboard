import { PostgrestError, createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseConfig = {
  mainnet: {
    supabaseUrl: process.env.NEXT_PUBLIC_NEW_SUPABASE_URL || "",
    supabaseKey: process.env.NEXT_PUBLIC_NEW_SUPABASE_KEY || "",
  },
  goerli: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_KEY || "",
  },
};

export const supabase = createClient<Database>(
  supabaseConfig.mainnet.supabaseUrl,
  supabaseConfig.mainnet.supabaseKey,
  {
    db: { schema: "mainnet" },
  }
);

export function supabaseUnwrap<T>(resp: {
  data: T;
  error: PostgrestError | null;
}) {
  if (resp.error) throw resp.error;

  return resp.data;
}
