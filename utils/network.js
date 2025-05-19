// utils/network.js
const os = require('os');
require('dotenv').config();

function getBaseUrl() {
  // Use .env if set (for production/staging)
  if (process.env.BASE_URL) return process.env.BASE_URL;

  // Auto-detect for development
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces).flat()) {
    if (iface.family === 'IPv4' && !iface.internal) {
      return `http://${iface.address}:3000`;
    }
  }
  return 'http://localhost:3000'; // Fallback
}

module.exports = { getBaseUrl };