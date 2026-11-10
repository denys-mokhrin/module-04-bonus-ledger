-- CreateTable
CREATE TABLE "reviewer" (
    "id" UUID NOT NULL,
    "companyId" UUID NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "reviewer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reviewer_companyId_email_key" ON "reviewer"("companyId", "email");
