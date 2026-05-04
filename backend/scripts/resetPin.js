const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetPin() {
  try {
    const newPin = '1234';
    const hashedPin = await bcrypt.hash(newPin, 10);

    await prisma.user.update({
      where: { id: 1 },
      data: { pin: hashedPin }
    });

    console.log('Admin PIN has been reset to: 1234');
  } catch (error) {
    console.error('Error resetting PIN:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPin();
