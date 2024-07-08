import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import "dotenv/config";
import { prisma } from "../utils/db";
import jwt from "jsonwebtoken";
import request from "supertest";
import { hashPassword } from "../utils/authUtils";
import app from "../server";

describe("Organisation Endpoints", () => {
  let userToken: string;
  let userId: string;

  beforeAll(async () => {
    if (!process.env.ACCESS_TOKEN_SECRET) {
      throw new Error("ACCESS_TOKEN_SECRET is not defined");
    }

    await prisma.organisation.deleteMany();
    await prisma.user.deleteMany();

    // Create a user and get a token
    const hashedPassword = await hashPassword("Password123!");
    const user = await prisma.user.create({
      data: {
        firstName: "John Doe",
        lastName: "Smith",
        email: "john.smith@example.com",
        password: hashedPassword,
        phone: "08012345678",
      },
    });

    userId = user.userId;
    userToken = jwt.sign(
      { userId: user.userId },
      process.env.ACCESS_TOKEN_SECRET!,
      { expiresIn: "1hr" }
    );
  });

  afterAll(async () => {
    await prisma.organisation.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.organisation.deleteMany();
  });

  describe("GET /api/organisations", () => {
    it("should get all organisations the user belongs to", async () => {
      const response = await request(app)
        .get("/api/organisations")
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.organisations).toEqual(expect.any(Array));
    });
  });

  describe("Get /api/organisations/:orgId", () => {
    let organisationId: string;

    beforeAll(async () => {
      const organisation = await prisma.organisation.create({
        data: {
          name: "Test Organisation",
          description: "This is a test organisation",
          creatorId: userId,
          users: {
            connect: {
              userId: userId,
            },
          },
        },
      });
      organisationId = organisation.orgId;
    });

    it("should get a single organisation record", async () => {
      const response = await request(app)
        .get(`/api/organisations/${organisationId}`)
        .set("Authorization", `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toMatchObject({
        orgId: organisationId,
        name: "Test Organisation",
        description: "This is a test organisation",
      });
    });
  });

  describe("POST /api/organisations", () => {
    it("should create a new organisation record", async () => {
      const response = await request(app)
        .post("/api/organisations")
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          name: "New Organisation",
          description: "This is a new test organisation",
        });
      expect(response.status).toBe(201);
      expect(response.body.data).toMatchObject({
        name: "New Organisation",
        description: "This is a new test organisation",
        orgId: "efe18501-86e0-49a0-852a-2e3d1aa6d9e1"
      });
    });
  });

  describe("POST /api/organisations/:orgId/users", () => {
    let newOrganisationId: string;

    beforeAll(async () => {
      const organisation = await prisma.organisation.create({
        data: {
          name: "Test Organisation",
          description: "This is a test organisation",
          creatorId: userId,
          users: {
            connect: {
              userId: userId,
            },
          },
        },
      });
      newOrganisationId = organisation.orgId;
    });

    it("should add a user to the organisation", async () => {
      const response = await request(app)
        .post(`/api/organisations/${newOrganisationId}/users`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({
          userId,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        "User added to organisation successfully"
      );
      expect(response.body.data).toMatchObject({
        orgId: newOrganisationId,
        userId: userId,
      });
    });
  });
});
