/**
 * Cartify database seeder
 * Run from the backend folder: npm run seed
 *
 * Seeds the Products collection with a curated catalog whose images come
 * from Unsplash, plus a demo user for logging in.
 */
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const Product = require('../models/Product');
const User = require('../models/User');
const mongoose = require('mongoose');

const unsplash = (photoId) =>
  `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=80`;

const products = [
  {
    productId: 'P101',
    productName: 'Aurora Wireless Headphones',
    productImage: unsplash('photo-1505740420928-5e560c06d30e'),
    productPrice: 8999,
    category: 'ELECTRONICS',
    quantity: 32,
    description:
      'Over-ear wireless headphones with active noise cancellation, plush memory-foam cups and 40 hours of battery life.',
  },
  {
    productId: 'P102',
    productName: 'Metro Canvas Sneakers',
    productImage: unsplash('photo-1542291026-7eec264c27ff'),
    productPrice: 3499,
    category: 'FOOTWEAR',
    quantity: 48,
    description:
      'Lightweight everyday sneakers with a breathable canvas upper, cushioned insole and a grippy rubber outsole.',
  },
  {
    productId: 'P103',
    productName: 'Heritage Chronograph Watch',
    productImage: unsplash('photo-1523275335684-37898b6baf30'),
    productPrice: 12499,
    category: 'ACCESSORIES',
    quantity: 18,
    description:
      'A stainless-steel chronograph with sapphire crystal glass, luminous hands and a genuine leather strap.',
  },
  {
    productId: 'P104',
    productName: 'Noir Aviator Sunglasses',
    productImage: unsplash('photo-1572635196237-14b3f281503f'),
    productPrice: 2799,
    category: 'ACCESSORIES',
    quantity: 40,
    description:
      'Classic aviator silhouette with polarized UV400 lenses and a featherweight metal frame for all-day comfort.',
  },
  {
    productId: 'P105',
    productName: 'Trailblazer Daypack',
    productImage: unsplash('photo-1553062407-98eeb64c6a62'),
    productPrice: 4299,
    category: 'BAGS',
    quantity: 25,
    description:
      'A 24L water-resistant daypack with a padded laptop sleeve, breathable back panel and hidden security pocket.',
  },
  {
    productId: 'P106',
    productName: 'Lumix Mirrorless Camera',
    productImage: unsplash('photo-1516035069371-29a1b244cc32'),
    productPrice: 54999,
    category: 'ELECTRONICS',
    quantity: 9,
    description:
      '24MP mirrorless camera with 4K video, fast hybrid autofocus and a compact body that travels anywhere.',
  },
  {
    productId: 'P107',
    productName: 'Tactile Mechanical Keyboard',
    productImage: unsplash('photo-1587829741301-dc798b83add3'),
    productPrice: 6499,
    category: 'ELECTRONICS',
    quantity: 30,
    description:
      'Hot-swappable 75% mechanical keyboard with tactile switches, PBT keycaps and subtle white backlighting.',
  },
  {
    productId: 'P108',
    productName: 'Glide Wireless Mouse',
    productImage: unsplash('photo-1527864550417-7fd91fc51a46'),
    productPrice: 2199,
    category: 'ELECTRONICS',
    quantity: 55,
    description:
      'Ergonomic wireless mouse with a 26K optical sensor, silent clicks and up to 70 days of battery life.',
  },
  {
    productId: 'P109',
    productName: 'Slate Ultrabook Laptop',
    productImage: unsplash('photo-1496181133206-80ce9b88a853'),
    productPrice: 78999,
    category: 'ELECTRONICS',
    quantity: 12,
    description:
      'A slim 14-inch ultrabook with an all-day battery, backlit keyboard and a bright edge-to-edge display.',
  },
  {
    productId: 'P110',
    productName: 'Boom Portable Speaker',
    productImage: unsplash('photo-1608043152269-423dbba4e7e1'),
    productPrice: 3999,
    category: 'AUDIO',
    quantity: 36,
    description:
      'Pocket-sized Bluetooth speaker with punchy 360° sound, IPX7 waterproofing and 12 hours of playtime.',
  },
  {
    productId: 'P111',
    productName: 'Everyday Cotton Tee',
    productImage: unsplash('photo-1521572163474-6864f9cf17ab'),
    productPrice: 899,
    category: 'APPAREL',
    quantity: 100,
    description:
      'A soft 100% organic cotton t-shirt with a relaxed fit, reinforced collar and a pre-shrunk finish.',
  },
  {
    productId: 'P112',
    productName: 'Stoneware Coffee Mug',
    productImage: unsplash('photo-1514228742587-6b1558fcca3d'),
    productPrice: 649,
    category: 'HOME',
    quantity: 80,
    description:
      'Hand-glazed 350ml stoneware mug with a comfortable handle, made for slow mornings and strong coffee.',
  },
  {
    productId: 'P113',
    productName: 'Nordic Desk Lamp',
    productImage: unsplash('photo-1507473885765-e6ed057f782c'),
    productPrice: 2499,
    category: 'HOME',
    quantity: 22,
    description:
      'Minimal adjustable desk lamp with warm-to-cool dimming and a weighted base that stays put while you work.',
  },
  {
    productId: 'P114',
    productName: 'Amber Oud Perfume',
    productImage: unsplash('photo-1541643600914-78b084683601'),
    productPrice: 5999,
    category: 'BEAUTY',
    quantity: 27,
    description:
      'A warm unisex eau de parfum blending amber, oud and sandalwood for a long-lasting evening signature.',
  },
  {
    productId: 'P115',
    productName: 'Leather Card Wallet',
    productImage: unsplash('photo-1627123424574-724758594e93'),
    productPrice: 1499,
    category: 'ACCESSORIES',
    quantity: 65,
    description:
      'Slim full-grain leather card holder with RFID protection and space for six cards plus folded notes.',
  },
  {
    productId: 'P116',
    productName: 'Ripple Ceramic Vase',
    productImage: unsplash('photo-1578500494198-246f612d3b3d'),
    productPrice: 1899,
    category: 'HOME',
    quantity: 19,
    description:
      'Textured ceramic vase with a soft matte glaze, equally at home with fresh stems or standing on its own.',
  },
];

const demoUser = {
  username: 'Demo User',
  emailId: 'demo@cartify.com',
  age: 22,
  password: 'demo123',
};

const seed = async () => {
  const connected = await connectDB();
  if (!connected) {
    console.error('[Seed]: Could not connect to MongoDB. Check MONGO_URI in backend/.env');
    process.exit(1);
  }

  console.log(`[Seed]: Existing products -> ${await Product.countDocuments()}`);

  const result = await Product.bulkWrite(
    products.map((product) => ({
      updateOne: {
        filter: { productId: product.productId },
        update: { $set: product },
        upsert: true,
      },
    }))
  );

  const userResult = await User.updateOne(
    { emailId: demoUser.emailId },
    { $set: demoUser },
    { upsert: true }
  );

  console.log(`[Seed]: Products inserted -> ${result.upsertedCount}, updated -> ${result.modifiedCount}`);
  console.log(`[Seed]: Demo user inserted -> ${userResult.upsertedCount}, updated -> ${userResult.modifiedCount}`);
  console.log(`[Seed]: Total products now -> ${await Product.countDocuments()}`);
  console.log(`[Seed]: Total users now -> ${await User.countDocuments()}`);
  console.log('[Seed]: Demo login -> demo@cartify.com / demo123');

  await mongoose.disconnect();
  console.log('[Seed]: Done.');
};

seed().catch(async (error) => {
  console.error('[Seed Error]:', error);
  await mongoose.disconnect();
  process.exit(1);
});
