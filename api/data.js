// ===== api/data.js - MEMORY STORAGE (No GitHub needed) =====

// Simple in-memory storage (resets on Vercel restart)
let memoryData = {
  gallery: [],
  lastUpdated: new Date().toISOString()
};

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET - Return gallery data
  if (req.method === 'GET') {
    try {
      console.log('📤 Sending data:', memoryData.gallery.length, 'images');
      res.status(200).json(memoryData);
    } catch (error) {
      console.error('GET Error:', error);
      res.status(500).json({ error: 'Failed to read data' });
    }
    return;
  }

  // POST - Update gallery
  if (req.method === 'POST') {
    try {
      const newData = req.body;
      console.log('📥 Received upload:', newData.gallery ? newData.gallery.length : 0, 'images');
      
      if (!newData || !newData.gallery) {
        res.status(400).json({ error: 'No data provided' });
        return;
      }

      // Update memory
      memoryData = {
        gallery: newData.gallery || [],
        lastUpdated: new Date().toISOString()
      };

      console.log('💾 Saved:', memoryData.gallery.length, 'images');

      res.status(200).json({
        success: true,
        message: 'Data saved successfully!',
        data: memoryData
      });
    } catch (error) {
      console.error('POST Error:', error);
      res.status(500).json({ error: 'Failed to update data', details: error.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
