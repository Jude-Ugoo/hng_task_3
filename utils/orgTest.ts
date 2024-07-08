import express, { NextFunction, Request, Response } from "express";
import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const app = express()

app.use(express.json())

const authenticate = (
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
  };
  

//? Route to get organisation data

app.get('/api/organisations/:orgId', authenticate, async (req: Request, res: Response) => {
    const { orgId } = req.params
    const { user } = req

    try {
        const organisation = await prisma.organisation.findUnique({
            where: { orgId },
            include: { users: true },
        })

        if (!organisation) {
            return res.status(404).json({
                status: "Not found",
                message: "Organisation not found"
            })
        }

        const userBelongsToOrg = organisation.users.some(
            orgUser => orgUser.userId === user?.userId
        )

        if (!userBelongsToOrg) {
            return res.sendStatus(403)
        }

        res.status(200).json({ data: organisation})

    } catch (error) {
        console.error(error)
        res.status(500).json({
            status: "Error",
            message: "Internal Server Error"
        })
    }
})

module.exports = app