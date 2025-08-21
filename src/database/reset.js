const pool = require('../config/database');

async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('Resetting database...');
    
    // Drop tables in reverse order to handle foreign key constraints
    await client.query('DROP TABLE IF EXISTS otps');
    await client.query('DROP TABLE IF EXISTS users');
    
    console.log('Database reset successfully!');
  } catch (error) {
    console.error('Error resetting database:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run if called directly
if (require.main === module) {
  resetDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = resetDatabase;
