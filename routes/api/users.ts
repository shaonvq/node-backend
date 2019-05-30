import bcrypt from "bcrypt";
import dotenv from "dotenv";
import express from "express";
import jwt from "jsonwebtoken";
import knex from "knex";
import authFunctions from "../auth";

dotenv.config();

const db = knex({
  client: "pg",
  connection: {
    database: "postgres",
    host: "127.0.0.1",
    password: process.env.POSTGRES_PASSWORD,
    user: "postgres",
  },
});

const router = express.Router();

router.get("/user/:id", authFunctions.auth.optional, (req, res, next) => {
  const token = authFunctions.getTokenFromHeader(req);
  if (req.params.id === "my") {
    const decoded = jwt.verify(token, process.env.SECRET);
    res.json(decoded);
  } else {
    return db
    .from("users")
    .select("*")
    .where("id", "=", req.params.id)
    .then((rows) => {
      console.log(rows[0].username);
      res.json(rows[0].username);
    });
  }
});

router.post("/login", authFunctions.auth.optional, (req, res, next) => {
  const { username, password } = req.body;
  return db
    .from("users")
    .select("*")
    .where("username", "=", username)
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
            { expiresIn: "1h" },
            (err, token) => {
              res.send(token);
            },
          );
        } else {
          res.status(401).send(":(");
        }
      });
    })
    .catch((err) => console.log());
});

router.put("/user", authFunctions.auth.required, (req, res, next) => {
  if (0) {
    return res.sendStatus(401);
  }

  // only update fields that were actually passed...
});

router.post("/users", (req, res, next) => {
  //   const user = new User();
  //   user.username = req.body.user.username;
  //   user.email = req.body.user.email;
  //   user.setPassword(req.body.user.password);
  //   user.save().then(() => {
  //     return res.json({user: user.toAuthJSON()});
  //   }).catch(next);
});

export default router;
