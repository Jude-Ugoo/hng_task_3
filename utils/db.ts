import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const database = async () => {
  return await prisma
    .$connect()
    .then(() => console.log("Connected"))
    .catch((err: string) => console.log("Error! " + err));
};

export { database, prisma };
