const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('Checking products...');
    const products = await prisma.product.findMany({
      include: { category: true }
    });
    console.log(`Found ${products.length} products`);

    if (products.length > 0) {
      console.log('First product:', JSON.stringify(products[0], null, 2));
    }

    console.log('\nChecking categories...');
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories`);
    console.log('Categories:', categories.map(c => ({ id: c.id, name: c.name })));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
