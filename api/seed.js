const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash the PIN
  const hashedPin = await bcrypt.hash('1234', 10);

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  let admin;
  if (existingAdmin) {
    // Update existing admin to use hashed PIN and username
    admin = await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        pin: hashedPin,
        username: 'admin'
      }
    });
    console.log('✅ Updated admin user PIN to hashed format');
  } else {
    // Create new admin user with hashed PIN
    admin = await prisma.user.create({
      data: {
        username: 'admin',
        pin: hashedPin,
        name: 'Admin User',
        role: 'admin',
        isActive: true
      }
    });
    console.log('✅ Created admin user:', { username: 'admin', pin: '1234', name: admin.name, role: admin.role });
  }

  console.log('✅ Created admin user:', { pin: '1234', name: admin.name, role: admin.role });

  // Create default shop configuration
  const shop = await prisma.shop.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Photocopy Shop',
      phone: '+92 XXX XXXXXXX',
      email: 'info@photocopyshop.pk',
      isActive: true
    }
  });

  console.log('✅ Created shop configuration:', { name: shop.name });

  // Create sample categories with products
  const categories = [
    {
      name: 'Stationery',
      products: [
        { name: 'Pen (Blue)', price: 5, cost: 3, stock: 100 },
        { name: 'Pen (Black)', price: 5, cost: 3, stock: 100 },
        { name: 'Pencil', price: 3, cost: 2, stock: 150 },
        { name: 'Notebook (200 pages)', price: 50, cost: 35, stock: 50 },
        { name: 'A4 Paper Ream (500 sheets)', price: 250, cost: 200, stock: 20 },
        { name: 'Eraser', price: 5, cost: 3, stock: 80 }
      ]
    },
    {
      name: 'Printing',
      products: [
        { name: 'B&W Print (A4)', price: 2, cost: 1, stock: 0, isService: true },
        { name: 'Color Print (A4)', price: 10, cost: 6, stock: 0, isService: true },
        { name: 'B&W Print (A3)', price: 5, cost: 3, stock: 0, isService: true },
        { name: 'Color Print (A3)', price: 20, cost: 12, stock: 0, isService: true }
      ]
    },
    {
      name: 'Photocopying',
      products: [
        { name: 'B&W Xerox (A4)', price: 1, cost: 0.5, stock: 0, isService: true },
        { name: 'Color Xerox (A4)', price: 5, cost: 3, stock: 0, isService: true },
        { name: 'B&W Xerox (A3)', price: 2, cost: 1, stock: 0, isService: true },
        { name: 'Color Xerox (A3)', price: 10, cost: 6, stock: 0, isService: true }
      ]
    },
    {
      name: 'Services',
      products: [
        { name: 'Lamination (A4)', price: 15, cost: 8, stock: 0, isService: true },
        { name: 'Lamination (A3)', price: 25, cost: 15, stock: 0, isService: true },
        { name: 'Binding (Spiral)', price: 30, cost: 20, stock: 0, isService: true },
        { name: 'Binding (Thermal)', price: 50, cost: 35, stock: 0, isService: true },
        { name: 'Scanning (per page)', price: 3, cost: 1, stock: 0, isService: true }
      ]
    }
  ];

  for (const categoryData of categories) {
    console.log(`\n📦 Creating category: ${categoryData.name}`);

    // Create or find category
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: {},
      create: {
        name: categoryData.name,
        isActive: true
      }
    });

    for (const product of categoryData.products) {
      await prisma.product.upsert({
        where: { id: -1 }, // Dummy where clause for upsert
        create: {
          name: product.name,
          categoryId: category.id,
          price: product.price,
          cost: product.cost,
          stock: product.stock,
          isService: product.isService || false,
          lowStockThreshold: 10,
          isActive: true
        },
        update: {}
      });

      console.log(`  ✓ ${product.name} - ₹${product.price}`);
    }
  }

  // Create sample customers
  const customers = [
    { name: 'John Doe', phone: '9876543210' },
    { name: 'Jane Smith', phone: '9123456789' },
    { name: 'Bob Johnson', phone: '9988776655' }
  ];

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { phone: customer.phone },
      update: {},
      create: {
        name: customer.name,
        phone: customer.phone,
        creditBalance: 0,
        unpaidBills: 0,
        isActive: true
      }
    });

    console.log(`👤 Created customer: ${customer.name} (${customer.phone})`);
  }

  console.log('\n✨ Database seeding completed successfully!');
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔐 Default Login Credentials:');
  console.log('   Username: admin');
  console.log('   PIN: 1234');
  console.log('   Role: Admin');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
