-- AlterTable
ALTER TABLE "public"."VaultItem" ADD COLUMN     "sectionId" TEXT;

-- CreateTable
CREATE TABLE "public"."VaultSection" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VaultSection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VaultSection_userId_idx" ON "public"."VaultSection"("userId");

-- CreateIndex
CREATE INDEX "VaultItem_sectionId_idx" ON "public"."VaultItem"("sectionId");

-- AddForeignKey
ALTER TABLE "public"."VaultItem" ADD CONSTRAINT "VaultItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."VaultSection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VaultSection" ADD CONSTRAINT "VaultSection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
