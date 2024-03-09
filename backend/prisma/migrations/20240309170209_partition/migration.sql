-- CreateEnum
CREATE TYPE "InscribeStatus" AS ENUM ('PENDING', 'QUEUED', 'UNCONFIRMED', 'INSCRIBED', 'FAILED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('BASIC', 'ADMIN');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "Role" "Role" NOT NULL DEFAULT 'BASIC',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UpdateProgress" (
    "progress_key" TEXT NOT NULL,
    "last_processed_block" INTEGER NOT NULL,
    "last_processed_page" INTEGER NOT NULL,

    CONSTRAINT "UpdateProgress_pkey" PRIMARY KEY ("progress_key")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletAccount" (
    "id" SERIAL NOT NULL,
    "walletId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "confirmed" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "unconfirmed" INTEGER NOT NULL,

    CONSTRAINT "WalletAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "location" TEXT,
    "url" TEXT,
    "bio" TEXT,
    "avatarUrl" TEXT,
    "socials" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Social" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "socialLink" TEXT NOT NULL,

    CONSTRAINT "Social_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "InscribeStatus" "InscribeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCredit" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discountPercentage" DOUBLE PRECISION,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3) NOT NULL,
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,

    CONSTRAINT "UserCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserCodeUse" (
    "id" SERIAL NOT NULL,
    "userCodeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserCodeUse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inscription" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "content_length" INTEGER NOT NULL,
    "content_type" TEXT NOT NULL,
    "script_pubkey" TEXT NOT NULL,
    "metadata" TEXT,
    "content_type_type" TEXT,
    "charms" TEXT[],
    "genesis_address" TEXT,
    "genesis_fee" INTEGER NOT NULL,
    "genesis_height" INTEGER NOT NULL,
    "inscription_number" INTEGER NOT NULL,
    "inscription_id" TEXT NOT NULL,
    "next" TEXT,
    "output_value" BIGINT NOT NULL,
    "parent" TEXT,
    "children" TEXT[],
    "previous" TEXT,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "rune" TEXT,
    "sat" TEXT,
    "satpoint" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "walletAccountId" INTEGER,
    "nsfw" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Inscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InscriptionStats" (
    "id" SERIAL NOT NULL,
    "totalGenesisFee" BIGINT NOT NULL DEFAULT 0,
    "totalContentLength" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InscriptionStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTypeCount" (
    "id" SERIAL NOT NULL,
    "contentType" TEXT NOT NULL,
    "count" BIGINT NOT NULL DEFAULT 0,
    "InscriptionStatsId" INTEGER NOT NULL,

    CONSTRAINT "ContentTypeCount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentTypeTypeCount" (
    "id" SERIAL NOT NULL,
    "contentTypeType" TEXT NOT NULL,
    "count" BIGINT NOT NULL DEFAULT 0,
    "InscriptionStatsId" INTEGER NOT NULL,

    CONSTRAINT "ContentTypeTypeCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userId_key" ON "Wallet"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAccount_address_key" ON "WalletAccount"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_userId_key" ON "Setting"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_userId_key" ON "Invoice"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceId_key" ON "Invoice"("invoiceId");

-- CreateIndex
CREATE UNIQUE INDEX "UserCode_code_key" ON "UserCode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_inscription_number_key" ON "Inscription"("inscription_number");

-- CreateIndex
CREATE UNIQUE INDEX "Inscription_inscription_id_key" ON "Inscription"("inscription_id");

-- CreateIndex
CREATE INDEX "Inscription_content_length_content_type_genesis_fee_genesis_idx" ON "Inscription"("content_length", "content_type", "genesis_fee", "genesis_height", "inscription_number", "content_type_type");

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletAccount" ADD CONSTRAINT "WalletAccount_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Social" ADD CONSTRAINT "Social_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Setting" ADD CONSTRAINT "Setting_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCredit" ADD CONSTRAINT "UserCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCode" ADD CONSTRAINT "UserCode_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCodeUse" ADD CONSTRAINT "UserCodeUse_userCodeId_fkey" FOREIGN KEY ("userCodeId") REFERENCES "UserCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCodeUse" ADD CONSTRAINT "UserCodeUse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inscription" ADD CONSTRAINT "Inscription_walletAccountId_fkey" FOREIGN KEY ("walletAccountId") REFERENCES "WalletAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTypeCount" ADD CONSTRAINT "ContentTypeCount_InscriptionStatsId_fkey" FOREIGN KEY ("InscriptionStatsId") REFERENCES "InscriptionStats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentTypeTypeCount" ADD CONSTRAINT "ContentTypeTypeCount_InscriptionStatsId_fkey" FOREIGN KEY ("InscriptionStatsId") REFERENCES "InscriptionStats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
