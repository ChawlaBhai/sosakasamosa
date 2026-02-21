
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://qugqnkqxvujnhdzgisrj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF1Z3Fua3F4dnVqbmhkemdpc3JqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMDQ1NDksImV4cCI6MjA4Njg4MDU0OX0.FdrdGu2om3wvpNawafoKYxh1cbHeqK5H18K0N88VqhU";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkFamily() {
    console.log("Fetching family members...");
    const { data, error } = await supabase
        .from('family_members')
        .select('*');

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Found ${data.length} members:`);
    data.forEach(m => {
        console.log(`- ${m.name} (id: ${m.id}, partner: ${m.partner_id}, parents: ${JSON.stringify(m.parent_ids)})`);
    });
}

checkFamily();
