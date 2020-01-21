const bcrypt = require('bcryptjs');

function makeUsersArray() {
  return [
    {
      fname: 'Rick',
      lname: 'Lopez',
      platform: 'PC',
      gamertag: 'RLGamer01',
      rocket_id: 'RLGamer001#001',
      rank: 'Grand Champion',
      division: null,
      lft: true,
      email: 'rlopez@gmail.com',
      password: 'Password1!',
      bio: 'Rick Lopez\'s Bio'
    },
    {
      fname: 'Summer',
      lname: 'Lane',
      platform: 'PS4',
      gamertag: 'SLGamer01',
      rocket_id: 'SLGamer01#001',
      rank: 'Champion II',
      division: 'II',
      lft: false,
      email: 'slane@gmail.com',
      password: 'Password1!',
      bio: 'Summer Lane\'s Bio'
    },
    {
      fname: 'Larry',
      lname: 'Savage',
      platform: 'Xbox One',
      gamertag: 'LSGamer01',
      rocket_id: 'LSGamer01#001',
      rank: 'Diamond III',
      division: 'I',
      lft: true,
      email: 'lsavage@gmail.com',
      password: 'Password1!',
      bio: 'Larry Savage\'s Bio'
    }
  ];
}

function makeItemsArray() {
  return [
    {
      userid: 1,
      category: 'Body',
      name: 'Octane',
      painted: 'Crimson',
      rarity: 'Common',
      certified: null,
      special_edition: null,
      count: 1,
    },
    {
      userid: 1,
      category: 'Body',
      name: 'Octane',
      painted: 'Titanium White',
      rarity: 'Common',
      certified: 'Scorer',
      special_edition: 'Inverted',
      count: 1,
    },
    {
      userid: 2,
      category: 'Body',
      name: 'Octane',
      painted: 'Sky Blue',
      rarity: 'Common',
      certified: null,
      special_edition: null,
      count: 1,
    },
    {
      userid: 2,
      category: 'Body',
      name: 'Octane',
      painted: 'Black',
      rarity: 'Common',
      certified: null,
      special_edition: null,
      count: 1,
    },
    {
      userid: 3,
      category: 'Body',
      name: 'Octane',
      painted: null,
      rarity: 'Common',
      certified: 'Sweeper',
      special_edition: 'Inverted',
      count: 1,
    }
  ];
}

function seedUsers(users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 12),
  }));
  return preppedUsers;
}

module.exports = {
  makeUsersArray,
  makeItemsArray,
  seedUsers
};
