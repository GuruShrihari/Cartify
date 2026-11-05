const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');

// GET /api/cart?emailId=user@example.com

router.get('/', async (req, res) => {
  try {
    const emailId = String(req.query.emailId || '').trim().toLowerCase();

    if (!emailId) {
      return res.status(400).json({
        message: 'emailId query parameter is required (e.g., GET /api/cart?emailId=user@example.com).',
      });
    }

    const cartItems = await Cart.find({ userEmail: emailId }).sort({ createdAt: 1 });

    return res.status(200).json({
      count: cartItems.length,
      cartItems,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching cart: ' + error.message });
  }
});

// POST /api/cart

router.post('/', async (req, res) => {
  try {
    const { userEmail, productId, productName, productPrice } = req.body;

    if (!userEmail || !productId || !productName || productPrice === undefined) {
      return res.status(400).json({
        message: 'userEmail, productId, productName, and productPrice are all required.',
      });
    }

    const normalizedEmail = String(userEmail).trim().toLowerCase();

    const existingItem = await Cart.findOne({ userEmail: normalizedEmail, productId });

    if (existingItem) {
      existingItem.quantity += 1;
      await existingItem.save();
      return res.status(200).json({
        message: `Quantity updated. ${productName} is now ×${existingItem.quantity} in your cart.`,
        cartItem: existingItem,
      });
    }

    const newItem = new Cart({
      userEmail: normalizedEmail,
      productId,
      productName,
      productPrice: Number(productPrice),
      quantity: 1,
    });

    await newItem.save();

    return res.status(201).json({
      message: `${productName} added to your cart.`,
      cartItem: newItem,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error adding to cart: ' + error.message });
  }
});

// PATCH /api/cart/:id?action=increase  OR  ?action=decrease

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const action = String(req.query.action || '').toLowerCase(); 

    if (action !== 'increase' && action !== 'decrease') {
      return res.status(400).json({
        message: 'action query parameter must be either "increase" or "decrease".',
      });
    }

    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    if (action === 'increase') {
      cartItem.quantity += 1;
      await cartItem.save();
      return res.status(200).json({
        message: `Quantity increased to ${cartItem.quantity}.`,
        cartItem,
      });
    }

    if (cartItem.quantity <= 1) {
      await Cart.deleteOne({ _id: id });
      return res.status(200).json({
        message: `${cartItem.productName} removed from your cart.`,
        removed: true,
      });
    }

    cartItem.quantity -= 1;
    await cartItem.save();
    return res.status(200).json({
      message: `Quantity decreased to ${cartItem.quantity}.`,
      cartItem,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating cart item: ' + error.message });
  }
});

// DELETE /api/cart/:id

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const cartItem = await Cart.findById(id);
    if (!cartItem) {
      return res.status(404).json({ message: 'Cart item not found.' });
    }

    await Cart.deleteOne({ _id: id });

    return res.status(200).json({
      message: `${cartItem.productName} removed from your cart.`,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error removing cart item: ' + error.message });
  }
});

// DELETE /api/cart?emailId=user@example.com

router.delete('/', async (req, res) => {
  try {
    const emailId = String(req.query.emailId || '').trim().toLowerCase();

    if (!emailId) {
      return res.status(400).json({
        message: 'emailId query parameter is required (e.g., DELETE /api/cart?emailId=user@example.com).',
      });
    }

    const result = await Cart.deleteMany({ userEmail: emailId });

    return res.status(200).json({
      message: `Cart cleared. ${result.deletedCount} item(s) removed.`,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error clearing cart: ' + error.message });
  }
});

module.exports = router;

