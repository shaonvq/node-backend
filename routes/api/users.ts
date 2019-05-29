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

router.get("/user/:id", authFunctions.auth.required, (req, res, next) => {
  const token = authFunctions.getTokenFromHeader(req);
  return db.from("users")
    .select("*")
    .where("id", "=", req.params.id)
    .then((rows) => {
      console.log(rows[0].username);
      res.json(rows[0].username);
    });
});

router.post("/login", (req, res, next) => {
  const { username, password } = req.body;
  return db.from("users")
    .select("*")
    .where("username", "=", username)
    .then((rows) => {
      bcrypt.compare( password, rows[0].hash, (err, same) => {
        console.log(same);
        if (same) {
          jwt.sign({ user: rows[0].email }, process.env.SECRET, { expiresIn: "1h" }, (err, token) => {
              if (err) { console.log(err); }
              res.send(token);
          });
        } else {
          res.status(401).send(":(");
        }
      });
    })
    .catch((err) => next());
});

// router.put("/user", auth.required, (req, res, next) => {
//     // User.findById(req.payload.id).then(function(user){
//     //     if(!user){ return res.sendStatus(401); }

//     //     // only update fields that were actually passed...
//     //     if(typeof req.body.user.username !== 'undefined'){
//     //       user.username = req.body.user.username;
//     //     }
//     //     if(typeof req.body.user.email !== 'undefined'){
//     //       user.email = req.body.user.email;
//     //     }
//     //     if(typeof req.body.user.bio !== 'undefined'){
//     //       user.bio = req.body.user.bio;
//     //     }
//     //     if(typeof req.body.user.image !== 'undefined'){
//     //       user.image = req.body.user.image;
//     //     }
//     //     if(typeof req.body.user.password !== 'undefined'){
//     //       user.setPassword(req.body.user.password);
//     //     }

//     //     return user.save().then(function(){
//     //       return res.json({user: user.toAuthJSON()});
//     //     });
//     // }).catch(next);
// })

// router.post("/users", (req, res, next) => {
//   //   const user = new User();
//   //   user.username = req.body.user.username;
//   //   user.email = req.body.user.email;
//   //   user.setPassword(req.body.user.password);
//   //   user.save().then(() => {
//   //     return res.json({user: user.toAuthJSON()});
//   //   }).catch(next);
// });

export default router;
