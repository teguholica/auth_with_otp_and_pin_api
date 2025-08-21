class OtpRepository {
  constructor() {
    this.otpByEmail = new Map(); // fake storage
  }

  async upsert(email, record) {
    this.otpByEmail.set(email.toLowerCase(), { ...record });
    return this.otpByEmail.get(email.toLowerCase());
  }

  async get(email) {
    return this.otpByEmail.get(email.toLowerCase()) || null;
  }

  async delete(email) {
    this.otpByEmail.delete(email.toLowerCase());
  }
}

module.exports = new OtpRepository();
