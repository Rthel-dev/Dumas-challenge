-- AlterTable: add fullName with default for existing rows, then remove default
ALTER TABLE "users" ADD COLUMN "fullName" TEXT NOT NULL DEFAULT '';
ALTER TABLE "users" ALTER COLUMN "fullName" DROP DEFAULT;
