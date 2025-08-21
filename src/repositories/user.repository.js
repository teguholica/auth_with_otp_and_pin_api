const pool = require('../config/database');

class UserRepository {
  async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await pool.query(query, [email.toLowerCase()]);
    return result.rows[0] || null;
  }

  async create(user) {
    const query = `
      INSERT INTO users (email, name, password_hash, verified_at, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      user.email.toLowerCase(),
      user.name || null,
      user.passwordHash,
      user.verifiedAt || null,
      user.status
    ];

    try {
      const result = await pool.query(query, values);
      return this.mapDbToUser(result.rows[0]);
    } catch (error) {
      if (error.code === '23505') { // unique_violation
        throw new Error('USER_ALREADY_EXISTS');
      }
      throw error;
    }
  }

  async update(email, patch) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Build dynamic update query
    Object.keys(patch).forEach(key => {
      const dbKey = this.mapUserKeyToDb(key);
      fields.push(`${dbKey} = $${paramCount}`);
      values.push(patch[key]);
      paramCount++;
    });

    // Add updated_at timestamp
    fields.push(`updated_at = NOW()`);
    
    // Add email as last parameter
    values.push(email.toLowerCase());

    const query = `
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE email = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('USER_NOT_FOUND');
    }

    return this.mapDbToUser(result.rows[0]);
  }

  // Helper method to map database column names to user object keys
  mapDbToUser(dbRow) {
    if (!dbRow) return null;
    
    return {
      id: dbRow.id,
      email: dbRow.email,
      name: dbRow.name,
      passwordHash: dbRow.password_hash,
      createdAt: dbRow.created_at,
      verifiedAt: dbRow.verified_at,
      status: dbRow.status
    };
  }

  // Helper method to map user object keys to database column names
  mapUserKeyToDb(userKey) {
    const mapping = {
      email: 'email',
      name: 'name',
      passwordHash: 'password_hash',
      createdAt: 'created_at',
      verifiedAt: 'verified_at',
      status: 'status'
    };
    return mapping[userKey] || userKey;
  }
}

module.exports = new UserRepository();
