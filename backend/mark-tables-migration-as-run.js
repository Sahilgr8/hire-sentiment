// mark-tables-migration-as-run.js
const pool = require('./database');

async function markTablesAsMigrated() {
  const client = await pool.connect();
  
  try {
    console.log('Checking if tables.sql is already marked as migrated...');
    
    // Check if the migration is already marked as run
    const checkResult = await client.query(
      `SELECT * FROM pgmigrations WHERE name = 'tables.sql'`
    );
    
    if (checkResult.rowCount === 0) {
      console.log('Marking tables.sql as already migrated...');
      
      // Insert a record to show tables.sql has been run
      await client.query(
        `INSERT INTO pgmigrations (name, run_on) VALUES ('tables.sql', NOW())`
      );
      
      console.log('Successfully marked tables.sql as migrated.');
    } else {
      console.log('tables.sql is already marked as migrated.');
    }
  } catch (error) {
    console.error('Error marking tables.sql as migrated:', error);
  } finally {
    client.release();
  }
}

markTablesAsMigrated()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });