import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

function ProductCatalog({ token, user }) {
  const [products, setProducts] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchProducts = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/products', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-user-email': user?.emailId || '',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.message || 'Failed to retrieve products from server.');
      } else {
        setProducts(data.products || []);
      }
    } catch (err) {
      setErrorMessage('Network error fetching products: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/products/seed', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        await fetchProducts();
      } else {
        setErrorMessage(data.message);
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const categories = ['ALL', ...Array.from(new Set(products.map((p) => p.category)))];

  const displayedProducts = filteredCategory === 'ALL'
    ? products
    : products.filter((p) => p.category.toLowerCase() === filteredCategory.toLowerCase());

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Products Catalog</h2>
          <p className="page-subtitle">
            Curated essentials and quality goods for your everyday lifestyle
          </p>
        </div>

        <div className="page-controls">
          <select
            className="select-input"
            value={filteredCategory}
            onChange={(e) => setFilteredCategory(e.target.value)}
            title="Filter by product category"
          >
            <option value="ALL">All Categories</option>
            {categories
              .filter((c) => c !== 'ALL')
              .map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
          </select>

          <button
            type="button"
            className="btn"
            onClick={fetchProducts}
            disabled={isLoading}
          >
            <span>&#x21bb;</span>
            <span>{isLoading ? 'Loading...' : 'Reload Products'}</span>
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="alert-banner error">
          <span>{errorMessage}</span>
          <button type="button" className="btn" onClick={fetchProducts} style={{ padding: '4px 8px' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading && (
        <div className="empty-state">
          <h3>Loading Products...</h3>
          <p>Fetching the latest catalog items...</p>
        </div>
      )}

      {!isLoading && displayedProducts.length > 0 && (
        <div className="product-grid">
          {displayedProducts.map((product) => (
            <ProductCard key={product.productId} product={product} user={user} />
          ))}
        </div>
      )}

      {!isLoading && products.length === 0 && !errorMessage && (
        <div className="empty-state">
          <h3>No Products Available</h3>
          <p>The product catalog is currently empty.</p>
          <button
            type="button"
            className="btn btn-solid"
            onClick={handleSeedDefaults}
          >
            Load Products
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductCatalog;
