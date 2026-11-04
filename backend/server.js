const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { seedProductsIfEmpty } = require('./data/seedData');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', userRoutes);
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
  res.json({
    app: 'Cartify - Simple Shopping Application API',
    institution: 'Shiv Nadar University Chennai',
    course: 'CS3801 - Web Technologies Lab (Exercise-8)',
    status: 'Server is active',
    endpoints: [
      { method: 'POST', path: '/api/users', purpose: 'Register a new user' },
      { method: 'POST', path: '/api/login', purpose: 'Validate user login' },
      { method: 'GET', path: '/api/products', purpose: 'Retrieve products (Auth required)' },
      { method: 'PUT', path: '/api/users?emailId=user@email.com', purpose: 'Update complete editable profile details' },
      { method: 'PATCH', path: '/api/users?emailId=user@email.com', purpose: 'Update selected profile fields' },
      { method: 'DELETE', path: '/api/users?emailId=user@email.com', purpose: 'Delete user registration record' },
    ],
  });
});

const PORT = process.env.PORT || 5000;

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
