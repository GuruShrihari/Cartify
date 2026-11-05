const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Product = require('../models/Product');
const User = require('../models/User');
const { fetchFakeStoreProducts } = require('../data/seedData');

// Optional authentication helper: allows guests to freely browse products (like Flipkart / Amazon)
// while attaching user credentials to req.user if a valid token or header is present.
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
        // Token invalid or expired; continue as guest
      }
    }

    const emailCandidate = req.headers['x-user-email'] || req.query.emailId;
    if (emailCandidate && !req.user) {
      const userExists = await User.findOne({ emailId: String(emailCandidate).toLowerCase() });
      if (userExists) {
        req.user = { emailId: userExists.emailId, username: userExists.username };
      }
    }
  } catch (err) {
    // Continue even if optional auth candidate parsing fails
  }
  next();
};

// GET /api/products is publicly accessible for all users (guests and authenticated alike)
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
