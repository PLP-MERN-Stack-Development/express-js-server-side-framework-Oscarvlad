const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { validateProduct, validateProductUpdate } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError } = require('../utils/errors');

const router = express.Router();

let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop for developers',
    price: 1299.99,
    category: 'Electronics',
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Coffee Mug',
    description: 'Ceramic mug for your morning coffee',
    price: 12.99,
    category: 'Kitchen',
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// GET /api/products - List all products with filtering and pagination
router.get('/', asyncHandler(async (req, res) => {
  let filteredProducts = [...products];
  
  if (req.query.category) {
    filteredProducts = filteredProducts.filter(
      product => product.category.toLowerCase() === req.query.category.toLowerCase()
    );
  }
  
  if (req.query.inStock !== undefined) {
    const inStock = req.query.inStock === 'true';
    filteredProducts = filteredProducts.filter(
      product => product.inStock === inStock
    );
  }
  
  if (req.query.search) {
    const searchTerm = req.query.search.toLowerCase();
    filteredProducts = filteredProducts.filter(
      product => product.name.toLowerCase().includes(searchTerm)
    );
  }
  
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    data: paginatedProducts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(filteredProducts.length / limit),
      totalItems: filteredProducts.length,
      itemsPerPage: limit,
      hasNext: endIndex < filteredProducts.length,
      hasPrev: startIndex > 0
    },
    filters: {
      category: req.query.category || 'all',
      inStock: req.query.inStock || 'all',
      search: req.query.search || 'none'
    }
  });
}));

// GET /api/products/search - Search products by name
router.get('/search', asyncHandler(async (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({
      error: 'Search query parameter "q" is required'
    });
  }
  
  const searchResults = products.filter(product =>
    product.name.toLowerCase().includes(q.toLowerCase()) ||
    product.description.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json({
    data: searchResults,
    searchTerm: q,
    totalResults: searchResults.length
  });
}));

// GET /api/products/stats - Get product statistics
router.get('/stats', asyncHandler(async (req, res) => {
  const stats = {
    totalProducts: products.length,
    totalInStock: products.filter(p => p.inStock).length,
    totalOutOfStock: products.filter(p => !p.inStock).length,
    categories: {},
    priceStats: {
      highest: Math.max(...products.map(p => p.price)),
      lowest: Math.min(...products.map(p => p.price)),
      average: products.reduce((sum, p) => sum + p.price, 0) / products.length
    }
  };
  
  products.forEach(product => {
    if (!stats.categories[product.category]) {
      stats.categories[product.category] = 0;
    }
    stats.categories[product.category]++;
  });
  
  res.json(stats);
}));

// GET /api/products/:id - Get specific product
router.get('/:id', asyncHandler(async (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    throw new NotFoundError('Product');
  }
  
  res.json({ data: product });
}));

// POST /api/products - Create new product
router.post('/', validateProduct, asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  
  const newProduct = {
    id: uuidv4(),
    name,
    description,
    price,
    category,
    inStock,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    message: 'Product created successfully',
    data: newProduct
  });
}));

// PUT /api/products/:id - Update existing product
router.put('/:id', validateProductUpdate, asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product');
  }
  
  const updatedProduct = {
    ...products[productIndex],
    ...req.body,
    updatedAt: new Date().toISOString()
  };
  
  products[productIndex] = updatedProduct;
  
  res.json({
    message: 'Product updated successfully',
    data: updatedProduct
  });
}));

// DELETE /api/products/:id - Delete product
router.delete('/:id', asyncHandler(async (req, res) => {
  const productIndex = products.findIndex(p => p.id === req.params.id);
  
  if (productIndex === -1) {
    throw new NotFoundError('Product');
  }
  
  const deletedProduct = products.splice(productIndex, 1)[0];
  
  res.json({
    message: 'Product deleted successfully',
    data: deletedProduct
  });
}));

module.exports = router;