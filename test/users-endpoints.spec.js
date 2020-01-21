const knex = require('knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { makeUsersArray, makeItemsArray, seedUsers, encryptEmail } = require('./fixtures');

describe('Users Endpoints', () => {
  let db;
  const testUsers = makeUsersArray();
  const testItems = makeItemsArray();
  const testTeams = testUsers.filter((user) => {
    return user.lft;
  })

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
    const token = jwt.sign({ email: user.email }, secret, {
      subject: user.email,
      algorithm: 'HS256',
    });
    return `Bearer ${token}`;
  }
  after('disconnect from db', () => db.destroy());
  before('clean the table', () => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));
  afterEach('cleanup', () => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));

  describe('GET /api/users', () => {
    context('Given no users', () => {
      it('responds with 401 and Missing bearer token', () => supertest(app)
        .get('/api/users')
        .expect(401, { error: 'Missing bearer token' }));
    });

    context('Given there are users in the database', () => {
      beforeEach(() => db
        .into('users')
        .insert(testUsers)
        .then(() => db
          .into('items')
          .insert(testItems)));

      it('responds with 200 and all of the users', () => supertest(app)
        .get('/api/users')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect((res) => {
          expect(res.body[0].fname).to.eql(testUsers[0].fname);
          expect(res.body[0].lname).to.eql(testUsers[0].lname);
          expect(res.body[0].platform).to.eql(testUsers[0].platform);
          expect(res.body[0].gamertag).to.eql(testUsers[0].gamertag);
          expect(res.body[0].rocket_id).to.eql(testUsers[0].rocket_id);
          expect(res.body[0].rank).to.eql(testUsers[0].rank);
          expect(res.body[0].division).to.eql(testUsers[0].division);
          expect(res.body[0].lft).to.eql(testUsers[0].lft);
          expect(res.body[0].bio).to.eql(testUsers[0].bio);
        }));
    });

    context('Given an XSS attack user', () => {
      const testUser = makeUsersArray();
      const maliciousUser = {
        fname: '<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.',
        lname: '<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.',
        platform: 'PC',
        gamertag: '<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.',
        rocket_id: 'malicious occupation <script>alert("xss");</script>',
        rank: 'Grand Champion',
        division: null,
        lft: true,
        email: `${testUser[0].email}`,
        password: 'Password1!',
        bio: 'malicious occupation <script>alert("xss");</script>',
        date_created: '10/10/1980'
      };
      const expectedUser = {
        fname: '<img src="https://url.not.exist">. Not <strong>all</strong> bad.',
        lname: '<img src="https://url.not.exist">. Not <strong>all</strong> bad.',
        platform: 'PC',
        gamertag: '<img src="https://url.not.exist">. Not <strong>all</strong> bad.',
        rocket_id: 'malicious occupation &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        rank: 'Grand Champion',
        division: null,
        lft: true,
        email: `${testUser[0].email}`,
        password: 'Password1!',
        bio: 'malicious occupation &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        date_created: '10/10/1980',
      };

      beforeEach('insert malicious user', () => db
        .into('users')
        .insert(maliciousUser));

      it('removes XSS attack content', () => supertest(app)
        .get('/api/users')
        .set('Authorization', makeAuthHeader(expectedUser))
        .expect(200)
        .expect((res) => {
          expect(res.body[0].fname).to.eql(expectedUser.fname);
          expect(res.body[0].lname).to.eql(expectedUser.lname);
          expect(res.body[0].platform).to.eql(expectedUser.platform);
          expect(res.body[0].gamertag).to.eql(expectedUser.gamertag);
          expect(res.body[0].rocket_id).to.eql(expectedUser.rocket_id);
          expect(res.body[0].rank).to.eql(expectedUser.rank);
          expect(res.body[0].division).to.eql(expectedUser.division);
          expect(res.body[0].lft).to.eql(expectedUser.lft);
          expect(res.body[0].bio).to.eql(expectedUser.bio);
        }));
    });
  });

  describe('GET /api/users/:user_id', () => {
    context('Given no users', () => {
      it('responds with 404', () => {
        const userId = 123456;
        return supertest(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    context('Given there are users in the database', () => {
      beforeEach(() => db
        .into('users')
        .insert(testUsers)
        .then(() => db
          .into('items')
          .insert(testItems)));

      it('responds with 200 and the specified user', () => {
        const userId = 2;
        const expectedUser = testUsers[userId - 1];
        return supertest(app)
          .get(`/api/users/${userId}`)
          .set('Authorization', makeAuthHeader(expectedUser))
          .expect(200)
          .expect((res) => {
            expect(res.body.user.platform).to.eql(expectedUser.platform);
            expect(res.body.user.gamertag).to.eql(expectedUser.gamertag);
            expect(res.body.user.rocket_id).to.eql(expectedUser.rocket_id);
            expect(res.body.user.rank).to.eql(expectedUser.rank);
            expect(res.body.user.division).to.eql(expectedUser.division);
            expect(res.body.user.lft).to.eql(expectedUser.lft);
            expect(res.body.user.bio).to.eql(expectedUser.bio);
          });
      });
    });
  });

  describe('GET /api/users', () => {
    context('Given no users', () => {
      it('responds with 404', () => {
        const userId = 123456;
        return supertest(app)
          .get('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    context('Given there are users in the database', () => {
      beforeEach(() => db
        .into('users')
        .insert(testUsers)
        .then(() => db
          .into('items')
          .insert(testItems)));

      it('responds with 200 and gets all of the items that the User added to inventory', () => {
        const userId = 2;
        const expectedUser = testUsers[userId - 1];
        const expectedItem = testItems.filter((item) => item.userid === userId);
        return supertest(app)
          .get('/api/users/stats')
          .set('Authorization', makeAuthHeader(expectedUser))
          .expect(200)
          .expect((res) => {
            expect(res.body).to.have.property('stats');
            expect(res.body).to.have.property('inventory');
            expect(res.body.stats.gamertag).to.eql(expectedUser.gamertag);
            expect(res.body.stats.rocket_id).to.eql(expectedUser.rocket_id);
            expect(res.body.stats.platform).to.eql(expectedUser.platform);
            expect(res.body.stats.rank).to.eql(expectedUser.rank);
            expect(res.body.stats.division).to.eql(expectedUser.division);
            expect(res.body.stats.lft).to.eql(expectedUser.lft);
            expect(res.body.stats.bio).to.eql(expectedUser.bio);
            expect(res.body.inventory[0].userid).to.eql(userId);
            expect(res.body.inventory[0].category).to.eql(expectedItem[0].category);
            expect(res.body.inventory[0].name).to.eql(expectedItem[0].name);
            expect(res.body.inventory[0].painted).to.eql(expectedItem[0].painted);
            expect(res.body.inventory[0].rarity).to.eql(expectedItem[0].rarity);
            expect(res.body.inventory[0].certified).to.eql(expectedItem[0].certified);
            expect(res.body.inventory[0].special_edition).to.eql(expectedItem[0].special_edition);
            expect(res.body.inventory[0].count).to.eql(expectedItem[0].count);
          });
      });
    });
  });


  describe('POST /api/users', () => {
    context('User Validation', () => {
      const testUsers = makeUsersArray();
      const preppedUsers = seedUsers(testUsers);

      beforeEach('insert users', () => db
        .into('users')
        .insert(preppedUsers));

      const requiredFields = ['fname', 'lname', 'platform', 'gamertag', 'rank', 'lft', 'email', 'password'];

      requiredFields.forEach((field) => {
        const newUser = {
          fname: 'New',
          lname: 'User',
          platform: 'PC',
          gamertag: 'NewGamer01',
          rocket_id: 'NewGamer001#001',
          rank: 'Grand Champion',
          division: null,
          lft: true,
          email: 'newUser01@gmail.com',
          password: 'Password1!',
          bio: 'New User Bio'
        };

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newUser[field];

          return supertest(app)
            .post('/api/users')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .send(newUser)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` },
            });
        });
      });

      it('responds 400 error when password starts with spaces', () => {
        const userPasswordStartsSpaces = {
          fname: 'New',
          lname: 'User',
          platform: 'PC',
          gamertag: 'NewGamer01',
          rocket_id: 'NewGamer001#001',
          rank: 'Grand Champion',
          division: null,
          lft: true,
          email: 'newUser01@gmail.com',
          password: ' 1Aa!2Bb@',
          bio: 'New User Bio'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordStartsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds 400 error when password ends with spaces', () => {
        const userPasswordEndsSpaces = {
          fname: 'New',
          lname: 'User',
          platform: 'PC',
          gamertag: 'NewGamer01',
          rocket_id: 'NewGamer001#001',
          rank: 'Grand Champion',
          division: null,
          lft: true,
          email: 'newUser01@gmail.com',
          password: '1Aa!2Bb@ ',
          bio: 'New User Bio'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordEndsSpaces)
          .expect(400, { error: 'Password must not start or end with empty spaces' });
      });

      it('responds 400 error when password isn\'t complex enough', () => {
        const userPasswordNotComplex = {
          fname: 'New',
          lname: 'User',
          platform: 'PC',
          gamertag: 'NewGamer01',
          rocket_id: 'NewGamer001#001',
          rank: 'Grand Champion',
          division: null,
          lft: true,
          email: 'newUser01@gmail.com',
          password: 'password',
          bio: 'New User Bio'
        };
        return supertest(app)
          .post('/api/users')
          .send(userPasswordNotComplex)
          .expect(400, { error: 'Password must contain 1 upper case, lower case, number and special character (!@#$%^&)' });
      });

      it('responds 400 \'Email already taken\' when email isn\'t unique', () => {
        const duplicateUser = {
          fname: 'New',
          lname: 'User',
          platform: 'PC',
          gamertag: 'NewGamer01',
          rocket_id: 'NewGamer001#001',
          rank: 'Grand Champion',
          division: null,
          lft: true,
          email: testUsers[0].email,
          password: 'Password1!',
          bio: 'New User Bio'
        };
        return supertest(app)
          .post('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send(duplicateUser)
          .expect(400, { error: 'Email already taken' });
      });
    });

    context('Happy path', () => {
      it('responds 201, serialized user, storing bcryped password', () => {
        const newUser = {
          fname: 'New',
          lname: 'User',
          platform: 'PC',
          gamertag: 'NewGamer01',
          rocket_id: 'NewGamer001#001',
          rank: 'Grand Champion',
          division: null,
          lft: true,
          email: 'NewGamer01@gmail.com',
          password: 'Password1!',
          bio: 'New User Bio'
        };
        return supertest(app)
          .post('/api/users')
          .set('Authorization', makeAuthHeader(newUser))
          .send(newUser)
          .expect(201)
          .expect((res) => {
            expect(res.body.user.gamertag).to.eql(newUser.gamertag);
            expect(res.body.user.rocket_id).to.eql(newUser.rocket_id);
            expect(res.body.user.platform).to.eql(newUser.platform);
            expect(res.body.user.rank).to.eql(newUser.rank);
            expect(res.body.user.division).to.eql(newUser.division);
            expect(res.body.user.lft).to.eql(newUser.lft);
            expect(res.body.user.bio).to.eql(newUser.bio);
          })
          .expect((res) => db
            .from('users')
            .select('*')
            .where({ id: res.body.user.id })
            .first()
            .then((row) => bcrypt.compare(newUser.password, row.password))
            .then((compareMatch) => {
              expect(compareMatch).to.be.true;
            }));
      });
    });
  });

  describe('DELETE /api/users', () => {
    context('Given no users', () => {
      it('responds with 404', () => {
        const userId = 123456;
        return supertest(app)
          .delete('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[1]))
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();

      beforeEach('insert users', () => db
        .into('users')
        .insert(testUsers));

      it('responds with 204 and removes the user', () => {
        const idToRemove = 2;
        return supertest(app)
          .delete('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[idToRemove - 1]))
          .expect(204)
          .then((res) => {
            supertest(app)
              .get('/api/users')
              .set('Authorization', makeAuthHeader(testUsers[idToRemove - 1]))
              .expect((res) => {
                expect(res.body).to.have.lengthOf(2);
              });
          });
      });
    });
  });

  describe('PATCH /api/users', () => {
    context('Given no users', () => {
      it('responds with 404', () => {
        const userId = 123456;
        return supertest(app)
          .delete('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();

      beforeEach('insert users', () => db
        .into('users')
        .insert(testUsers));

      it('responds with 204 and updates the user', () => {
        const idToUpdate = 2;
        const updateUser = {
          lname: 'Update',
          platform: 'PC',
          gamertag: 'UpdateGamer02',
          rocket_id: 'UpdateGamer002002',
          rank:'Grand Champion',
          division: null,
          lft: false
        };
        const expectedUser = {
          ...testUsers[idToUpdate - 1],
          ...updateUser,
        };
        return supertest(app)
          .patch('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[idToUpdate - 1]))
          .send(updateUser)
          .expect(204)
          .then((res) => supertest(app)
            .get('/api/users')
            .set('Authorization', makeAuthHeader(expectedUser))
            .then((res) => {
              const actual = res.body.find((user) => user.id === idToUpdate);
              expect(actual.gamertag).to.eql(expectedUser.gamertag);
              expect(actual.rocket_id).to.eql(expectedUser.rocket_id);
              expect(actual.platform).to.eql(expectedUser.platform);
              expect(actual.rank).to.eql(expectedUser.rank);
              expect(actual.division).to.eql(expectedUser.division);
              expect(actual.lft).to.eql(expectedUser.lft);
              expect(actual.bio).to.eql(expectedUser.bio);
            }));
      });

      it('responds with 400 when no required fields supplied', () => {
        const idToUpdate = 2;
        return supertest(app)
          .patch('/api/users')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: { message: 'Request body must contain either \'platform\', \'gamertag\', \'rocket_id\', \'rank\', \'division\', \'lft\'' },
          });
      });

      it('responds with 204 when updating only a subset of fields', () => {
        const idToUpdate = 2;
        const updateUser = {
          bio: 'updated bios',
        };
        const expectedUser = {
          ...testUsers[idToUpdate - 1],
          ...updateUser,
        };
        return supertest(app)
          .patch('/api/users')
          .set('Authorization', makeAuthHeader(expectedUser))
          .send({
            ...expectedUser,
            fieldToIgnore: 'should not be in GET response',
          })
          .expect(204)
          .then((res) => supertest(app)
            .get(`/api/users/${idToUpdate}`)
            .set('Authorization', makeAuthHeader(expectedUser))
            .then((res) => {
              expect(res.body.user.gamertag).to.eql(expectedUser.gamertag);
              expect(res.body.user.rocket_id).to.eql(expectedUser.rocket_id);
              expect(res.body.user.platform).to.eql(expectedUser.platform);
              expect(res.body.user.rank).to.eql(expectedUser.rank);
              expect(res.body.user.division).to.eql(expectedUser.division);
              expect(res.body.user.lft).to.eql(expectedUser.lft);
              expect(res.body.user.bio).to.eql(expectedUser.bio);
            }));
      });
    });
  });


  describe('Protected endpoints', () => {
    beforeEach('insert users', () => db
      .into('users')
      .insert(testUsers));

    const protectedEndpoints = [
      {
        name: 'GET /api/users/',
        path: '/api/users/',
        method: supertest(app).get,
      },
      {
        name: 'GET /api/users/:user_id',
        path: '/api/users/1',
        method: supertest(app).get,
      },
      {
        name: 'POST /api/auth/refresh',
        path: '/api/auth/refresh',
        method: supertest(app).post,
      },
    ];
    protectedEndpoints.forEach((endpoint) => {
      describe(endpoint.name, () => {
        it('responds 401 \'Missing bearer token\' when no bearer token', () => endpoint.method(endpoint.path)
          .expect(401, { error: 'Missing bearer token' }));

        it('responds 401 \'Unauthorized request\' when invalid JWT secret', () => {
          const validUser = testUsers[0];
          const invalidSecret = 'bad-secret';
          return endpoint.method(endpoint.path)
            .set('Authorization', makeAuthHeader(validUser, invalidSecret))
            .expect(401, { error: 'Unauthorized request' });
        });

        it('responds 401 \'Unauthorized request\' when invalid sub in payload', () => {
          const invalidUser = { email: 'user-not-existy', id: 1 };
          return endpoint.method(endpoint.path)
            .set('Authorization', makeAuthHeader(invalidUser))
            .expect(401, { error: 'Unauthorized request' });
        });
      });
    });
  });
});
