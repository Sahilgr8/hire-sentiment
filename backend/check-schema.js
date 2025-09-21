// backend/check-schema.js
const pool = require('./database');

async function checkSchema() {
  try {
    console.log('Checking database schema...');
    
    // Connect to the database
    const client = await pool.connect();
    
    try {
      console.log('Connected to the database');
      
      // Get table columns for jobs table
      const result = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'jobs'
        ORDER BY ordinal_position;
      `);
      
      console.log('Jobs table columns:');
      if (result.rows.length === 0) {
        console.log('No columns found. The jobs table might not exist.');
      } else {
        result.rows.forEach(col => {
          console.log(`- ${col.column_name}: ${col.data_type}`);
        });
      }
      
      // Also check if the table exists at all
      const tablesResult = await client.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
      `);
      
      console.log('\nAll tables in database:');
      tablesResult.rows.forEach(table => {
        console.log(`- ${table.table_name}`);
      });
      
    } catch (error) {
      console.error('Error checking schema:', error);
    } finally {
      // Release the client
      client.release();
    }
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
}

checkSchema().then(() => {
  console.log('Schema check complete');
  process.exit(0);
});