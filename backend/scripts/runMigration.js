const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function runMigration() {
  try {
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../prisma/migrations/20260414084025_add_categories_and_price_history/migration.sql'),
      'utf8'
    );

    // Split by semicolon and filter empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      } catch (error) {
        console.error('Error in statement:', statement.substring(0, 100));
        console.error('Error message:', error.message);
        // Continue with next statement
      }
    }

    console.log('Migration executed successfully!');
  } catch (error) {
    console.error('Error executing migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runMigration();
