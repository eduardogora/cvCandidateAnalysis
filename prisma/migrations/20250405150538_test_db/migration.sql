/*
  Warnings:

  - Made the column `graduationYear` on table `Education` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Education" ALTER COLUMN "graduationYear" SET NOT NULL;

-- AlterTable
ALTER TABLE "Experience" ALTER COLUMN "currentTitle" DROP NOT NULL;
