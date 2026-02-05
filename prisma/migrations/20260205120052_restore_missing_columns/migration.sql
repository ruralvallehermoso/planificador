/*
  Warnings:

  - The primary key for the `assets` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `assets` table. All the data in the column will be lost.
  - The primary key for the `historical_prices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `assetId` on the `historical_prices` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `historical_prices` table. All the data in the column will be lost.
  - The `id` column on the `historical_prices` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `portfolio_snapshots` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `portfolio_snapshots` table. All the data in the column will be lost.
  - The `id` column on the `portfolio_snapshots` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `asset_id` to the `historical_prices` table without a default value. This is not possible if the table is not empty.

*/
-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "casarural";

-- CreateEnum
CREATE TYPE "public"."ExpenseCategory" AS ENUM ('LUZ', 'AGUA', 'INTERNET', 'LAVANDERIA', 'IBI', 'OTROS');

-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'MASTER';

-- DropForeignKey
ALTER TABLE "public"."historical_prices" DROP CONSTRAINT "historical_prices_assetId_fkey";

-- DropIndex
DROP INDEX "public"."historical_prices_assetId_idx";

-- DropIndex
DROP INDEX "public"."portfolio_snapshots_userId_idx";

-- AlterTable
ALTER TABLE "public"."ClassSession" ADD COLUMN     "content" TEXT,
ADD COLUMN     "driveLink" TEXT;

-- AlterTable
ALTER TABLE "public"."ExamTemplate" ADD COLUMN     "manualSolution" TEXT,
ADD COLUMN     "testMaxScore" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
ADD COLUMN     "testPenaltyPerError" DOUBLE PRECISION NOT NULL DEFAULT 0.33,
ADD COLUMN     "testPointsPerQuestion" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "technologies" TEXT;

-- AlterTable
ALTER TABLE "public"."Subject" ADD COLUMN     "categoryId" TEXT,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "defaultDashboard" TEXT;

