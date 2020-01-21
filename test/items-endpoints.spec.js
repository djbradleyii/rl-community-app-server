const knex = require('knex');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = require('../src/app');
const { makeUsersArray, makeItemsArray, seedUsers, encryptEmail } = require('./fixtures');

describe('Items Endpoints', () => {
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

  describe('GET /api/items', () => {
    context('Given no users', () => {
      it('responds with 401 and Missing bearer token', () => supertest(app)
        .get('/api/items')
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
        .get('/api/items')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect((res) => {
          expect(res.body[0].category).to.eql(testItems[0].category);
          expect(res.body[0].name).to.eql(testItems[0].name);
          expect(res.body[0].painted).to.eql(testItems[0].painted);
          expect(res.body[0].rarity).to.eql(testItems[0].rarity);
          expect(res.body[0].certified).to.eql(testItems[0].certified);
          expect(res.body[0].special_edition).to.eql(testItems[0].special_edition);
        }));
    });

    context('Given an XSS attack user', () => {
      const testItem = makeItemsArray();
      const maliciousItem = {
        userid: 1,
        category: 'Body',
        name: '<img src="https://url.not.exist" onerror="alert(document.cookie);">. Not <strong>all</strong> bad.',
        painted: 'Crimson',
        rarity: 'Common',
        certified: null,
        special_edition: null
      };
      const expectedItem = {
        userid: 1,
        category: 'Body',
        name: '<img src="https://url.not.exist">. Not <strong>all</strong> bad.',
        painted: 'Crimson',
        rarity: 'Common',
        certified: null,
        special_edition: null
      };

      beforeEach(() => db
        .into('users')
        .insert(testUsers)
        .then(() => db
          .into('items')
          .insert(maliciousItem)));

      it('removes XSS attack content', () => supertest(app)
        .get('/api/items')
        .set('Authorization', makeAuthHeader(testUsers[0]))
        .expect(200)
        .expect((res) => {
          expect(res.body[0].category).to.eql(expectedItem.category);
          expect(res.body[0].name).to.eql(expectedItem.name);
          expect(res.body[0].painted).to.eql(expectedItem.painted);
          expect(res.body[0].rarity).to.eql(expectedItem.rarity);
          expect(res.body[0].certified).to.eql(expectedItem.certified);
          expect(res.body[0].special_edition).to.eql(expectedItem.special_edition);
          expect(res.body[0].count).to.eql(expectedItem.count);
        }));
    });
  });

  describe('GET /api/items', () => {
    context('Given no users', () => {
      it('responds with 404', () => {
        const userId = 123456;
        return supertest(app)
          .get('/api/items')
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

      it('responds with 200 and gets all of the items', () => {
        return supertest(app)
          .get('/api/items')
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(200)
          .expect((res) => {
            expect(res.body[0].category).to.eql(testItems[0].category);
            expect(res.body[0].name).to.eql(testItems[0].name);
            expect(res.body[0].painted).to.eql(testItems[0].painted);
            expect(res.body[0].rarity).to.eql(testItems[0].rarity);
            expect(res.body[0].certified).to.eql(testItems[0].certified);
            expect(res.body[0].special_edition).to.eql(testItems[0].special_edition);
          });
      });
    });
  });


  describe('POST /api/items', () => {
    context('Item Validation', () => {
      const testUsers = makeUsersArray();
      const preppedUsers = seedUsers(testUsers);

      beforeEach('insert users', () => db
        .into('users')
        .insert(preppedUsers));

      const requiredFields = ['category', 'name', 'rarity'];

      requiredFields.forEach((field) => {
        const newItem = {
          category: 'Body',
          name: 'Octane',
          painted: 'Crimson',
          rarity: 'Common',
          certified: null,
          special_edition: null
        };

        it(`responds with 400 and an error message when the '${field}' is missing`, () => {
          delete newItem[field];

          return supertest(app)
            .post('/api/items')
            .set('Authorization', makeAuthHeader(testUsers[0]))
            .send(newItem)
            .expect(400, {
              error: { message: `Missing '${field}' in request body` },
            });
        });
      });

    });
  });

  describe('DELETE /api/items', () => {
    context('Given no items', () => {
      it('responds with 404', () => {
        const userId = 123456;
        return supertest(app)
          .delete('/api/items')
          .set('Authorization', makeAuthHeader(testUsers[1]))
          .expect(401, { error: 'Unauthorized request' });
      });
    });

    context('Given there are users in the database', () => {
      const testUsers = makeUsersArray();

      beforeEach(() => db
        .into('users')
        .insert(testUsers)
        .then(() => db
          .into('items')
          .insert(testItems)));

      it('responds with 204 and removes the item', () => {
        const idToRemove = 1;
        return supertest(app)
          .delete('/api/items')
          .send({ itemid: idToRemove })
          .set('Authorization', makeAuthHeader(testUsers[0]))
          .expect(204)
      });
    });
  });

  describe('Protected endpoints', () => {
    beforeEach(() => db
    .into('users')
    .insert(testUsers)
    .then(() => db
      .into('items')
      .insert(testItems)));

    const protectedEndpoints = [
      {
        name: 'GET /api/items/',
        path: '/api/items/',
        method: supertest(app).get,
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
          const invalidItem = { email: 'user-not-existy', id: 1 };
          return endpoint.method(endpoint.path)
            .set('Authorization', makeAuthHeader(invalidItem))
            .expect(401, { error: 'Unauthorized request' });
        });
      });
    });
  });
});
