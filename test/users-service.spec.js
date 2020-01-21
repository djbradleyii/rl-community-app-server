const knex = require('knex');
const UsersService = require('../src/users/users-service');
const { makeUsersArray, makeItemsArray } = require('./fixtures');

describe('Users service object', () => {
  let db;

  const testUsers = makeUsersArray();
  const testItems = makeItemsArray();
  const testTeams = testUsers.filter((user) => {
    return user.lft;
  })

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
  });

  before(() => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));

  afterEach(() => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));

  after(() => db.destroy());

  context('Given \'users\' has data', () => {
    beforeEach(() => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));

    beforeEach(() => db
      .into('users')
      .insert(testUsers));

    it('getAllUsers() resolves all users from \'users\' table', () => UsersService.getAllUsers(db)
      .then((res) => {
        expect(res[0].fname).to.eql(testUsers[0].fname);
        expect(res[0].lname).to.eql(testUsers[0].lname);
        expect(res[0].platform).to.eql(testUsers[0].platform);
        expect(res[0].gamertag).to.eql(testUsers[0].gamertag);
        expect(res[0].rocket_id).to.eql(testUsers[0].rocket_id);
        expect(res[0].rank).to.eql(testUsers[0].rank);
        expect(res[0].division).to.eql(testUsers[0].division);
        expect(res[0].lft).to.eql(testUsers[0].lft);
        expect(res[0].bio).to.eql(testUsers[0].bio);
      }));

    it('getUserByID() resolves a user by id from \'user\' table', () => {
      const thirdId = 3;
      const thirdTestUser = testUsers[thirdId - 1];
      return UsersService.getUserById(db, thirdId)
        .then((res) => {
          expect(res.fname).to.eql(thirdTestUser.fname);
          expect(res.lname).to.eql(thirdTestUser.lname);
          expect(res.platform).to.eql(thirdTestUser.platform);
          expect(res.gamertag).to.eql(thirdTestUser.gamertag);
          expect(res.rocket_id).to.eql(thirdTestUser.rocket_id);
          expect(res.rank).to.eql(thirdTestUser.rank);
          expect(res.division).to.eql(thirdTestUser.division);
          expect(res.lft).to.eql(thirdTestUser.lft);
          expect(res.bio).to.eql(thirdTestUser.bio);
        });
    });

    it('deleteUser() removes a user by id from \'user\' table', () => {
      const userId = 3;
      return UsersService.deleteUser(db, userId)
        .then(() => UsersService.getAllUsers(db))
        .then((allUsers) => {
          const expected = testUsers.filter((user) => user.id !== userId);
          expect(allUsers).to.have.lengthOf(2);
          expect(allUsers[0].fname).to.eql(expected[0].fname);
          expect(allUsers[0].lname).to.eql(expected[0].lname);
          expect(allUsers[0].platform).to.eql(expected[0].platform);
          expect(allUsers[0].gamertag).to.eql(expected[0].gamertag);
          expect(allUsers[0].rocket_id).to.eql(expected[0].rocket_id);
          expect(allUsers[0].rank).to.eql(expected[0].rank);
          expect(allUsers[0].division).to.eql(expected[0].division);
          expect(allUsers[0].lft).to.eql(expected[0].lft);
          expect(allUsers[0].bio).to.eql(expected[0].bio);
        });
    });

    it('updateUserById() updates a users information from \'users\' table', () => {
      const idOfUserToUpdate = 3;
      const newUserInfo = {
        bio: 'new bio coming soon',
      };
      return UsersService.updateUserById(db, idOfUserToUpdate, newUserInfo)
        .then(() => UsersService.getUserById(db, idOfUserToUpdate))
        .then((res) => {
          expect(res.fname).to.eql(testUsers[idOfUserToUpdate - 1].fname);
          expect(res.lname).to.eql(testUsers[idOfUserToUpdate - 1].lname);
          expect(res.platform).to.eql(testUsers[idOfUserToUpdate - 1].platform);
          expect(res.gamertag).to.eql(testUsers[idOfUserToUpdate - 1].gamertag);
          expect(res.rocket_id).to.eql(testUsers[idOfUserToUpdate - 1].rocket_id);
          expect(res.rank).to.eql(testUsers[idOfUserToUpdate - 1].rank);
          expect(res.division).to.eql(testUsers[idOfUserToUpdate - 1].division);
          expect(res.lft).to.eql(testUsers[idOfUserToUpdate - 1].lft);
          expect(res.bio).to.eql(newUserInfo.bio);
        });
    });
  });

  context('Given \'users\' table has no data', () => {
    beforeEach(() => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));

    it('insertUser() inserts a new user and resolves the new user with an \'id\'', () => {
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

      return UsersService.insertUser(db, newUser)
        .then((res) => {
          expect(res.fname).to.eql(newUser.fname);
          expect(res.lname).to.eql(newUser.lname);
          expect(res.platform).to.eql(newUser.platform);
          expect(res.gamertag).to.eql(newUser.gamertag);
          expect(res.rocket_id).to.eql(newUser.rocket_id);
          expect(res.rank).to.eql(newUser.rank);
          expect(res.division).to.eql(newUser.division);
          expect(res.lft).to.eql(newUser.lft);
          expect(res.bio).to.eql(newUser.bio);
        });
    });
  });
});
