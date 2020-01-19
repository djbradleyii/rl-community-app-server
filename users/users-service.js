const UsersService = {
  getAllUsers(knex) {
    return knex.select(
      'id',
      'fname',
      'lname',
      'platform',
      'email',
      'gamertag',
      'rocket_id',
      'rank',
      'division',
      'lft',
      'bio'
    )
      .from('users');
  },
  getUserById(knex, userid){
      return knex.select(
        'id',
        'fname',
        'lname',
        'platform',
        'email',
        'gamertag',
        'rocket_id',
        'rank',
        'division',
        'lft',
        'bio'
      )
      .from('users')
      .where('id', userid)
      .first();
  }
};

module.exports = UsersService;