-- AlterTable
ALTER TABLE "public"."assets" DROP CONSTRAINT "assets_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" SET DATA TYPE VARCHAR,
ALTER COLUMN "name" SET DATA TYPE VARCHAR,
ALTER COLUMN "quantity" DROP DEFAULT,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "category" DROP DEFAULT,
ALTER COLUMN "category" SET DATA TYPE VARCHAR,
ALTER COLUMN "coincap_id" SET DATA TYPE VARCHAR,
ALTER COLUMN "coingecko_id" SET DATA TYPE VARCHAR,
ALTER COLUMN "currency" SET DATA TYPE VARCHAR,
ALTER COLUMN "image_url" SET DATA TYPE VARCHAR,
ALTER COLUMN "indexa_api" DROP NOT NULL,
ALTER COLUMN "indexa_api" DROP DEFAULT,
ALTER COLUMN "manual" DROP NOT NULL,
ALTER COLUMN "manual" DROP DEFAULT,
ALTER COLUMN "platform" SET DATA TYPE VARCHAR,
ALTER COLUMN "price_eur" DROP DEFAULT,
ALTER COLUMN "ticker" SET DATA TYPE VARCHAR,
ALTER COLUMN "yahoo_symbol" SET DATA TYPE VARCHAR,
ADD CONSTRAINT "assets_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."historical_prices" DROP CONSTRAINT "historical_prices_pkey",
DROP COLUMN "assetId",
DROP COLUMN "createdAt",
ADD COLUMN     "asset_id" VARCHAR NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "date" SET DATA TYPE DATE,
ALTER COLUMN "price_eur" DROP DEFAULT,
ADD CONSTRAINT "historical_prices_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."portfolio_snapshots" DROP CONSTRAINT "portfolio_snapshots_pkey",
DROP COLUMN "createdAt",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ALTER COLUMN "date" SET DATA TYPE DATE,
ALTER COLUMN "category" SET DATA TYPE VARCHAR,
ALTER COLUMN "userId" DROP NOT NULL,
ALTER COLUMN "asset_id" SET DATA TYPE VARCHAR,
ALTER COLUMN "total_value_eur" DROP DEFAULT,
ADD CONSTRAINT "portfolio_snapshots_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "public"."ClassLink" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "classSessionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClassLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProjectLink" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubjectNote" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NoteImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,

    CONSTRAINT "NoteImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubjectTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "materialLink" TEXT,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubjectPractice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "deliveryDate" TIMESTAMP(3),
    "statementLink" TEXT,
    "deliveryFolderLink" TEXT,
    "description" TEXT,
    "objectives" TEXT,
    "formatting" TEXT,
    "subjectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectPractice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ExamGradeReport" (
    "id" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "notes" TEXT,
    "rawData" JSONB,
    "config" JSONB,
    "graphs" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamGradeReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Internship" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "realStartDate" TIMESTAMP(3),
    "totalHours" INTEGER NOT NULL DEFAULT 120,
    "hoursPerDay" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "schedule" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workingDays" TEXT NOT NULL DEFAULT '1,2,3,4,5',

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InternshipCenter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "province" TEXT,
    "city" TEXT,
    "tutorName" TEXT,
    "tutorEmail" TEXT,
    "tutorPhone" TEXT,
    "universityTutor" TEXT,
    "internshipId" TEXT NOT NULL,

    CONSTRAINT "InternshipCenter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."InternshipLog" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "activity" TEXT NOT NULL,
    "observations" TEXT,
    "internshipId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternshipLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MasterTask" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WebhookLog" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'cloudmailin',
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."Expense" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "applicableYear" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."BusinessConfig" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "vatRate" DECIMAL(65,30) NOT NULL DEFAULT 10,
    "city" TEXT,
    "postalCode" TEXT,
    "logo" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "nss" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "position" TEXT,
    "grossSalary" DECIMAL(65,30) NOT NULL,
    "payments" INTEGER NOT NULL DEFAULT 12,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "contractType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."Guest" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "surname2" TEXT,
    "dni" TEXT NOT NULL,
    "documentType" TEXT NOT NULL DEFAULT 'D',
    "documentSupport" TEXT,
    "address" TEXT,
    "addressExtra" TEXT,
    "postalCode" TEXT,
    "municipality" TEXT,
    "municipalityName" TEXT,
    "country" TEXT NOT NULL DEFAULT 'ESP',
    "birthDate" TIMESTAMP(3),
    "nationality" TEXT,
    "sex" TEXT,
    "phone" TEXT,
    "phone2" TEXT,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VI',
    "kinship" TEXT,
    "incomeId" INTEGER,
    "sesReportId" INTEGER,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."Income" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3),
    "amount" DECIMAL(65,30) NOT NULL,
    "description" TEXT,
    "propertyType" TEXT NOT NULL DEFAULT 'BOTH',
    "nights" INTEGER NOT NULL DEFAULT 1,
    "invoiceNumber" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."Leave" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."Payslip" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "grossAmount" DECIMAL(65,30) NOT NULL,
    "netAmount" DECIMAL(65,30) NOT NULL,
    "employerCost" DECIMAL(65,30) NOT NULL,
    "details" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payslip_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."SesConfig" (
    "id" SERIAL NOT NULL,
    "codigoArrendador" TEXT NOT NULL,
    "codigoEstablecimiento" TEXT NOT NULL,
    "nombreEstablecimiento" TEXT NOT NULL,
    "tipoEstablecimiento" TEXT NOT NULL DEFAULT 'VT',
    "aplicacion" TEXT NOT NULL DEFAULT 'CasaRuralWeb',
    "sesUsername" TEXT,
    "sesPassword" TEXT,
    "direccion" TEXT NOT NULL,
    "direccionComplementaria" TEXT,
    "codigoPostal" TEXT NOT NULL,
    "codigoMunicipio" TEXT NOT NULL,
    "nombreMunicipio" TEXT NOT NULL,
    "pais" TEXT NOT NULL DEFAULT 'ESP',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SesConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."SesReport" (
    "id" SERIAL NOT NULL,
    "referencia" TEXT NOT NULL,
    "fechaContrato" TIMESTAMP(3) NOT NULL,
    "fechaEntrada" TIMESTAMP(3) NOT NULL,
    "fechaSalida" TIMESTAMP(3) NOT NULL,
    "numPersonas" INTEGER NOT NULL,
    "numHabitaciones" INTEGER,
    "internet" BOOLEAN NOT NULL DEFAULT true,
    "tipoPago" TEXT NOT NULL,
    "fechaPago" TIMESTAMP(3),
    "medioPago" TEXT,
    "titularPago" TEXT,
    "caducidadTarjeta" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "codigoComunicacion" TEXT,
    "codigoLote" TEXT,
    "lastError" TEXT,
    "sentAt" TIMESTAMP(3),
    "incomeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SesReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."Suministro" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "website" TEXT,
    "logoUrl" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "contractRef" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Suministro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "casarural"."SuministroInvoice" (
    "id" SERIAL NOT NULL,
    "suministroId" INTEGER NOT NULL,
    "invoiceNumber" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "pdfUrl" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuministroInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Expense" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "baseAmount" DOUBLE PRECISION NOT NULL,
    "vatAmount" DOUBLE PRECISION NOT NULL,
    "vatRate" DOUBLE PRECISION NOT NULL,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "category" "public"."ExpenseCategory" NOT NULL DEFAULT 'OTROS',
    "status" TEXT NOT NULL DEFAULT 'PENDIENTE_DE_REVISION',
    "rawText" TEXT,
    "pdfUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TFMItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TFMItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TFMConfig" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "tutor" TEXT,
    "tutorInitials" TEXT,
    "researchLine" TEXT,
    "convocatoria" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TFMConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TFMResource" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TFMResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Recipe" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "time" TEXT,
    "difficulty" TEXT,
    "servings" INTEGER,
    "imageUrl" TEXT,
    "recipeUrl" TEXT,
    "youtubeUrl" TEXT,
    "ingredients" TEXT,
    "steps" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recipe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecipeFilter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#f97316',

    CONSTRAINT "RecipeFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RecipeFilterAssignment" (
    "recipeId" TEXT NOT NULL,
    "filterId" TEXT NOT NULL,

    CONSTRAINT "RecipeFilterAssignment_pkey" PRIMARY KEY ("recipeId","filterId")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamGradeReport_examId_key" ON "public"."ExamGradeReport"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "Internship_userId_key" ON "public"."Internship"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "InternshipCenter_internshipId_key" ON "public"."InternshipCenter"("internshipId");

-- CreateIndex
CREATE INDEX "InternshipLog_internshipId_idx" ON "public"."InternshipLog"("internshipId");

-- CreateIndex
CREATE INDEX "MasterTask_userId_idx" ON "public"."MasterTask"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Employee_dni_key" ON "casarural"."Employee"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "Income_invoiceNumber_key" ON "casarural"."Income"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "SesReport_referencia_key" ON "casarural"."SesReport"("referencia");

-- CreateIndex
CREATE INDEX "TFMItem_userId_idx" ON "public"."TFMItem"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TFMConfig_userId_key" ON "public"."TFMConfig"("userId");

-- CreateIndex
CREATE INDEX "TFMResource_userId_idx" ON "public"."TFMResource"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RecipeFilter_name_key" ON "public"."RecipeFilter"("name");

-- CreateIndex
CREATE INDEX "ix_assets_id" ON "public"."assets"("id");

-- CreateIndex
CREATE INDEX "ix_historical_prices_asset_id" ON "public"."historical_prices"("asset_id");

-- CreateIndex
CREATE INDEX "ix_historical_prices_id" ON "public"."historical_prices"("id");

-- CreateIndex
CREATE INDEX "ix_portfolio_snapshots_asset_id" ON "public"."portfolio_snapshots"("asset_id");

-- CreateIndex
CREATE INDEX "ix_portfolio_snapshots_category" ON "public"."portfolio_snapshots"("category");

-- CreateIndex
CREATE INDEX "ix_portfolio_snapshots_id" ON "public"."portfolio_snapshots"("id");

-- AddForeignKey
ALTER TABLE "public"."ClassLink" ADD CONSTRAINT "ClassLink_classSessionId_fkey" FOREIGN KEY ("classSessionId") REFERENCES "public"."ClassSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProjectLink" ADD CONSTRAINT "ProjectLink_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Subject" ADD CONSTRAINT "Subject_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectNote" ADD CONSTRAINT "SubjectNote_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NoteImage" ADD CONSTRAINT "NoteImage_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "public"."SubjectNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectTopic" ADD CONSTRAINT "SubjectTopic_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubjectPractice" ADD CONSTRAINT "SubjectPractice_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ExamGradeReport" ADD CONSTRAINT "ExamGradeReport_examId_fkey" FOREIGN KEY ("examId") REFERENCES "public"."ExamTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Internship" ADD CONSTRAINT "Internship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InternshipCenter" ADD CONSTRAINT "InternshipCenter_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "public"."Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."InternshipLog" ADD CONSTRAINT "InternshipLog_internshipId_fkey" FOREIGN KEY ("internshipId") REFERENCES "public"."Internship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MasterTask" ADD CONSTRAINT "MasterTask_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casarural"."Guest" ADD CONSTRAINT "Guest_incomeId_fkey" FOREIGN KEY ("incomeId") REFERENCES "casarural"."Income"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casarural"."Guest" ADD CONSTRAINT "Guest_sesReportId_fkey" FOREIGN KEY ("sesReportId") REFERENCES "casarural"."SesReport"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casarural"."Leave" ADD CONSTRAINT "Leave_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "casarural"."Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casarural"."Payslip" ADD CONSTRAINT "Payslip_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "casarural"."Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casarural"."SesReport" ADD CONSTRAINT "SesReport_incomeId_fkey" FOREIGN KEY ("incomeId") REFERENCES "casarural"."Income"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "casarural"."SuministroInvoice" ADD CONSTRAINT "SuministroInvoice_suministroId_fkey" FOREIGN KEY ("suministroId") REFERENCES "casarural"."Suministro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TFMItem" ADD CONSTRAINT "TFMItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TFMConfig" ADD CONSTRAINT "TFMConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TFMResource" ADD CONSTRAINT "TFMResource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeFilterAssignment" ADD CONSTRAINT "RecipeFilterAssignment_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "public"."Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RecipeFilterAssignment" ADD CONSTRAINT "RecipeFilterAssignment_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "public"."RecipeFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."historical_prices_date_idx" RENAME TO "ix_historical_prices_date";

-- RenameIndex
ALTER INDEX "public"."portfolio_snapshots_date_idx" RENAME TO "ix_portfolio_snapshots_date";
