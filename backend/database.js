// backend/database.js
const { Pool } = require('pg');
require('dotenv').config(); // Load .env variables if available

// Use environment variables if available, otherwise use default Docker Compose values
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'hiresentiment',
});

module.exports = pool;