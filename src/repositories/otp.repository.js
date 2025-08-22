const pool = require('../config/database');

class OtpRepository {
  async upsert(email, record) {
    const query = `
      INSERT INTO otps (email, code, expires_at, attempts)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) 
      DO UPDATE SET 
        code = EXCLUDED.code,
        expires_at = EXCLUDED.expires_at,
        attempts = EXCLUDED.attempts,
        updated_at = NOW()
      RETURNING *
    `;
    
    const values = [
      email.toLowerCase(),
      record.code,
      record.expiresAt,
      record.attempts || 0
    ];

    const result = await pool.query(query, values);
    return this.mapDbToOtp(result.rows[0]);
  }

  async get(email) {
    const query = 'SELECT * FROM otps WHERE email = $1';
    const result = await pool.query(query, [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return this.mapDbToOtp(result.rows[0]);
  }

  async delete(email) {
    const query = 'DELETE FROM otps WHERE email = $1';
    await pool.query(query, [email.toLowerCase()]);
  }

  // Helper method to map database column names to otp object keys
  mapDbToOtp(dbRow) {
    if (!dbRow) return null;
    
    return {
      email: dbRow.email,
      code: dbRow.code,
      expiresAt: parseInt(dbRow.expires_at, 10), // Convert string to number
      attempts: parseInt(dbRow.attempts, 10) // Convert string to number
    };
  }
}

module.exports = new OtpRepository();
