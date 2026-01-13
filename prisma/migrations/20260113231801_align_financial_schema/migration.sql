/*
  Warnings:

  - You are about to drop the column `currentPrice` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `symbol` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `assets` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `historical_prices` table. All the data in the column will be lost.
  - You are about to drop the column `totalValue` on the `portfolio_snapshots` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "assets_symbol_key";

-- AlterTable
ALTER TABLE "assets" DROP COLUMN "currentPrice",
DROP COLUMN "symbol",
DROP COLUMN "type",
ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "coincap_id" TEXT,
ADD COLUMN     "coingecko_id" TEXT,
ADD COLUMN     "currency" TEXT,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "indexa_api" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "manual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platform" TEXT,
ADD COLUMN     "price_eur" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "ticker" TEXT,
ADD COLUMN     "yahoo_symbol" TEXT,
ALTER COLUMN "quantity" SET DEFAULT 0.0;

-- AlterTable
ALTER TABLE "historical_prices" DROP COLUMN "price",
ADD COLUMN     "price_eur" DOUBLE PRECISION NOT NULL DEFAULT 0.0;

-- AlterTable
ALTER TABLE "portfolio_snapshots" DROP COLUMN "totalValue",
ADD COLUMN     "asset_id" TEXT,
ADD COLUMN     "total_value_eur" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ALTER COLUMN "category" DROP NOT NULL;
