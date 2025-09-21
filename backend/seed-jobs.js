// backend/seed-jobs.js
const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function seedJobs() {
  try {
    console.log('Starting to seed jobs data...');
    
    // Read the SQL file content
    const sqlFilePath = path.join(__dirname, 'migrations', 'seed_jobs.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      console.log('Connected to the database');
      
      // Start a transaction
      await client.query('BEGIN');
      
      // Execute the SQL content
      console.log('Executing SQL queries...');
      await client.query(sqlContent);
      
      // Commit the transaction
      await client.query('COMMIT');
      console.log('Jobs data seeded successfully');
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      console.error('Error seeding jobs data:', error);
      throw error;
    } finally {
      // Release the client
      client.release();
    }
  } catch (error) {
    console.error('Failed to seed jobs data:', error);
    process.exit(1);
  }
}

seedJobs().then(() => {
  console.log('Seed process complete');
  process.exit(0);
});