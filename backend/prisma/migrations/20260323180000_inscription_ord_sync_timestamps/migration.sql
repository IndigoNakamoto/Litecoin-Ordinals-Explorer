-- AlterTable
ALTER TABLE "Inscription" ADD COLUMN     "ordSyncedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Inscription_ordSyncedAt_idx" ON "Inscription"("ordSyncedAt");
