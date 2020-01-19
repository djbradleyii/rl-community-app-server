const express = require('express');
const TeamsService = require('./teams-services');
const teamsRouter = express.Router();
const { requireAuth } = require('../middleware/jwt-auth');

teamsRouter.route('/')
.get(requireAuth, (req, res, next) => {
    TeamsService.getAllUsersLookingForTeam(req.app.get('db'))
    .then((users) => {
      res.json(users);
    })
    .catch(next)
  })

module.exports = teamsRouter;
