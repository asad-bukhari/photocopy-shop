const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

/**
 * Get shop settings (public endpoint)
 */
exports.getShopSettings = async (req, res) => {
  try {
    let shop = await prisma.shop.findFirst({
      where: { isActive: true }
    });

    // If no shop exists, return defaults
    if (!shop) {
      shop = {
        name: 'Photocopy Shop',
        phone: '+92 XXX XXXXXXX',
        email: 'info@photocopyshop.pk',
        logoUrl: null,
        address: null
      };
    }

    res.json({
      success: true,
      data: shop
    });
  } catch (error) {
    console.error('Error fetching shop settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shop settings'
    });
  }
};

/**
 * Update shop settings (admin only)
 */
exports.updateShopSettings = async (req, res) => {
  try {
    const { name, phone, email, address } = req.body;

    // Validation
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Shop name is required'
      });
    }

    if (!phone || phone.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required'
      });
    }

    // Get or create shop
    let shop = await prisma.shop.findFirst();

    if (shop) {
      // Update existing shop
      shop = await prisma.shop.update({
        where: { id: shop.id },
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          address: address?.trim() || null
        }
      });
    } else {
      // Create new shop
      shop = await prisma.shop.create({
        data: {
          name: name.trim(),
          phone: phone.trim(),
          email: email?.trim() || null,
          address: address?.trim() || null,
          isActive: true
        }
      });
    }

    res.json({
      success: true,
      message: 'Shop settings updated successfully',
      data: shop
    });
  } catch (error) {
    console.error('Error updating shop settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update shop settings'
    });
  }
};

/**
 * Upload shop logo (admin only)
 */
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Get or create shop
    let shop = await prisma.shop.findFirst();
    const logoUrl = `/uploads/${req.file.filename}`;

    // Delete old logo if exists
    if (shop && shop.logoUrl) {
      const uploadsDir = process.env.NODE_ENV === 'production' ? '/tmp' : path.join(__dirname, '../../..');
      const oldLogoPath = path.join(uploadsDir, shop.logoUrl);
      try {
        if (fs.existsSync(oldLogoPath)) {
          fs.unlinkSync(oldLogoPath);
        }
      } catch (err) {
        console.error('Failed to delete old logo:', err.message);
      }
    }

    if (shop) {
      // Update existing shop
      shop = await prisma.shop.update({
        where: { id: shop.id },
        data: { logoUrl }
      });
    } else {
      // Create new shop with logo
      shop = await prisma.shop.create({
        data: {
          name: 'Photocopy Shop',
          phone: '+92 XXX XXXXXXX',
          logoUrl,
          isActive: true
        }
      });
    }

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logoUrl }
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload logo'
    });
  }
};

/**
 * Change admin PIN (admin only)
 */
exports.changePin = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;

    // Validation
    if (!currentPin || !newPin) {
      return res.status(400).json({
        success: false,
        message: 'Current PIN and new PIN are required'
      });
    }

    // PIN format validation (4 digits)
    if (!/^\d{4}$/.test(newPin)) {
      return res.status(400).json({
        success: false,
        message: 'New PIN must be exactly 4 digits'
      });
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current PIN
    const isCurrentPinValid = await bcrypt.compare(currentPin, user.pin);
    if (!isCurrentPinValid) {
      return res.status(401).json({
        success: false,
        message: 'Current PIN is incorrect'
      });
    }

    // Hash new PIN
    const hashedNewPin = await bcrypt.hash(newPin, 10);

    // Update PIN
    await prisma.user.update({
      where: { id: user.id },
      data: { pin: hashedNewPin }
    });

    res.json({
      success: true,
      message: 'PIN changed successfully'
    });
  } catch (error) {
    console.error('Error changing PIN:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change PIN'
    });
  }
};
