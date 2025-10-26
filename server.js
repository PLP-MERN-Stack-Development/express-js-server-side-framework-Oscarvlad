require('dotenv').config();

const express = require('express');
const productRoutes = require('./routes/products');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(logger);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello World!', 
    timestamp: new Date().toISOString(),
    endpoints: {
      products: '/api/products',
      search: '/api/products/search?q=name',
      stats: '/api/products/stats'
    }
  });
});

// Protected API routes
app.use('/api/products', authenticate, productRoutes);

// 404 handler - FIXED VERSION
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Visit: http://localhost:${PORT}`);
});

module.exports = app;