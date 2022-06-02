const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const { generateId } = require('../../utils');

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({
    username,
    password,
    fullname,
  }) {
    await this.verifyNewUsername({ username });
    const id = generateId('user');
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: `INSERT INTO users
      VALUES($1,$2,$3,$4) RETURNING username, fullname`,
      values: [id, username, hashedPassword, fullname],
    };
    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new Error('field add user!');
    }
    return rows[0];
  }

  async getUserById({ id }) {
    const query = {
      text: `SELECT id, username, fullname FROM users
      WHERE id = $1`,
      values: [id],
    };
    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new Error('user not found!');
    }
    return rows[0];
  }

  async verifyNewUsername({ username }) {
    const query = {
      text: `SELECT username FROM users
      WHERE username = $1`,
      values: [username],
    };
    const { rowCount } = this._pool.query(query);
    if (!rowCount) {
      throw new Error('failed to add user, Useranme been used');
    }
  }

  async verifyUserCredential({
    username,
    password,
  }) {
    const query = {
      text: `SELECT id, password FROM users
      WHERE username = $1`,
      values: [username],
    };

    const { rows, rowCount } = await this._pool.query(query);
    if (!rowCount) {
      throw new Error('the credential incorrect');
    }
    const { id, password: hashedPassword } = rows[0];
    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new Error('the credential incorrect');
    }
    return id;
  }
}

module.exports = UsersService;
