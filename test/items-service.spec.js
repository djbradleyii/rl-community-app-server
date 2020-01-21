const knex = require('knex');
const ItemsService = require('../src/items/items-service');
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

  context('Given \'items\' has data', () => {
    beforeEach(() => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));

    beforeEach(() => db
      .into('users')
      .insert(testUsers)
      .then(() => db
      .into('items')
      .insert(testItems)
      ));

    it('getAllItems() resolves all items from \'items\' table', () => ItemsService.getAllItems(db)
      .then((res) => {
        expect(res[0].category).to.eql(testItems[0].category);
        expect(res[0].name).to.eql(testItems[0].name);
        expect(res[0].painted).to.eql(testItems[0].painted);
        expect(res[0].rarity).to.eql(testItems[0].rarity);
        expect(res[0].certified).to.eql(testItems[0].certified);
        expect(res[0].special_edition).to.eql(testItems[0].special_edition);
        expect(res[0].count).to.eql(testItems[0].count);
      }));

    it('getItemById() resolves a item by id from \'items\' table', () => {
      const thirdId = 3;
      const thirdTestItem = testItems[thirdId - 1];
      return ItemsService.getItemById(db, thirdId)
        .then((res) => {
          expect(res.category).to.eql(thirdTestItem.category);
          expect(res.name).to.eql(thirdTestItem.name);
          expect(res.painted).to.eql(thirdTestItem.painted);
          expect(res.rarity).to.eql(thirdTestItem.rarity);
          expect(res.certified).to.eql(thirdTestItem.certified);
          expect(res.special_edition).to.eql(thirdTestItem.special_edition);
          expect(res.count).to.eql(thirdTestItem.count);
        });
    });

    it('getAllItemsByUserId() resolves all items by userid from \'items\' table', () => {
      const userid = 1;
      return UsersService.getAllItemsByUserId(db, userid)
        .then((res) => {
          expect(res).to.be.an('array');
          expect(res).to.have.lengthOf(2);
        });
    });

    it('removeItem() removes a item by id from \'items\' table', () => {
      const itemId = 1;
      const userId = 1;
      return ItemsService.removeItem(db, userId, itemId)
        .then(() => UsersService.getAllItemsByUserId(db, userId))
        .then((allItems) => {
          const expected = testItems.filter((item) => item.userid === userId);
          expect(allItems).to.have.lengthOf(1);
          expect(allItems[0].category).to.eql(expected[1].category);
          expect(allItems[0].name).to.eql(expected[1].name);
          expect(allItems[0].painted).to.eql(expected[1].painted);
          expect(allItems[0].rarity).to.eql(expected[1].rarity);
          expect(allItems[0].certified).to.eql(expected[1].certified);
          expect(allItems[0].special_edition).to.eql(expected[1].special_edition);
          expect(allItems[0].count).to.eql(expected[1].count);
        });
    });
  });

  context('Given \'items\' table has no data', () => {
    beforeEach(() => db.raw('TRUNCATE teams, items, users RESTART IDENTITY CASCADE'));

    beforeEach(() => db
      .into('users')
      .insert(testUsers));


    it('addItem() inserts a new item and resolves the new item with an \'id\'', () => {
      const newItem = {
        userid: 1,
        category: 'Body',
        name: 'Octane',
        painted: 'Orange',
        rarity: 'Common',
        certified: null,
        special_edition: null,
        count: 1,
        date_created: '2020-01-20T15:59:21.683Z'
    };

      return ItemsService.addItem(db, newItem)
        .then((res) => {
          expect(res.category).to.eql(newItem.category);
          expect(res.name).to.eql(newItem.name);
          expect(res.painted).to.eql(newItem.painted);
          expect(res.rarity).to.eql(newItem.rarity);
          expect(res.certified).to.eql(newItem.certified);
          expect(res.special_edition).to.eql(newItem.special_edition);
          expect(res.count).to.eql(newItem.count);
        });
    });
  });
});
