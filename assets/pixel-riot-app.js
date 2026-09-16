import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
const SUPABASE_URL = "https://kklarbwjgyxqhculbluy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtrbGFyYndqZ3l4cWhjdWxidXk",;
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);