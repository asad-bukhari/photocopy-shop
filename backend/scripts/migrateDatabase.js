const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    console.log('Starting migration...');

    // Create categories table
    console.log('Creating categories table...');
    await prisma.$executeRaw`
      CREATE TABLE "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert default categories
    console.log('Inserting default categories...');
    await prisma.$executeRaw`
      INSERT INTO "categories" ("name", "description") VALUES
        ('Stationery', 'Stationery items and supplies'),
        ('Printing', 'Printing services and materials'),
        ('Photocopying', 'Photocopying services'),
        ('Services', 'General services')
    `;

    // Create price_history table
    console.log('Creating price_history table...');
    await prisma.$executeRaw`
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
      )
    `;

    // Create indexes for price_history
    console.log('Creating indexes for price_history...');
    await prisma.$executeRaw`CREATE INDEX "price_history_product_id_idx" ON "price_history"("product_id")`;
    await prisma.$executeRaw`CREATE INDEX "price_history_createdAt_idx" ON "price_history"("createdAt")`;

    // Add category_id column to products with a temporary default
    console.log('Adding category_id column to products...');
    await prisma.$executeRaw`ALTER TABLE "products" ADD COLUMN "category_id" INTEGER NOT NULL DEFAULT 1`;

    // Create foreign key constraint for category
    console.log('Creating foreign key constraint...');
    await prisma.$executeRaw`
      ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey"
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    `;

    // Create index for category_id
    console.log('Creating index for category_id...');
    await prisma.$executeRaw`CREATE INDEX "products_category_id_idx" ON "products"("category_id")`;

    // Update products based on their existing category string
    console.log('Updating products with new category IDs...');
    await prisma.$executeRaw`
      UPDATE "products" SET "category_id" = (
        CASE
          WHEN "category" = 'Stationery' THEN 1
          WHEN "category" = 'Printing' THEN 2
          WHEN "category" = 'Photocopying' THEN 3
          WHEN "category" = 'Services' THEN 4
          ELSE 1
        END
      )
    `;

    // Drop the old category column
    console.log('Dropping old category column...');
    await prisma.$executeRaw`ALTER TABLE "products" DROP COLUMN "category"`;

    // Create update trigger function for categories
    console.log('Creating update trigger for categories...');
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION update_categories_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `;

    // Create trigger
    await prisma.$executeRaw`
      CREATE TRIGGER categories_updated_at
        BEFORE UPDATE ON "categories"
        FOR EACH ROW
        EXECUTE FUNCTION update_categories_updated_at()
    `;

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error executing migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
