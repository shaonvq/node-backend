import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import knex from "knex";
import redis from "redis";
import authFunctions from "../auth";
import db from "../db";

const redisClient = redis.createClient(`${process.env.REDIS_URI}`);

const emailVerifier = RegExp(/^.+@[^\.].*\.[a-z]{2,50}$/gm);
const passwordVerifier = RegExp(/^(?=.*\d).{8,50}$/gm);
const usernameVerifier = RegExp(/^(?=.*).{1,20}$/gm);

dotenv.config();

const router = express.Router();

router.get("/user/:id", authFunctions.auth.optional, (req, res, next) => {
  const token = authFunctions.getTokenFromHeader(req);
  if (req.params.id === "my") {
    redisClient.get(token, (err, reply) => {
      if (err || !reply) {
        return res.status(401).send("Unauthorized");
      }
    });
    const decoded = jwt.verify(token, process.env.SECRET);
    res.json(decoded);
  } else {
    return db
      .from("users")
      .select("*")
      .where("id", "=", req.params.id)
      .then((rows) => {
        res.json(rows[0].username);
      }).catch((err) => {console.log(err); next(); });
  }
});

router.post("/login", authFunctions.auth.optional, (req, res, next) => {
  const { email, password } = req.body;
  db.from("users")
    .select("*")
    .where("email", "=", email)
    .then((rows) => {
      bcrypt.compare(password, rows[0].hash, (err, same) => {
        if (same) {
          jwt.sign(
            {
              email: rows[0].email,
              id: rows[0].id,
              username: rows[0].username,
            },
            process.env.SECRET,
            { expiresIn: "24h" },
            (err, token) => {
              redisClient.set(token, rows[0].id);
              res.send(token);
            },
          );
        } else {
          res.status(401).send("Unauthorized");
        }
      });
    }).catch((err) => next(err) );
});

router.put("/user", authFunctions.auth.required, (req, res, next) => {
  const token = authFunctions.getTokenFromHeader(req);
  const decoded = jwt.verify(token, process.env.SECRET);
  const { username = decoded.username, email = decoded.email,
          password = req.body.new_password || req.body.current_password } = req.body;
  const emailTested = emailVerifier.test(email);
  const passwordTested = passwordVerifier.test(password);
  const usernameTested = usernameVerifier.test(username);
  redisClient.get(token, (err, reply) => {
    if (err || !reply) {
      return res.status(401).send("Unauthorized");
    }
  });
  if (usernameTested && emailTested && passwordTested) {
    if (decoded) {
      bcrypt.hash(password, 10).then((hash) => {
        db.table("users")
          .where("id", "=", decoded.id)
          .update({ hash }).then(() => {
            db.table("users")
              .where("id", "=", decoded.id)
              .update({ username }).returning("*").then(() => {
                db.table("users")
                  .where("id", "=", decoded.id)
                  .update({ email }).returning("*").then((result) => console.log("Result", result));
              });
          });
      }).catch((err) => console.log());
      res.status(201).send("Updated profile. :)");
    } else {
      res.status(401).send(":(");
    }
  } else if (!emailTested) {
    return res.status(406).send("invalid email");
  } else if (!usernameTested) {
    return res.status(406).send("invalid username");
  } else if (!passwordTested) {
    return res.status(406).send("invalid password");
  }
});

router.post("/user", authFunctions.auth.optional, (req, res, next) => {
  const { username, email, password } = req.body;

  const emailTested = emailVerifier.test(email);
  const passwordTested = passwordVerifier.test(password);
  const usernameTested = usernameVerifier.test(username);

  if (usernameTested && emailTested && passwordTested) {
    bcrypt.hash(password, 10).then((hash) => {
      db.table("users")
        .insert({ email, username, hash })
        .then(() => {
          res.status(201).send(`user created`);
        });
    });
  } else if (!emailTested) {
    return res.status(406).send("invalid email");
  } else if (!usernameTested) {
    return res.status(406).send("invalid username");
  } else if (!passwordTested) {
    return res.status(406).send("invalid password");
  }
});

export default router;
