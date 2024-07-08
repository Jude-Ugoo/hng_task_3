import { Request, Response } from "express"
import { prisma } from "../utils/db"

export const getUsers =  async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany()
        console.log(users)

        res.status(200).json({
            status: "success",
            message: "Users fetched successfully",
            data: {
                users
            }
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch users",
            error
        })
    }
}

export const getUser = async (req: Request, res: Response) => {
    const { id } = req.params

    try {
        const user = await prisma.user.findUnique({
            where: {
                userId: id
            }
        })

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found in database"
            })
        }

        res.status(200).json({
            status: "success",
            message: "User fetched successfully",
            data: {
                user
            }
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Failed to fetch user",
            error
        })
    }
}