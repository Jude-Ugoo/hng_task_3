import { NextFunction, Request, Response } from "express";
import "dotenv/config";
import jwt from "jsonwebtoken";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authToken = req.headers.authorization;

  if (!authToken) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  const token = authToken.split(" ")[1]

  try {
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decodedToken) => {
        if (err) {
            return res
             .status(403)
             .json({ message: "Access denied. Invalid token." });
        }

        if (typeof decodedToken === 'object' && "userId" in decodedToken) {
            req.user = {userId: decodedToken}
            next()
        } else {
            return res.status(401).json({
                message: "Access denied. Invalid token."
            })
        }
    })
  } catch (error) {
    return res.status(403).send("Invaild token")
  }
};
