// ===== api/data.js - DEBUG VERSION (Shows all errors) =====
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ============================================
  // GET - Fetch all gallery images
  // ============================================
  if (req.method === 'GET') {
    try {
      console.log('📤 GET: Fetching images from Supabase...');
      console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ MISSING');
      console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ MISSING');
      
      const { data, error } = await supabase
        .from('gallery')
        .select('url')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ GET Error:', error);
        throw error;
      }

      const images = data ? data.map(item => item.url) : [];
      console.log(`✅ GET: Found ${images.length} images`);

      res.status(200).json({
        gallery: images,
        lastUpdated: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ GET Error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch images', 
        details: error.message,
        supabase_url_set: !!process.env.SUPABASE_URL,
        supabase_key_set: !!process.env.SUPABASE_ANON_KEY
      });
    }
    return;
  }

  // ============================================
  // POST - Upload a new image
  // ============================================
  if (req.method === 'POST') {
    try {
      console.log('📥 POST: Starting upload...');
      console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ MISSING');
      console.log('SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ MISSING');
      
      const { image } = req.body;
      
      if (!image) {
        console.log('❌ POST: No image provided');
        res.status(400).json({ error: 'No image provided' });
        return;
      }

      console.log('📥 POST: Image received, size:', image.length);

      // Check if image is valid base64
      if (!image.startsWith('data:image/')) {
        console.log('❌ POST: Invalid image format');
        res.status(400).json({ error: 'Invalid image format' });
        return;
      }

      // Convert base64 to buffer
      const base64Data = image.split(',')[1];
      if (!base64Data) {
        console.log('❌ POST: No base64 data found');
        res.status(400).json({ error: 'Invalid image data' });
        return;
      }

      const buffer = Buffer.from(base64Data, 'base64');
      console.log('📥 POST: Buffer size:', buffer.length, 'bytes');

      // Generate unique filename
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(7);
      const fileName = `gallery/${timestamp}-${randomString}.png`;
      
      console.log('📥 POST: Uploading to storage:', fileName);

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, buffer, {
          contentType: 'image/png',
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('❌ POST Upload Error:', uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      console.log('✅ POST: Upload successful!');

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

      console.log('📥 POST: Public URL:', publicUrl);

      // Save URL to database
      const { error: insertError } = await supabase
        .from('gallery')
        .insert({ 
          url: publicUrl,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ POST Insert Error:', insertError);
        throw new Error(`Database insert failed: ${insertError.message}`);
      }

      console.log('✅ POST: Database insert successful!');

      // Get all images to return updated list
      const { data: allImages, error: fetchError } = await supabase
        .from('gallery')
        .select('url')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('❌ POST Fetch Error:', fetchError);
        throw fetchError;
      }

      const images = allImages ? allImages.map(item => item.url) : [];

      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully!',
        gallery: images
      });
    } catch (error) {
      console.error('❌ POST Error:', error);
      res.status(500).json({ 
        error: 'Failed to upload image', 
        details: error.message,
        supabase_url_set: !!process.env.SUPABASE_URL,
        supabase_key_set: !!process.env.SUPABASE_ANON_KEY
      });
    }
    return;
  }

  // ============================================
  // DELETE - Remove an image
  // ============================================
  if (req.method === 'DELETE') {
    try {
      const { url } = req.body;
      
      if (!url) {
        res.status(400).json({ error: 'No URL provided' });
        return;
      }

      console.log('🗑️ DELETE: Deleting image:', url);

      // Extract filename from URL
      const fileName = url.split('/').pop();
      
      if (!fileName) {
        throw new Error('Invalid URL format');
      }

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('images')
        .remove([`gallery/${fileName}`]);

      if (deleteError) {
        console.error('Storage Delete Error:', deleteError);
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('gallery')
        .delete()
        .eq('url', url);

      if (dbError) {
        throw new Error(`Database delete failed: ${dbError.message}`);
      }

      console.log('✅ DELETE: Image deleted successfully');

      // Get all images
      const { data: allImages, error: fetchError } = await supabase
        .from('gallery')
        .select('url')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const images = allImages ? allImages.map(item => item.url) : [];

      res.status(200).json({
        success: true,
        message: 'Image deleted successfully!',
        gallery: images
      });
    } catch (error) {
      console.error('DELETE Error:', error);
      res.status(500).json({ 
        error: 'Failed to delete image', 
        details: error.message 
      });
    }
    return;
  }

  res.status(405).json({ 
    error: 'Method not allowed',
    allowed: ['GET', 'POST', 'DELETE', 'OPTIONS']
  });
}
