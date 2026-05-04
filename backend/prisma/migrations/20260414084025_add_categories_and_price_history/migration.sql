-- Create categories table
CREATE TABLE "categories" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert default categories
INSERT INTO "categories" ("name", "description") VALUES
    ('Stationery', 'Stationery items and supplies'),
    ('Printing', 'Printing services and materials'),
    ('Photocopying', 'Photocopying services'),
    ('Services', 'General services');

-- Create price_history table
CREATE TABLE "price_history" (
    "id" SERIAL PRIMARY KEY,
    "product_id" INTEGER NOT NULL,
    "old_price" DECIMAL(10,2) NOT NULL,
    "new_price" DECIMAL(10,2) NOT NULL,
    "change_reason" TEXT,
    "changed_by" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_history_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "price_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes for price_history
CREATE INDEX "price_history_product_id_idx" ON "price_history"("product_id");
CREATE INDEX "price_history_createdAt_idx" ON "price_history"("createdAt");

-- Add category_id column to products with a temporary default
ALTER TABLE "products" ADD COLUMN "category_id" INTEGER NOT NULL DEFAULT 1;

-- Create foreign key constraint for category
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Create index for category_id
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- Update products based on their existing category string
UPDATE "products" SET "category_id" = (
    CASE
        WHEN "category" = 'Stationery' THEN 1
        WHEN "category" = 'Printing' THEN 2
        WHEN "category" = 'Photocopying' THEN 3
        WHEN "category" = 'Services' THEN 4
        ELSE 1
    END
);

-- Drop the old category column
ALTER TABLE "products" DROP COLUMN "category";

-- Add relation to price_history in users table (this is implicit, no DDL needed)

-- Update the updatedAt timestamp trigger for categories
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER categories_updated_at
    BEFORE UPDATE ON "categories"
    FOR EACH ROW
    EXECUTE FUNCTION update_categories_updated_at();
