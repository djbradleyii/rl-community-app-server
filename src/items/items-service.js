const ItemsService = {
    getAllItems(knex){
        return knex
            .select('*')
            .from('items')
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