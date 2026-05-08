const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploaded logos
const uploadsDir = process.env.NODE_ENV === 'production'
  ? '/tmp/uploads'
  : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const customerRoutes = require('./routes/customers');
const billRoutes = require('./routes/bills');
const reportRoutes = require('./routes/reports');
const expenseRoutes = require('./routes/expenses');
const settingsRoutes = require('./routes/settings');

// API Routes
const apiBase = '/api/photocopy';

app.use(`${apiBase}/auth`, authRoutes);
app.use(`${apiBase}/dashboard`, dashboardRoutes);
app.use(`${apiBase}/products`, productRoutes);
app.use(`${apiBase}/categories`, categoryRoutes);
app.use(`${apiBase}/customers`, customerRoutes);
app.use(`${apiBase}/bills`, billRoutes);
app.use(`${apiBase}/reports`, reportRoutes);
app.use(`${apiBase}/expenses`, expenseRoutes);
app.use(`${apiBase}/settings`, settingsRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Export for Vercel
module.exports = app;

// Start server only for local development (not in Vercel)
if (require.main === module) {
  const PORT = process.env.PORT || 8069;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api/photocopy`);
    console.log(`Health check at http://localhost:${PORT}/health`);
  });
}
