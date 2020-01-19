const express = require('express');
const UsersService = require('./users-service');
const usersRouter = express.Router();
const bodyParser = express.json();

usersRouter.route('/')
.get((req, res, next) => {
    UsersService.getAllUsers(req.app.get('db'))
    .then((users) => {
      res.json(users);
    })
    .catch(next)
  })
.post(bodyParser, (req, res, next) => {
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
                    password, 
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
.patch(bodyParser, (req, res, next) => {
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
    if (numberOfValues === 0) {
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
module.exports = usersRouter;
