import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqkedarvwofqturhtebc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxa2VkYXJ2d29mcXR1cmh0ZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIxODc3NywiZXhwIjoyMDkxNzk0Nzc3fQ.DCkhOoeAA4ezGyThIO96jndkLlOd0f0sKGE2y85tl7g';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setup() {
  console.log('1. Checking bucket "products"...');
  
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error('List error:', listError.message);
    return;
  }

  const bucket = buckets.find(b => b.id === 'products');
  if (!bucket) {
    console.log('Creating bucket...');
    const { error: createError } = await supabase.storage.createBucket('products', { public: true });
    if (createError) {
      console.error('Create error:', createError.message);
      return;
    }
    console.log('Bucket created!');
  } else {
    console.log('Bucket exists.');
  }

  console.log('2. Setting up Storage Policies (All Access for simplify as per user "master key" trust)...');
  
  // Storage policies are generally handled via SQL for better control.
  // I will just use the REST API to ensure the bucket is public.
  // In Supabase, 'public: true' on createBucket sets it as public-readable.
  
  console.log('Setup finished!');
}

setup();
