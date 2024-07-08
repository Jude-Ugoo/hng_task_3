import { Request, Response } from "express";
import { prisma } from "../utils/db";
import * as argon2 from "argon2";
import jwt from 'jsonwebtoken';
import "dotenv/config"

export const register = async (req: Request, res: Response) => {
    const { firstName, lastName, email, password, phone } = req.body

        if (!firstName || !lastName || !email || !password) {
            return res.status(422).json({
                errors: [
                    {
                        field: "firstName",
                        message: "First name is required"
                    },
                    {
                        field: "lastName",
                        message: "Last name is required"
                    },
                    {
                        field: "email",
                        message: "Email is required"
                    },
                    {
                        field: "password",
                        message: "Password is required"
                    }
                ]
            })
        }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                email: email
            }
        })

        if (existingUser) {
            return res.status(422).json({
                errors: [
                    {
                        field: "email",
                        message: "Email already exists in database"
                    }
                ]
            })
        }

        const passwordStr = String(password)

        const hashedPassword = await argon2.hash(passwordStr)

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone
            }
        })

        //? Create default Organization
        const orgName = `${firstName}'s Organisation`
        
        await prisma.organisation.create({
            data: {
                name: orgName,
                creatorId: newUser.userId,
                users: {
                    connect: {
                        userId: newUser.userId
                    }
                }
            }
        })

        const token = jwt.sign({
            userId: newUser.userId
        }, process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "1h" })

        res.status(201).json({
            status: "success",
            message: "User registered successfully",
            data: {
                accessToken: token,
                user: { 
                    userId: newUser.userId,
                    firstName: newUser.firstName, 
                    lastName: newUser.lastName, 
                    email: newUser.email, 
                    phone: newUser.phone 
                }
            }     
        })
    } catch (err) {
        res.status(400).json({
            status:  "Bad request",
            message: "Registration unsuccessful",
            statusCode: 400
        })
        console.log(err)
    }
}

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(422).json({
            errors: [
                {
                    field: "email",
                    message: "Email is required"
                },
                {
                    field: "password",
                    message: "Password is required"
                }
            ]
        })
    }

    try {
        const user = await prisma.user.findUnique({
            where: 
                {
                    email: email
                }
        })

        if (!user) {
            return res.status(401).json({
                status: 'Bad request',
                message: 'Authentication failed',
                statusCode: 401
            });
        }

        //? Check if password is correct
        const passwordStr = String(password)
        const isPasswordValid = await argon2.verify(user.password, passwordStr)

        if (!isPasswordValid) {
            return res.status(401).json({
                status: 'Bad request',
                message: 'Authentication failed',
                statusCode: 401
            });
        }

        const token = jwt.sign({
            userId: user.userId
        }, process.env.ACCESS_TOKEN_SECRET!,
        { expiresIn: "1h" })

        res.status(200).json({
            status: "success",
            message: "User logged in successfully",
            data: {
                accessToken: token,
                user: { 
                    userId: user.userId,
                    firstName: user.firstName, 
                    lastName: user.lastName, 
                    email: user.email, 
                    phone: user.phone 
                }
            }
        })
    } catch (error) {
        res.status(500).json({
            status: "Bad request",
            message: "Server error",
            statusCode: 500
        })
    }
}

// export const logout = async (req: Request, res: Response) => {

// }