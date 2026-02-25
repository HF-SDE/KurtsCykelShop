/*
  Warnings:

  - Added the required column `purchasePrice` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "purchasePrice" INTEGER NOT NULL;
