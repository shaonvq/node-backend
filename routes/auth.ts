import dotenv from "dotenv";
import jwt from "express-jwt";

dotenv.config();

export function getTokenFromHeader(req) {
  if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Token" ||
      req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
    return req.headers.authorization.split(" ")[1];
  }

  return null;
}

const auth = {
    optional: jwt({
        credentialsRequired: false,
        getToken: getTokenFromHeader,
        secret: `${process.env.SECRET}`,
    }),
    required: jwt({
        getToken: getTokenFromHeader,
        secret: `${process.env.SECRET}`,
    }),
};

export default {auth, getTokenFromHeader};
