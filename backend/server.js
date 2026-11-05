const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { seedProductsIfEmpty } = require('./data/seedData');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

dotenv.config();

const app = express();

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-email', 'Accept'],
  })
);
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.get('/', (req, res) => {
  res.json({
    app: 'Cartify - Simple Shopping Application API',
    institution: 'Shiv Nadar University Chennai',
    course: 'CS3801 - Web Technologies Lab (Exercise-8)',
    status: 'Server is active',
    endpoints: [
      { method: 'POST', path: '/api/users', purpose: 'Register a new user' },
      { method: 'POST', path: '/api/login', purpose: 'Validate user login' },
      { method: 'GET',    path: '/api/products',          purpose: 'Retrieve products (Auth required)' },
      { method: 'PUT',    path: '/api/users?emailId=user@email.com', purpose: 'Update complete editable profile details' },
      { method: 'PATCH',  path: '/api/users?emailId=user@email.com', purpose: 'Update selected profile fields' },
      { method: 'DELETE', path: '/api/users?emailId=user@email.com', purpose: 'Delete user registration record' },
      { method: 'GET',    path: '/api/cart?emailId=user@email.com',  purpose: 'Get all cart items for a user' },
      { method: 'POST',   path: '/api/cart',               purpose: 'Add a product to cart (or increase qty)' },
      { method: 'PATCH',  path: '/api/cart/:id?action=increase|decrease', purpose: 'Change item quantity by 1' },
      { method: 'DELETE', path: '/api/cart/:id',           purpose: 'Remove a single item from cart' },
      { method: 'DELETE', path: '/api/cart?emailId=user@email.com',  purpose: 'Clear entire cart for a user' },
    ],
  });
});

const PORT = process.env.PORT || 5001;

const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await seedProductsIfEmpty();
  }

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`  Cartify Backend Server running on port ${PORT}`);
    console.log(`  Health / Info: http://localhost:${PORT}/`);
    console.log(`=======================================================`);
  });
};

startServer();
