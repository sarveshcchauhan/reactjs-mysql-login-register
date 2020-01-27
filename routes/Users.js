const express = require("express");
const users = express.Router();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const Users = require("../models/Users");
users.use(cors());

process.env.SECRET_KEY = "secret";

users.post("/register", (req, res) => {
  const today = new Date();
  const userData = {
    first_name: req.body.first_name,
    last_name: req.body.last_name,
    email: req.body.email,
    password: req.body.password,
    created: today
  };

  Users.findOne({
      where: {
        email: req.body.email
      }
    })
    .then(users => {
      if (!users) {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          userData.password = hash;
          Users.create(userData)
            .then(users => {
              res.json({
                status: users.email + " registered"
              });
            })
            .catch(err => {
              res.send("error: " + err);
            });
        });
      } else {
        res.json({
          error: "User already exists"
        });
      }
    })
    .catch(err => {
      res.send("error: " + err);
    });
});

users.post("/login", (req, res) => {
  Users.findOne({
      where: {
        email: req.body.email
      }
    })
    .then(users => {
      if (users) {
        if (bcrypt.compareSync(req.body.password, users.password)) {
          let token = jwt.sign(users.dataValues, process.env.SECRET_KEY, {
            expiresIn: 1440
          });
          res.send(token);
        } else {
          res.status(400).json({
            error: "Users does not exists"
          });
        }
      }
    })
    .catch(err => res.status(400).json({
      error: err
    }));
});
module.exports = users;