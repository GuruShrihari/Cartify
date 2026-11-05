import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';

function ProductCatalog({ token, user, searchQuery }) {
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

  const categoryProducts = filteredCategory === 'ALL'
    ? products
    : products.filter((p) => p.category.toLowerCase() === filteredCategory.toLowerCase());
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const displayedProducts = normalizedQuery
    ? categoryProducts.filter((product) => [product.productName, product.description, product.category]
      .some((value) => String(value || '').toLowerCase().includes(normalizedQuery)))
    : categoryProducts;

  return (
    <div>
      <div className="page-header" id="catalog">
        <div>
          <h2 className="page-title">Shop products</h2>
          <p className="page-subtitle">
            Find something you’ll love, at a price that feels right.
          </p>
        </div>
      </div>

      <div className="catalog-toolbar">
        <span className="catalog-result-count">
          {searchQuery.trim() ? `Results for “${searchQuery.trim()}” · ` : ''}
          {displayedProducts.length} {displayedProducts.length === 1 ? 'item' : 'items'}
        </span>
        <div className="page-controls">
          <select
            className="select-input category-select"
            value={filteredCategory}
            onChange={(e) => setFilteredCategory(e.target.value)}
            title="Filter by product category"
          >
            <option value="ALL">All departments</option>
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
            <span>{isLoading ? 'Loading…' : 'Refresh catalog'}</span>
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
        <div className="skeleton-grid" aria-label="Loading products">
          {Array.from({ length: 8 }, (_, index) => <div className="skeleton-product" key={index} />)}
        </div>
      )}

      {!isLoading && displayedProducts.length > 0 && (
        <div className="product-grid">
          {displayedProducts.map((product) => (
            <ProductCard key={product.productId} product={product} />
          ))}
        </div>
      )}

      {!isLoading && products.length > 0 && displayedProducts.length === 0 && (
        <div className="empty-state">
          <h3>No matching products</h3>
          <p>Try another search or choose a different department.</p>
          <button type="button" className="btn" onClick={() => setFilteredCategory('ALL')}>Show all products</button>
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
