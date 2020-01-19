const ItemsService = {
    addItem(knex, newItem){
        return knex
            .insert(newItem)
            .into('items')
            .returning('*')
    },
    removeItem(knex, userid, itemid){
        return knex('items')
            .where({ userid, id: itemid })
            .delete()
    }
}

module.exports = ItemsService;