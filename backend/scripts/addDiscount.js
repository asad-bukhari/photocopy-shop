const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addDiscountColumn() {
  try {
    console.log('Adding discount column to bills table...');

    await prisma.$executeRaw`
      ALTER TABLE "bills" ADD COLUMN "discount" DECIMAL(10,2) NOT NULL DEFAULT 0
    `;

    console.log('✅ Discount column added successfully!');
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('✅ Discount column already exists');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

addDiscountColumn();
