const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const User = require('../models/User');
const { fetchFakeStoreProducts } = require('../data/seedData');

// Optional authentication helper: allows guests to freely browse products
const optionalAuthentication = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'cartify_jwt_secret_key_default'
        );
        req.user = decoded;
      } catch (tokenErr) {
        // Continue as guest
      }
    }

    const emailCandidate = req.headers['x-user-email'] || req.query.emailId;
    if (emailCandidate && !req.user) {
      const userExists = await User.findOne({ emailId: String(emailCandidate).toLowerCase() });
      if (userExists) {
        req.user = { id: userExists._id, emailId: userExists.emailId, username: userExists.username, role: userExists.role };
      }
    }
  } catch (err) {
    // Continue
  }
  next();
};

// Admin protection helper
const verifyAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'cartify_jwt_secret_key_default'
    );

    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        message: 'Access denied: Administrator privileges required to perform this action.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// GET /api/products (Public)
router.get('/', optionalAuthentication, async (req, res) => {
  try {
    const products = await Product.find({}).sort({ productId: 1 });
    return res.status(200).json({
      count: products.length,
      products,
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return res.status(500).json({ message: 'Error retrieving products: ' + error.message });
  }
});

// GET /api/products/:id (Public - individual product detail)
router.get('/:id', optionalAuthentication, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({
      $or: [{ productId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ message: `Product "${id}" not found.` });
    }

    return res.status(200).json({ product });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving product: ' + error.message });
  }
});

// POST /api/products (Admin Only: Add new product to catalog)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const {
      productId,
      productName,
      productPrice,
      category,
      quantity,
      description,
      productImage,
    } = req.body;

    if (!productName || productPrice === undefined || !category) {
      return res.status(400).json({
        message: 'Product Name, Price, and Category are required.',
      });
    }

    let finalProductId = (productId || '').trim();
    if (!finalProductId) {
      const highestProduct = await Product.findOne({}).sort({ createdAt: -1 });
      const nextNum = highestProduct ? parseInt(highestProduct.productId.replace(/\D/g, '') || '100', 10) + 1 : 101;
      finalProductId = `P${nextNum}`;
    }

    const existing = await Product.findOne({ productId: finalProductId });
    if (existing) {
      return res.status(400).json({
        message: `Product ID "${finalProductId}" already exists. Please choose a different ID.`,
      });
    }

    const newProduct = new Product({
      productId: finalProductId,
      productName: String(productName).trim(),
      productPrice: Number(productPrice),
      category: String(category).trim().toUpperCase(),
      quantity: Number(quantity) >= 0 ? Number(quantity) : 25,
      description: String(description || 'High-quality everyday product').trim(),
      productImage: (productImage || '').trim() || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    });

    await newProduct.save();

    return res.status(201).json({
      message: `Product "${newProduct.productName}" added successfully to catalog.`,
      product: newProduct,
    });
  } catch (error) {
    console.error('Add product error:', error);
    return res.status(500).json({ message: 'Error adding product: ' + error.message });
  }
});

// DELETE /api/products/:id (Admin Only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Product.findOneAndDelete({
      $or: [{ productId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!deleted) {
      return res.status(404).json({ message: `Product "${id}" not found.` });
    }

    return res.status(200).json({
      message: `Product "${deleted.productName}" removed from catalog.`,
      productId: deleted.productId,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting product: ' + error.message });
  }
});

// PATCH /api/products/:id (Admin Only: update stock or details)
router.patch('/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const product = await Product.findOne({
      $or: [{ productId: id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    if (!product) {
      return res.status(404).json({ message: `Product "${id}" not found.` });
    }

    if (updates.productName !== undefined) product.productName = updates.productName;
    if (updates.productPrice !== undefined) product.productPrice = Number(updates.productPrice);
    if (updates.category !== undefined) product.category = String(updates.category).toUpperCase();
    if (updates.quantity !== undefined) product.quantity = Number(updates.quantity);
    if (updates.description !== undefined) product.description = updates.description;
    if (updates.productImage !== undefined) product.productImage = updates.productImage;

    await product.save();

    return res.status(200).json({
      message: `Product "${product.productName}" updated successfully.`,
      product,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating product: ' + error.message });
  }
});

// Seed fakestoreapi products
router.post('/seed', async (req, res) => {
  try {
    const freshProducts = await fetchFakeStoreProducts();
    if (freshProducts.length === 0) {
      return res.status(500).json({ message: 'Failed to fetch products from fakestoreapi.' });
    }
    await Product.deleteMany({});
    const inserted = await Product.insertMany(freshProducts);
    return res.status(201).json({
      message: `Seeded ${inserted.length} products from fakestoreapi.`,
      products: inserted,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Seed error: ' + error.message });
  }
});

module.exports = router;
