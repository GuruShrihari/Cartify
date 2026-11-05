const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { seedProductsIfEmpty } = require('./data/seedData');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/payments', orderRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', orderRoutes);

app.get('/', (req, res) => {
  res.json({
    app: 'Cartify E-Commerce API',
    status: 'Active',
    rbac: 'Enabled (user & admin)',
    paymentGateway: 'Razorpay Integration Active',
    emailService: 'Resend API Active',
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
