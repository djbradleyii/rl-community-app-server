const express = require('express');
const UsersService = require('./users-service');
const usersRouter = express.Router();
const bodyParser = express.json();
const logger = require('../logger');
const xss = require('xss');
const { requireAuth } = require('../middleware/jwt-auth');

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

usersRouter.route('/')
.get(requireAuth, (req, res, next) => {
    UsersService.getAllUsers(req.app.get('db'))
    .then((users) => {
      res.json(users);
    })
    .catch(next)
  })
.post(requireAuth, bodyParser, (req, res, next) => {
    const {
      fname, lname, platform, gamertag, rocket_id, rank, division, lft, email, bio, password
    } = req.body;
    const requiredFields = {
        fname, lname, platform, gamertag, rank, lft, email, password
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
      }
    }

    const passwordError = UsersService.validatePassword(password);

    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }

    UsersService.hasUserWithEmail(
      req.app.get('db'),
      email,
    )
    .then((hasUserWithEmail) => {
        if (hasUserWithEmail) {
            return res.status(400).json({ error: 'Email already taken' });
        }
        return UsersService.hashPassword(password)
            .then((hashedPassword) => {
                const newUser = {
                    fname, 
                    lname, 
                    platform, 
                    gamertag, 
                    rocket_id, 
                    rank, 
                    division, 
                    lft, 
                    email,
                    password: hashedPassword, 
                    bio
                };
            return UsersService.insertUser(
                req.app.get('db'),
                newUser,
            )
            .then((user) => {
                res
                .status(201)
                .json({ user });
            });
        });
    })
    .catch(next);
})
.patch(requireAuth, bodyParser, (req, res, next) => {
    const userid = req.user.id;
    const {
        lname, 
        platform, 
        gamertag, 
        rocket_id, 
        rank, 
        division, 
        lft, 
        bio
    } = req.body;
    const requiredFields = {
        lname, platform, gamertag, rocket_id, rank, division, lft
    };

    const numberOfValues = Object.values(requiredFields).filter(Boolean).length;
    if (numberOfValues === 0 && lft !== false) {
      return res.status(400).json({
        error: {
          message: 'Request body must contain either \'lname\', \'platform\', \'gamertag\', \'rocket_id\', \'rank\', \'division\', \'lft\'',
        },
      });
    }

    const updates = {
        lname, 
        platform, 
        gamertag, 
        rocket_id, 
        rank, 
        division, 
        lft, 
        bio
    };
    UsersService.updateUserById(req.app.get('db'), userid, updates)
      .then((numUsersAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .delete(requireAuth, (req, res, next) => {
      UsersService.deleteUser(res.app.get('db'), req.user.id)
        .then((count) => {
          if (count === 0) {
            return res.status(404).json({
              error: { message: 'User does not exist' },
            });
          }
          res
            .status(204)
            .end();
        })
        .catch(next);
      logger.info(`User with id ${req.user.id} deleted.`);
    });

    usersRouter
    .route('/:userid')
    .all(requireAuth)
    .get((req, res, next) => {
      UsersService.getUserById(
        req.app.get('db'),
        parseInt(req.params.userid),
      )
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            error: { message: 'User doesn\'t exist' },
          });
        }


        UsersService.getAllItemsByUserId(req.app.get('db'), user.id)
        .then((items) => {

          user = serializeUser(user);
          res.json({
            user: {
              id: user.id,
              gamertag: user.gamertag,
              rocket_id: user.rocket_id,
              platform: user.platform,
              rank: user.rank,
              division: user.division,
              lft: user.lft,
              bio: user.bio
            },
            inventory: items}
            );
          next();
        })
      })
      .catch(next);
    });

module.exports = usersRouter;
