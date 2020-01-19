const TeamsService = {
    getAllUsersLookingForTeam(knex){
        return knex
            .select(
                'id',
                'fname',
                'lname',
                'platform',
                'gamertag',
                'rocket_id',
                'rank',
                'division',
                'bio',
                'lft',
                'date_created'
            )
            .from('users')
            .where('lft', true)
    }
}

module.exports = TeamsService;