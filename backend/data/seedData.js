const Product = require('../models/Product');

const fetchFakeStoreProducts = async () => {
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    const items = await response.json();
    return items.map((item) => ({
      productId: `P${100 + item.id}`,
      productName: item.title,
      productPrice: Math.round(item.price * 80),
      category: item.category.toUpperCase(),
      quantity: item.rating?.count || 25,
      description: item.description,
    }));
  } catch (error) {
    console.error('Failed to fetch from fakestoreapi:', error.message);
    return [];
  }
};

const seedProductsIfEmpty = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      const products = await fetchFakeStoreProducts();
      if (products.length > 0) {
        await Product.insertMany(products);
        console.log(`[Database Seed]: Successfully inserted ${products.length} products fetched from fakestoreapi.`);
      }
    }
  } catch (error) {
    console.error('[Database Seed Error]:', error.message);
  }
};

module.exports = { fetchFakeStoreProducts, seedProductsIfEmpty };
