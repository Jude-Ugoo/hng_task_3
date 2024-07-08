import { Router } from 'express'
import { authenticate } from '../middleware/authenticate'
import { getUsers, getUser } from '../controllers/users.controller'

const userRoute = Router()

userRoute.get('/users',  getUsers)
userRoute.get('/users/:id', authenticate, getUser)

export default userRoute