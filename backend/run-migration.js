// run-migration.js
const fs = require('fs');
const path = require('path');
const pool = require('./database');

async function runMigration() {
  try {
    console.log('Running migration to add missing columns to jobs table...');
    
    // Read the SQL file content
    const sqlFilePath = path.join(__dirname, 'migrations', 'add_missing_job_columns.sql');
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
      console.log('Migration completed successfully');
    } catch (error) {
      // Rollback in case of error
      await client.query('ROLLBACK');
      console.error('Error running migration:', error);
      throw error;
    } finally {
      // Release the client
      client.release();
    }
  } catch (error) {
    console.error('Failed to run migration:', error);
    process.exit(1);
  }
}

runMigration();