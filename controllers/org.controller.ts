import { Request, Response } from 'express'
import { prisma } from "../utils/db";

export const getOrganisations = async (req: Request, res: Response ) => {
    const userId = req.user?.userId.userId

    if (!userId) {
        return res.status(401).json({
            status: "Unauthorized",
            message: "User not authenticated"
        })
    }

    try {
        const organisations = await prisma.organisation.findMany({
            where: {
                users: {
                    some: {
                        userId: userId
                    }
                }
            }
        })

        res.status(200).json({
            status: "success",
            message: "Organisation fetched successfully",
            data: {
                organisations
            }
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error
        })
    }
}

export const getOrganisationById = async (req: Request, res: Response) =>{
    const userId = req.user?.userId.userId
    const { orgId } = req.params

    try {
        const organisation = await prisma.organisation.findUnique({
            where: { orgId },
            include: { users: true }
        })

        if (!organisation) {
            return res.status(404).json({
                status: "Not found",
                message: "Organisation not found"
            })
        }

        const isUserInOrg = organisation.users.some(user => user.userId === userId)

        if (!isUserInOrg) {
            return res.status(403).json({
                status: "Forbidden",
                message: "Access denied"
            })
        }

        res.status(200).json({
            status: "success",
            message: "Organisation fetched successfully",
            data: {
                organisation: {
                    orgId: organisation.orgId,
                    name: organisation.name,
                    description: organisation.description,
                }
            }
        })
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Internal server error",
            error
        })
    }
}

export const createOrganisation = async (req: Request, res: Response) => {
    const userId = req.user?.userId.userId
    const { name, description } = req.body

    console.log(userId)

    if (!name) {
        return res.status(422).json({
            errors: [
                {
                    field: "name",
                    message: "Name is required"
                }
            ]
        })
    }

    try {
        const newOrganisation = await prisma.organisation.create({
            data: {
                name,
                description,
                creatorId: userId,
                users: {
                    connect: {
                        userId: userId
                    }
                }
            }
        })

        res.status(201).json({
            status: "success",
            message: "Organisation created successfully",
            data: {
                organisation: {
                    orgId: newOrganisation.orgId,
                    name: newOrganisation.name,
                    description: newOrganisation.description,
                }
            }
        })
    } catch (error) {
        res.status(500).json({
            status: 'error'
        })
    }
}

export const addUserToOrganisation = async (req: Request, res: Response) => {
    const userId = req.user?.userId.userId
    const { orgId } = req.params

    if (!orgId ) {
        return res.status(422).json({
            errors: [
                {
                    field: "orgId",
                    message: "Organisation ID is required"
                }
            ]
        })
    }

    try {
       const organisation = await prisma.organisation.findUnique({
        where: { orgId },
        include: { users: true }
       })

       if (!organisation) {
        return res.status(404).json({
            status: "Not found",
            message: "Organisation not found"
        })
       }

       const isUserInOrganisation = organisation.users.some(
        (user) => user.userId === user.userId
       )

       if (!isUserInOrganisation) {
        return res.status(403).json({
            status: "Forbidden",
            message: "Access denied"
        })
       }

      //? Add user to the organisation
      await prisma.organisation.update({
        where: { orgId },
        data: {
            users: {
                connect: {
                    userId
                }
            }
        }
      })

       res.status(200).json({
        status: "success",
        message: "User added to the organisation successfully"
       })

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Internal server error"
        })
    }
}

// export const getUserOrganisation = async (req: Request, res: Response) => {
//     const userId = req.user?.userId
    
//     try {
//         const user = await prisma.user.findUnique({
//             where: { userId },
//             include: {
//                 organisations: true,
//                 createdOrganisations: true
//             }
//         })

//         if (!user) {
//             return res.status(404).json({
//                 status: "Not found",
//                 message: "User not found"
//             })
//         }

//         return res.status(200).json({
//             status: "success",
//             message: "User's organisations fetched successfully",
//             data: {
//                 organisations: user.organisations,
//                 createdOrganisations: user.createdOrganisations
//             }
//         })
//     } catch (error) {
//         return res.status(500).json({
//             status: "error",
//             message: "Internal server error",
//             error
//         })
//     }
// }