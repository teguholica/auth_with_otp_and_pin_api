class UserRepository {
  constructor() {
    this.usersByEmail = new Map(); 
  }

  async findByEmail(email) {
    return this.usersByEmail.get(email.toLowerCase()) || null;
  }

  async create(user) {
    const emailKey = user.email.toLowerCase();
    if (this.usersByEmail.has(emailKey)) throw new Error("USER_ALREADY_EXISTS");
    this.usersByEmail.set(emailKey, { ...user });
    return { ...user };
  }

  async update(email, patch) {
    const emailKey = email.toLowerCase();
    const existing = this.usersByEmail.get(emailKey);
    if (!existing) throw new Error("USER_NOT_FOUND");
    const updated = { ...existing, ...patch };
    this.usersByEmail.set(emailKey, updated);
    return { ...updated };
  }
}

module.exports = new UserRepository();
