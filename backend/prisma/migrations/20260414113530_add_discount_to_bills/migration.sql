-- Add discount column to bills table
ALTER TABLE "bills" ADD COLUMN "discount" DECIMAL(10,2) NOT NULL DEFAULT 0;
