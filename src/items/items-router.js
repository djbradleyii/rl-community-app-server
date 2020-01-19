const express = require('express');
const ItemsService = require('./items-service');
const itemsRouter = express.Router();
const bodyParser = express.json();
const { requireAuth } = require('../middleware/jwt-auth');

itemsRouter.route('/')
.get(requireAuth, (req, res, next) => {
  ItemsService.getAllItems(req.app.get('db'))
  .then((items) => {
    res.json(items);
  })
})
.post(requireAuth, bodyParser, (req, res, next) => {
    const { category, item, painted, rarity, certified, special_edition } = req.body;

    userid = req.user.id;

    const requiredFields = {
        userid, category, item, rarity,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    const newItem = {
        userid, 
        category, 
        item, 
        painted, 
        rarity, 
        certified, 
        special_edition
    }
    ItemsService.addItem(req.app.get('db'), newItem)
    .then((item) => {
      res.json(item);
    })
    .catch(next)
  })
  .delete(requireAuth, (req, res, next) => {
      const { itemid } = req.body; 

      ItemsService.removeItem(res.app.get('db'), req.user.id, itemid)
        .then((count) => {
          if (count === 0) {
            return res.status(404).json({
              error: { message: 'Item does not exist' },
            });
          }
          res
            .status(204)
            .end();
        })
        .catch(next);
      logger.info(`Item with id ${itemid} deleted.`);
    });



module.exports = itemsRouter;
