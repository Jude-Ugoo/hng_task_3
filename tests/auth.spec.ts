import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import "dotenv/config";
import { prisma } from "../utils/db";
import request from "supertest";
import { hashPassword } from "../utils/authUtils";
import app from "../server";

describe("Authentication Endpoints", () => {
  beforeAll(async () => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }

    await prisma.organisation.deleteMany();
    await prisma.user.deleteMany();

    await app.listen(0);
  });

  afterEach(async () => {
    // Optionally clean up after each test to avoid state leakage
    await prisma.organisation.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /auth/register", () => {
    it("should register a user successfully with default organisation", async () => {
      const response = await request(app).post("/auth/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "Password123!",
        phone: "123-456-7890",
      });

      console.log(response.body);
      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        status: "success",
        message: "User registered successfully",
        data: {
          user: {
            userId: expect.any(String),
            firstName: "John",
            lastName: "Doe",
            // email: "john.doe@example.com",
          },
          accessToken: expect.any(String),
        },
      });

      const userInDb = await prisma.user.findUnique({
        where: { email: "john.doe@example.com" },
        include: { organisations: true },
      });

      expect(userInDb).toBeTruthy();
      expect(userInDb?.organisations).toHaveLength(1);
      expect(userInDb?.organisations[0].name).toBe("John's Organisation");
    });

    it("should return error if email already exists", async () => {
      // Create a user first
      await request(app).post("/auth/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "Password123!",
        phone: "123-456-7890",
      });

      // Try to register another user with the same email
      const response = await request(app).post("/auth/register").send({
        firstName: "Jane",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "Password123!",
        phone: "987-654-3210",
      });

      console.log(response.body);
      expect(response.status).toBe(422);
      expect(response.body).toMatchObject({
        errors: [
          {
            field: "email",
            message: "Email already exists in database",
          },
        ],
      });
    });
  });

  describe("POST /auth/login", () => {
    it("should log the user in successfully", async () => {
      // Ensure the user is created with a hashed password
      const hashedPassword = await hashPassword("Password123!");

      await prisma.user.create({
        data: {
          firstName: "John",
          lastName: "Doe",
          email: "john.doe@example.com",
          password: hashedPassword,
          phone: "123-456-7890",
        },
      });

      const response = await request(app).post("/auth/login").send({
        email: "john.doe@example.com",
        password: "Password123!",
      });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: "success",
        message: "User logged in successfully",
        data: {
          user: {
            email: "john.doe@example.com",
          },
          accessToken: expect.any(String),
        },
      });
    });

    it("should fail if credentials are invalid", async () => {
      const response = await request(app).post("/auth/login").send({
        email: "john.doe@example.com",
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body).toMatchObject({
        status: "Bad request",
        message: "Authentication failed",
      });
    });
  });
});
