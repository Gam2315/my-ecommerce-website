const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await supabase.from('product_ratings').select('*').limit(1);
  console.log("DATA:", data);
  console.log("ERROR:", error);

  // Try inserting
  const { error: insertError } = await supabase.from('product_ratings').insert({
    product_id: 'test-id',
    user_id: 'test-user',
    rating: 5
  });
  console.log("INSERT ERROR:", insertError);
}

test();
