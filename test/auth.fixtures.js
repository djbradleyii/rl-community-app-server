const bcrypt = require('bcryptjs');

function makeUsersArray() {
  return [
    {
      id: 1,
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
      id: 2,
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
      id: 3,
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

function seedUsers(users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 12),
  }));
  return preppedUsers;
}

module.exports = {
  makeUsersArray,
  seedUsers,
};
