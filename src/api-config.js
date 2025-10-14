const isProduction = window.location.hostname !== 'localhost';

export const API_URL = isProduction 
  ? 'https://biomes-backend-production.up.railway.app'
  : 'http://localhost:3000';
