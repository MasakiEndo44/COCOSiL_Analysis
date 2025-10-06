-- AlterTable
ALTER TABLE "diagnosis_records" ADD COLUMN "sessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "diagnosis_records_sessionId_key" ON "diagnosis_records"("sessionId");
