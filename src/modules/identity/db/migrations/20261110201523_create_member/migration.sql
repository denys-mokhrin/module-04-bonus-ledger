-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('Dev', 'QA', 'Lead', 'PM');

-- CreateTable
CREATE TABLE "member" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "teamId" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "member_teamId_displayName_key" ON "member"("teamId", "displayName");

-- AddForeignKey
ALTER TABLE "member" ADD CONSTRAINT "member_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
