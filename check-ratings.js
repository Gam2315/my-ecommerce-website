const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRatings() {
  const { data, error } = await supabase.from('product_ratings').select('*');
  console.log(JSON.stringify({ data, error }, null, 2));
}

checkRatings();
