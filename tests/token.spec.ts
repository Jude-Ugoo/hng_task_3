import jwt from 'jsonwebtoken';
import "dotenv/config"
import { describe, it, expect } from '@jest/globals';


describe('Token Generation', () => {
    it('should generate a token with correct user details and expiration', () => {
        const user = {
            userId:  '123',
            email:  'test@test.com',
        }

        const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1hr' })

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET! as string) as any

        //? Check user details
        expect(decodedToken.userId).toBe(user.userId)
        expect(decodedToken.email).toBe(user.email)

        //? Check token expiration
        expect(decodedToken.exp).toBeDefined()
    })
})