import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wsoqtgziaduigrrhnjkk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzb3F0Z3ppYWR1aWdycmhuamtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODE3NjE3ODIsImV4cCI6MTk5NzMzNzc4Mn0.b0EdvPtA_9EzeP1mgzfsGekk6X0DWpaWsDjJl0LoaxA";

export const supabase = createClient(supabaseUrl, supabaseKey);
