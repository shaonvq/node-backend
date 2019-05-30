import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import errorhandler from "errorhandler";
import express from "express";
import ejwt from "express-jwt";
import session from "express-session";
import methodOverride from "method-override";
import morgan from "morgan";
import routes from "./routes";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

// Create global app object
const app = express();

app.use(cors());

// Normal express config defaults
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(methodOverride());
app.use(express.static(__dirname + "/public"));

app.use(routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handlers

if (!isProduction) {
  app.use(errorhandler());
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({errors: {
    error: {},
    message: err.message,
  }});
});

// finally, let's start our server...
const server = app.listen( process.env.PORT || 3333, () => {
  console.log(`Listening on port ${process.env.PORT}`);
});
