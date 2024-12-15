-- CreateEnum
CREATE TYPE "Status" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');

-- AlterTable
ALTER TABLE "List" ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'TODO';
