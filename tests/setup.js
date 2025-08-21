const pool = require('../src/config/database');
const resetDatabase = require('../src/database/reset');
const initializeDatabase = require('../src/database/init');

// Global test setup
beforeAll(async () => {
  // Ensure database is properly initialized
  try {
    await resetDatabase();
    await initializeDatabase();
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
});

// // Clean up between tests
// afterEach(async () => {
//   // Clear test data but keep structure
//   try {
//     await pool.query('DELETE FROM otps');
//     await pool.query('DELETE FROM users');
//   } catch (error) {
//     console.error('Test cleanup failed:', error);
//   }
// });

// Global teardown
afterAll(async () => {
  try {
    await pool.end();
  } catch (error) {
    console.error('Test teardown failed:', error);
  }
});
