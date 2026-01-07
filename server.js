const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, 'build')));

// Function to get folder size recursively
async function getFolderSize(folderPath) {
  let totalSize = 0;
  
  try {
    const items = await fs.readdir(folderPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(folderPath, item.name);
      
      try {
        if (item.isDirectory()) {
          totalSize += await getFolderSize(itemPath);
        } else if (item.isFile()) {
          const stats = await fs.stat(itemPath);
          totalSize += stats.size;
        }
      } catch (err) {
        // Skip files/folders we can't access
        console.warn(`Unable to access: ${itemPath}`);
      }
    }
  } catch (err) {
    console.error(`Error reading folder ${folderPath}:`, err.message);
  }
  
  return totalSize;
}

// API endpoint to scan folders
app.get('/api/scan', async (req, res) => {
  const scanPath = req.query.path || '/data';
  
  try {
    // Check if path exists
    await fs.access(scanPath);
    
    // Read all items in the directory
    const items = await fs.readdir(scanPath, { withFileTypes: true });
    
    // Filter only directories
    const folders = items.filter(item => item.isDirectory());
    
    // Get size for each folder
    const folderData = await Promise.all(
      folders.map(async (folder) => {
        const folderPath = path.join(scanPath, folder.name);
        const size = await getFolderSize(folderPath);
        
        return {
          name: folder.name,
          size: size,
          path: folderPath
        };
      })
    );
    
    // Calculate total size
    const totalSize = folderData.reduce((sum, folder) => sum + folder.size, 0);
    
    res.json({
      folders: folderData,
      totalSize: totalSize,
      path: scanPath
    });
    
  } catch (err) {
    console.error('Error scanning directory:', err);
    res.status(500).json({
      error: `Unable to scan directory: ${err.message}`
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Folder Analyzer running on port ${PORT}`);
  console.log(`Scanning path: /data`);
});
