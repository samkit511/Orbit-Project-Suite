-- Add the task creator relation that exists in the Prisma schema and app code.
ALTER TABLE "Task" ADD COLUMN "creatorId" TEXT;

UPDATE "Task"
SET "creatorId" = "Project"."createdById"
FROM "Project"
WHERE "Task"."projectId" = "Project"."id";

UPDATE "Task"
SET "creatorId" = (SELECT "id" FROM "User" WHERE "role" = 'ADMIN' LIMIT 1)
WHERE "creatorId" IS NULL;

ALTER TABLE "Task" ALTER COLUMN "creatorId" SET NOT NULL;

ALTER TABLE "Task" ADD CONSTRAINT "Task_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
