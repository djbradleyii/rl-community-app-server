const ItemsService = {
    getAllItems(knex){
        return knex
            .select(
                "userid",
                "gamertag", 
                "rocket_id", 
                "rank", 
                "division", 
                "lft", 
                "category", 
                "name", 
                "painted", 
                "rarity", 
                "certified", 
                "special_edition", 
                "count"
            )
            .from('items')
            .leftJoin("users", "users.id", "items.userid")
    },
    getItemById(knex, itemid){
        return knex
            .select('*')
            .from('items')
            .where('id', itemid)
            .first();
    },
    addItem(knex, newItem){
        return knex
            .insert(newItem)
            .into('items')
            .returning('*')
            .then(([item]) => item);
    },
    removeItem(knex, userid, itemid){
        return knex('items')
            .where({ userid, id: itemid })
            .delete()
    }
}

module.exports = ItemsService;