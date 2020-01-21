const knex = require('knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { makeUsersArray } = require('./auth.fixtures');

function seedUsers(users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 12),
  }));
  return preppedUsers;
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ email: user.email }, secret, {
    subject: user.email,
    expiresIn: process.env.JWT_EXPIRY,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}

describe('Auth Endpoints', () => {
  let db;
  const testUsers = makeUsersArray();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('clean the table', () => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));

  afterEach('clean the table', () => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));

  describe('POST /api/auth/login', () => {
    const preppedUsers = seedUsers(testUsers);
    beforeEach('insert users', () => db
      .into('users')
      .insert(preppedUsers));

    const requiredFields = ['email', 'password'];

    requiredFields.forEach((field) => {
      const loginAttemptBody = {
        email: testUser.email,
        password: testUser.password,
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it('responds 400 \'invalid user_name or password\' when bad user_name', () => {
      const userInvalidUser = { email: 'user-not', password: 'existy' };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidUser)
        .expect(400, { error: 'Incorrect email or password' });
    });

    it('responds 400 \'invalid email or password\' when bad password', () => {
      const userInvalidPass = { email: testUser.email, password: 'incorrect' };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidPass)
        .expect(400, { error: 'Incorrect email or password' });
    });

    it('responds 200 and JWT auth token using secret when valid credentials', () => {
      const userValidCreds = {
        email: testUsers[0].email,
        password: testUsers[0].password,
      };
      const expectedToken = jwt.sign(
        { userid: testUsers[0].id }, // payload
        process.env.JWT_SECRET,
        {
          subject: testUsers[0].email,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256',
        },
      );
      return supertest(app)
        .post('/api/auth/login')
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });

  describe('POST /api/auth/refresh', () => {
    const preppedUsers = seedUsers(testUsers);
    beforeEach('insert users', () => db
      .into('users')
      .insert(preppedUsers));

    it('responds 200 and JWT auth token using secret', () => {
      const expectedToken = jwt.sign(
        { userid: testUsers[0].id },
        process.env.JWT_SECRET,
        {
          subject: testUsers[0].email,
          expiresIn: process.env.JWT_EXPIRY,
          algorithm: 'HS256',
        },
      );
      return supertest(app)
        .post('/api/auth/refresh')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .expect(200, {
          authToken: expectedToken,
        });
    });
  });
});
