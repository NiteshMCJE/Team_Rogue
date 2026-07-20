// ===== api/data.js =====
// SIMPLE VERSION - Stores data in memory (resets on restart)

let memoryData = {
  gallery: [],
  lastUpdated: new Date().toISOString()
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET - return gallery data
  if (req.method === 'GET') {
    try {
      res.status(200).json(memoryData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to read data' });
    }
    return;
  }

  // POST - update gallery
  if (req.method === 'POST') {
    try {
      const newData = req.body;
      if (!newData) {
        res.status(400).json({ error: 'No data provided' });
        return;
      }

      memoryData = {
        gallery: newData.gallery || [],
        lastUpdated: new Date().toISOString()
      };

      res.status(200).json({ 
        success: true, 
        message: 'Data saved (in memory only)',
        data: memoryData
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update data' });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
}
