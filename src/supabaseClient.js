import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://wezlyawvnxtyxbfjozue.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indlemx5YXd2bnh0eXhiZmpvenVlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2NTUyNzksImV4cCI6MjA2MjIzMTI3OX0.CC24ewuFCzhmZR1aVNm6DTwf6pTHQofHt16OLIg8RO0"; // NO uses la service_role aquí

export const supabase = createClient(supabaseUrl, supabaseKey);
