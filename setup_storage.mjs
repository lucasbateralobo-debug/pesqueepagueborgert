import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iqkedarvwofqturehtebc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxa2VkYXJ2d29mcXR1cmh0ZWJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjIxODc3NywiZXhwIjoyMDkxNzk0Nzc3fQ.DCkhOoeAA4ezGyThIO96jndkLlOd0f0sKGE2y85tl7g';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('--- Checking/Creating Storage Buckets ---');
  
  // Create 'products' bucket if not exists
  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError.message);
    return;
  }

  const productsBucket = buckets.find(b => b.id === 'products');
  
  if (!productsBucket) {
    console.log('Creating "products" bucket...');
    const { data, error } = await supabase.storage.createBucket('products', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    
    if (error) {
      console.error('Error creating bucket:', error.message);
    } else {
      console.log('Bucket "products" created successfully!');
    }
  } else {
    console.log('Bucket "products" already exists.');
  }

  // Set up Public access policy (usually needed if not strictly 'public: true' through API)
  // Note: createBucket(..., { public: true }) generally handles the basic public access.
  console.log('--- Storage Setup Completed ---');
}

setupStorage();
