const express = require('express');
const TeamsService = require('./teams-services');
const teamsRouter = express.Router();
const xss = require('xss');

const serializeUser = (user) => ({
  id: user.id,
  fname: xss(user.fname), 
  lname: xss(user.lname), 
  platform: xss(user.platform), 
  gamertag: xss(user.gamertag), 
  rocket_id: xss(user.rocket_id), 
  rank: xss(user.rank), 
  division: xss(user.division), 
  lft: user.lft, 
  email: xss(user.email),
  password: xss(user.password), 
  bio: xss(user.bio),
  date_created: new Date(user.date_created),
});

teamsRouter.route('/')
.get((req, res, next) => {
    TeamsService.getAllUsersLookingForTeam(req.app.get('db'))
    .then((users) => {
      res.json(users);
    })
    .catch(next)
  })

module.exports = teamsRouter;
