// run-migrations.js
const fs = require('fs');
const path = require('path');
const pool = require('./database');

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const MIGRATION_TABLE = 'pgmigrations';

async function getTableSchema(client) {
  // Check if the migration table exists and get its schema
  const tableCheck = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = $1
  `, [MIGRATION_TABLE]);
  
  const columns = {};
  tableCheck.rows.forEach(row => {
    columns[row.column_name] = row.data_type;
  });
  
  return {
    exists: tableCheck.rowCount > 0,
    columns
  };
}

async function ensureMigrationTableExists(client) {
  console.log('Checking migration table...');
  const schema = await getTableSchema(client);
  
  if (!schema.exists) {
    console.log('Creating migrations table...');
    await client.query(`
      CREATE TABLE ${MIGRATION_TABLE} (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        run_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    console.log('Migration table exists with columns:', Object.keys(schema.columns));
  }
}

async function getAppliedMigrations(client) {
  const result = await client.query(`SELECT name FROM ${MIGRATION_TABLE}`);
  return result.rows.map(row => row.name);
}

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting migration process...');
    await client.query('BEGIN');
    
    // Ensure migration table exists
    await ensureMigrationTableExists(client);
    
    // Get table schema to determine insert statement
    const schema = await getTableSchema(client);
    
    // Get list of migrations that have already been applied
    const appliedMigrations = await getAppliedMigrations(client);
    console.log('Applied migrations:', appliedMigrations);
    
    // Get all migration files
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort alphabetically to ensure correct order
    
    console.log('Available migration files:', migrationFiles);
    
    // Run pending migrations
    let count = 0;
    
    for (const migrationFile of migrationFiles) {
      if (!appliedMigrations.includes(migrationFile)) {
        console.log(`Running migration: ${migrationFile}`);
        
        // Read and execute the migration file
        const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
        const sql = fs.readFileSync(migrationPath, 'utf8');
        
        await client.query(sql);
        
        // Record that this migration has been applied
        // Check if 'run_on' column exists and adapt the query accordingly
        if (schema.columns.run_on) {
          await client.query(
            `INSERT INTO ${MIGRATION_TABLE} (name, run_on) VALUES ($1, NOW())`, 
            [migrationFile]
          );
        } else if (schema.columns.applied_at) {
          await client.query(
            `INSERT INTO ${MIGRATION_TABLE} (name, applied_at) VALUES ($1, NOW())`, 
            [migrationFile]
          );
        } else {
          // Just insert the name if no timestamp column is found
          await client.query(
            `INSERT INTO ${MIGRATION_TABLE} (name) VALUES ($1)`, 
            [migrationFile]
          );
        }
        
        console.log(`Migration ${migrationFile} applied successfully.`);
        count++;
      } else {
        console.log(`Migration ${migrationFile} already applied, skipping.`);
      }
    }
    
    await client.query('COMMIT');
    
    if (count > 0) {
      console.log(`Successfully applied ${count} migration(s).`);
    } else {
      console.log('No pending migrations to apply.');
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
  }
}

// Run migrations
runMigrations().then(() => {
  console.log('Migration process completed.');
  process.exit(0);
}).catch(err => {
  console.error('Migration process failed:', err);
  process.exit(1);
});