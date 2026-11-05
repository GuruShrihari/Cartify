const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const extractEmail = (req) => {
  return String(req.query.emailId || req.body.emailId || '').trim().toLowerCase();
};

// Middleware to verify admin access
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
        message: 'Access denied: Administrator privileges required.',
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired authentication token.' });
  }
};

// Register a new user (defaults to role: 'user')
router.post('/users', async (req, res) => {
  try {
    const { username, emailId, age, password } = req.body;

    if (!username || !emailId || age === undefined || age === null || !password) {
      return res.status(400).json({
        message: 'All fields (username, emailId, age, password) are required.',
      });
    }

    const trimmedUsername = String(username).trim();
    const normalizedEmail = String(emailId).trim().toLowerCase();
    const parsedAge = Number(age);

    if (!trimmedUsername) {
      return res.status(400).json({ message: 'Username cannot be blank.' });
    }

    if (isNaN(parsedAge) || parsedAge <= 0) {
      return res.status(400).json({ message: 'Age must be a positive number.' });
    }

    const existingUser = await User.findOne({ emailId: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        message: 'Email ID is already registered. Please login instead.',
      });
    }

    const newUser = new User({
      username: trimmedUsername,
      emailId: normalizedEmail,
      age: parsedAge,
      password: String(password),
      role: 'user', // regular registration is always 'user'
    });

    await newUser.save();

    return res.status(201).json({
      message: `Successfully registered! Welcome, ${newUser.username}.`,
      user: {
        username: newUser.username,
        emailId: newUser.emailId,
        age: newUser.age,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed: ' + error.message });
  }
});

// User login
router.post('/login', async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!emailId || !password) {
      return res.status(400).json({
        message: 'Email ID and password are required.',
      });
    }

    const normalizedEmail = String(emailId).trim().toLowerCase();
    const user = await User.findOne({ emailId: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        message: 'User Not Registered.',
      });
    }

    if (user.password !== String(password)) {
      return res.status(401).json({
        message: 'Invalid Password.',
      });
    }

    const userRole = user.role || 'user';

    const token = jwt.sign(
      {
        id: user._id,
        emailId: user.emailId,
        username: user.username,
        role: userRole,
      },
      process.env.JWT_SECRET || 'cartify_jwt_secret_key_default',
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      message: `Login successful! Welcome back, ${user.username}.`,
      token,
      user: {
        username: user.username,
        emailId: user.emailId,
        age: user.age,
        role: userRole,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login error: ' + error.message });
  }
});

// Admin-only: Get list of registered users for analytics
router.get('/users/all', verifyAdmin, async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return res.status(200).json({ count: users.length, users });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving users: ' + error.message });
  }
});

// Complete profile update
router.put('/users', async (req, res) => {
  try {
    const emailId = extractEmail(req);

    if (!emailId) {
      return res.status(400).json({
        message: 'Email ID query parameter is required (e.g., PUT /api/users?emailId=user@example.com).',
      });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        message: `User with email "${emailId}" does not exist.`,
      });
    }

    const { username, age, password } = req.body;

    if (!username || age === undefined || age === null || !password) {
      return res.status(400).json({
        message: 'Complete details (username, age, and password) are required for a PUT update.',
      });
    }

    const parsedAge = Number(age);
    if (isNaN(parsedAge) || parsedAge <= 0) {
      return res.status(400).json({ message: 'Age must be a valid positive number.' });
    }

    user.username = String(username).trim();
    user.age = parsedAge;
    user.password = String(password);

    await user.save();

    return res.status(200).json({
      message: `User profile completely updated for ${user.username}.`,
      user: {
        username: user.username,
        emailId: user.emailId,
        age: user.age,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('PUT error:', error);
    return res.status(500).json({ message: 'Error updating user: ' + error.message });
  }
});

// Partial update
router.patch('/users', async (req, res) => {
  try {
    const emailId = extractEmail(req);

    if (!emailId) {
      return res.status(400).json({
        message: 'Email ID query parameter is required (e.g., PATCH /api/users?emailId=user@example.com).',
      });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        message: `User with email "${emailId}" does not exist.`,
      });
    }

    const updates = req.body;
    let updatedCount = 0;

    if (updates.username !== undefined) {
      const trimmed = String(updates.username).trim();
      if (!trimmed) {
        return res.status(400).json({ message: 'Username cannot be blank.' });
      }
      user.username = trimmed;
      updatedCount++;
    }

    if (updates.age !== undefined) {
      const parsedAge = Number(updates.age);
      if (isNaN(parsedAge) || parsedAge <= 0) {
        return res.status(400).json({ message: 'Age must be a valid positive number.' });
      }
      user.age = parsedAge;
      updatedCount++;
    }

    if (updates.password !== undefined) {
      const trimmedPass = String(updates.password);
      if (!trimmedPass) {
        return res.status(400).json({ message: 'Password cannot be blank.' });
      }
      user.password = trimmedPass;
      updatedCount++;
    }

    if (updatedCount === 0) {
      return res.status(400).json({
        message: 'No valid fields provided to update. Pass username, age, or password.',
      });
    }

    await user.save();

    return res.status(200).json({
      message: `Selected fields updated successfully for ${user.username}.`,
      user: {
        username: user.username,
        emailId: user.emailId,
        age: user.age,
        role: user.role || 'user',
      },
    });
  } catch (error) {
    console.error('PATCH error:', error);
    return res.status(500).json({ message: 'Error patching user: ' + error.message });
  }
});

// Delete user
router.delete('/users', async (req, res) => {
  try {
    const emailId = extractEmail(req);

    if (!emailId) {
      return res.status(400).json({
        message: 'Email ID query parameter is required (e.g., DELETE /api/users?emailId=user@example.com).',
      });
    }

    const user = await User.findOne({ emailId });
    if (!user) {
      return res.status(404).json({
        message: `User with email "${emailId}" does not exist. Cannot delete.`,
      });
    }

    await User.deleteOne({ emailId });

    return res.status(200).json({
      message: `Registration record for ${emailId} successfully deleted.`,
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return res.status(500).json({ message: 'Error deleting user: ' + error.message });
  }
});

module.exports = router;
module.exports.verifyAdmin = verifyAdmin;
