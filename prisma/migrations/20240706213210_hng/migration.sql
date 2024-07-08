/*
  Warnings:

  - You are about to drop the `_OrganisationToUser` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `creatorId` to the `Organisation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_OrganisationToUser" DROP CONSTRAINT "_OrganisationToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_OrganisationToUser" DROP CONSTRAINT "_OrganisationToUser_B_fkey";

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_OrganisationToUser";

-- CreateTable
CREATE TABLE "UserOrganisation" (
    "userId" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,

    CONSTRAINT "UserOrganisation_pkey" PRIMARY KEY ("userId","orgId")
);

-- CreateTable
CREATE TABLE "_UserOrganisations" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_UserOrganisations_AB_unique" ON "_UserOrganisations"("A", "B");

-- CreateIndex
CREATE INDEX "_UserOrganisations_B_index" ON "_UserOrganisations"("B");

-- AddForeignKey
ALTER TABLE "Organisation" ADD CONSTRAINT "Organisation_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganisation" ADD CONSTRAINT "UserOrganisation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserOrganisation" ADD CONSTRAINT "UserOrganisation_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organisation"("orgId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserOrganisations" ADD CONSTRAINT "_UserOrganisations_A_fkey" FOREIGN KEY ("A") REFERENCES "Organisation"("orgId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserOrganisations" ADD CONSTRAINT "_UserOrganisations_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
