-- AlterTable
ALTER TABLE "public"."diagnosis_records" ADD COLUMN     "clerkUserId" TEXT;

-- CreateIndex
CREATE INDEX "diagnosis_records_clerkUserId_createdAt_idx" ON "public"."diagnosis_records"("clerkUserId", "createdAt");
