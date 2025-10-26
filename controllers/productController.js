import { v4 as uuidv4 } from "uuid";
import { NotFoundError } from "../utils/customErrors.js";

let products = [];

export const getProducts = (req, res) => {
  let { category, page = 1, limit = 5 } = req.query;
  let filtered = category ? products.filter(p => p.category === category) : products;

  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + Number(limit));

  res.json({
    total: filtered.length,
    page: Number(page),
    data: paginated,
  });
};

export const getProductById = (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new NotFoundError("Product not found"));
  res.json(product);
};

export const createProduct = (req, res) => {
  const newProduct = { id: uuidv4(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
};

export const updateProduct = (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError("Product not found"));
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
};

export const deleteProduct = (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError("Product not found"));
  const deleted = products.splice(index, 1);
  res.json({ message: "Product deleted", deleted });
};

export const searchProducts = (req, res) => {
  const { name } = req.query;
  const results = products.filter(p =>
    p.name.toLowerCase().includes(name.toLowerCase())
  );
  res.json(results);
};

export const getProductStats = (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json(stats);
};
