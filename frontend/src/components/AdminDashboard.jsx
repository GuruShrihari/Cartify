import { useState, useEffect } from 'react';
import {
  ChartLineUp,
  PlusCircle,
  CurrencyInr,
  Trash,
  CheckCircle,
  Clock,
  ArrowsClockwise,
  ShieldCheck,
  ArrowSquareOut,
  CaretLeft,
  CaretRight,
} from '@phosphor-icons/react';

function AdminDashboard({ user, token, onNavigateToStore }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'orders' | 'add-product' | 'cash'
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [statusType, setStatusType] = useState('info');

  // Pagination for Current Catalog
  const [catalogPage, setCatalogPage] = useState(1);
  const [catalogPageSize, setCatalogPageSize] = useState(6);

  // Form state for adding new product
  const [newProduct, setNewProduct] = useState({
    productId: '',
    productName: '',
    category: 'ELECTRONICS',
    productPrice: '',
    quantity: '25',
    productImage: '',
    description: '',
  });
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // RBAC Check: Ensure user is admin
  const isAdmin = user && user.role === 'admin';

  // Fetch admin data
  const fetchAllAdminData = async () => {
    if (!isAdmin) return;
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };

      // 1. Fetch Analytics
      const analyticsRes = await fetch('/api/admin/analytics', { headers });
      const analyticsJson = await analyticsRes.json();
      if (analyticsRes.ok) {
        setAnalyticsData(analyticsJson);
      }

      // 2. Fetch All Orders
      const ordersRes = await fetch('/api/admin/all', { headers });
      const ordersJson = await ordersRes.json();
      if (ordersRes.ok) {
        setOrders(ordersJson.orders || []);
      }

      // 3. Fetch All Products
      const productsRes = await fetch('/api/products');
      const productsJson = await productsRes.json();
      if (productsRes.ok) {
        setProducts(productsJson.products || []);
      }
    } catch (err) {
      setStatusType('error');
      setStatusMessage('Error loading admin dashboard: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function loadInitial() {
      if (!isAdmin) return;
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [analyticsRes, ordersRes, productsRes] = await Promise.all([
          fetch('/api/admin/analytics', { headers }),
          fetch('/api/admin/all', { headers }),
          fetch('/api/products'),
        ]);

        const [analyticsJson, ordersJson, productsJson] = await Promise.all([
          analyticsRes.json(),
          ordersRes.json(),
          productsRes.json(),
        ]);

        if (!ignore) {
          if (analyticsRes.ok) setAnalyticsData(analyticsJson);
          if (ordersRes.ok) setOrders(ordersJson.orders || []);
          if (productsRes.ok) setProducts(productsJson.products || []);
        }
      } catch (err) {
        if (!ignore) {
          setStatusType('error');
          setStatusMessage('Error loading admin dashboard: ' + err.message);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();
    return () => {
      ignore = true;
    };
  }, [isAdmin, token]);

  // Handle Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.productName || !newProduct.productPrice || !newProduct.category) {
      setStatusType('error');
      setStatusMessage('Please fill in Product Name, Price, and Category.');
      return;
    }

    setIsSubmittingProduct(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: newProduct.productId.trim() || undefined,
          productName: newProduct.productName.trim(),
          category: newProduct.category,
          productPrice: Number(newProduct.productPrice),
          quantity: Number(newProduct.quantity) || 0,
          productImage: newProduct.productImage.trim() || undefined,
          description: newProduct.description.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusType('error');
        setStatusMessage(data.message || 'Failed to add product.');
      } else {
        setStatusType('success');
        setStatusMessage(`Product "${data.product?.productName}" added to catalog.`);
        setNewProduct({
          productId: '',
          productName: '',
          category: 'ELECTRONICS',
          productPrice: '',
          quantity: '25',
          productImage: '',
          description: '',
        });
        fetchAllAdminData();
      }
    } catch (err) {
      setStatusType('error');
      setStatusMessage('Error adding product: ' + err.message);
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async (productId, productName) => {
    if (!window.confirm(`Are you sure you want to remove "${productName}" from the catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to delete product.');
      } else {
        setStatusType('success');
        setStatusMessage(`Product "${productName}" removed.`);
        fetchAllAdminData();
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  // Handle Update Order Status
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fulfillmentStatus: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || 'Failed to update order status.');
      } else {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, fulfillmentStatus: newStatus } : o))
        );
      }
    } catch (err) {
      alert('Status update failed: ' + err.message);
    }
  };

  // Unsplash Preset Helpers
  const fillSampleImage = (categoryKey) => {
    const samples = {
      ELECTRONICS: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
      APPAREL: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80',
      FOOTWEAR: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80',
      HOME: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
      ACCESSORIES: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    };
    setNewProduct((prev) => ({
      ...prev,
      productImage: samples[categoryKey] || samples.ELECTRONICS,
    }));
  };

  // RBAC Access Control Guard
  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', background: 'var(--bg-surface)', border: '1px solid var(--border-line)', borderRadius: '12px', padding: '36px 24px' }}>
          <h2 style={{ fontSize: '20px', color: 'var(--error-text)', marginBottom: '8px' }}>Access Denied</h2>
          <p style={{ fontSize: '13.5px', color: 'var(--ink-500)', lineHeight: 1.6, marginBottom: '20px' }}>
            Administrator privileges are required to view the management portal. Regular customer accounts cannot access administrative views.
          </p>
          <button type="button" className="btn-solid" onClick={onNavigateToStore}>
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const metrics = analyticsData?.metrics || {
    totalRevenue: orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0),
    totalOrders: orders.length,
    totalProducts: products.length,
    totalInventoryStock: products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0),
    totalUsers: 2,
  };

  // Current Catalog pagination computations
  const totalCatalogPages = Math.max(1, Math.ceil(products.length / catalogPageSize));
  const safeCatalogPage = Math.min(catalogPage, totalCatalogPages);
  const catalogStartIndex = (safeCatalogPage - 1) * catalogPageSize;
  const paginatedCatalog = products.slice(catalogStartIndex, catalogStartIndex + catalogPageSize);

  return (
    <div className="container admin-dashboard">
      {/* Admin Top Header */}
      <div className="admin-header">
        <div>
          <div className="admin-badge">
            <ShieldCheck size={14} weight="fill" />
            <span>Cartify RBAC Admin Portal</span>
          </div>
          <h1 className="admin-title">Store Management & Analytics</h1>
          <p className="admin-subtitle">
            Authenticated as <strong>{user.username}</strong> ({user.emailId}) &middot; System Administrator
          </p>
        </div>

        <div className="admin-header-actions">
          <button
            type="button"
            className="refresh-btn"
            onClick={fetchAllAdminData}
            disabled={isLoading}
            title="Refresh metrics and database"
          >
            <ArrowsClockwise size={14} weight="bold" className={isLoading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
          <button
            type="button"
            className="btn-outline-minimal"
            onClick={onNavigateToStore}
            style={{ fontSize: '12.5px' }}
          >
            <span>View Storefront</span>
            <ArrowSquareOut size={14} weight="bold" />
          </button>
        </div>
      </div>

      {/* Status Banner */}
      {statusMessage && (
        <div className={`alert-banner ${statusType}`} style={{ marginBottom: '20px' }}>
          <span>{statusMessage}</span>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            style={{ fontSize: '12px', fontWeight: 600, color: 'inherit' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Tab Switcher */}
      <div className="admin-tab-nav">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          <ChartLineUp size={16} weight="regular" />
          <span>Analytics & Metrics</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Clock size={16} weight="regular" />
          <span>Manage Orders ({orders.length})</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-product')}
        >
          <PlusCircle size={16} weight="regular" />
          <span>Add & Manage Products ({products.length})</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'cash' ? 'active' : ''}`}
          onClick={() => setActiveTab('cash')}
        >
          <CurrencyInr size={16} weight="regular" />
          <span>Cash & Transactions</span>
        </button>
      </div>

      {/* TAB 1: ANALYTICS & METRICS */}
      {activeTab === 'analytics' && (
        <div className="admin-view-panel">
          {/* Key Metric Cards */}
          <div className="admin-metrics-grid">
            <div className="metric-card">
              <span className="metric-label">Total Revenue (Gross)</span>
              <div className="metric-number price-num">₹{metrics.totalRevenue.toLocaleString('en-IN')}</div>
              <span className="metric-foot">Collected via Razorpay Gateway</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Total Orders Placed</span>
              <div className="metric-number price-num">{metrics.totalOrders}</div>
              <span className="metric-foot">All customer orders registered</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Catalog Products</span>
              <div className="metric-number price-num">{metrics.totalProducts}</div>
              <span className="metric-foot">Active items in live catalog</span>
            </div>

            <div className="metric-card">
              <span className="metric-label">Total Units in Stock</span>
              <div className="metric-number price-num">{metrics.totalInventoryStock}</div>
              <span className="metric-foot">Across all warehouses</span>
            </div>
          </div>

          {/* Category Revenue Breakdown */}
          <div className="admin-subpanel" style={{ marginTop: '24px' }}>
            <h3 className="subpanel-title">Revenue by Department</h3>
            <div className="category-bars-grid">
              {Object.entries(analyticsData?.categorySales || {}).length === 0 ? (
                <p style={{ color: 'var(--ink-500)', fontSize: '13px' }}>
                  No sales recorded yet. Once customers make purchases, revenue distribution will appear here.
                </p>
              ) : (
                Object.entries(analyticsData.categorySales).map(([cat, amount]) => (
                  <div key={cat} className="cat-bar-item">
                    <div className="cat-bar-head">
                      <span>{cat}</span>
                      <strong className="price-num">₹{Number(amount).toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="cat-bar-track">
                      <div
                        className="cat-bar-fill"
                        style={{
                          width: `${Math.min(100, Math.round((Number(amount) / (metrics.totalRevenue || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE ORDERS */}
      {activeTab === 'orders' && (
        <div className="admin-view-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="subpanel-title">Customer Orders Management</h3>
              <p className="subpanel-desc">Review order status, customer delivery info, and update fulfillment.</p>
            </div>
            <span className="count-pill">{orders.length} orders total</span>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-title">No orders placed yet</h3>
              <p className="empty-desc">When users complete checkout via Razorpay, orders will appear here for fulfillment.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Payment</th>
                    <th>Fulfillment Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.orderId}>
                      <td>
                        <strong className="price-num">#{o.orderId}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--ink-400)' }}>
                          {new Date(o.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td>
                        <div><strong>{o.user?.username || 'Customer'}</strong></div>
                        <div style={{ fontSize: '12px', color: 'var(--ink-500)' }}>{o.user?.emailId}</div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12.5px' }}>
                          {(o.items || []).length} item(s)
                        </span>
                      </td>
                      <td>
                        <strong className="price-num">₹{Number(o.totalAmount).toLocaleString('en-IN')}</strong>
                      </td>
                      <td>
                        <span className="pill-badge-paid">
                          <CheckCircle size={12} weight="fill" /> Razorpay Paid
                        </span>
                      </td>
                      <td>
                        <select
                          className="status-dropdown"
                          value={o.fulfillmentStatus || 'Processing'}
                          onChange={(e) => handleUpdateOrderStatus(o.orderId, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ADD & MANAGE PRODUCTS */}
      {activeTab === 'add-product' && (
        <div className="admin-view-panel">
          {/* Add Product Form */}
          <div className="admin-subpanel" style={{ marginBottom: '32px' }}>
            <h3 className="subpanel-title">Add New Product to Catalog</h3>
            <p className="subpanel-desc">Expand store inventory with instant live catalog sync.</p>

            <form onSubmit={handleAddProduct} className="add-product-form">
              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-name">Product Name *</label>
                  <input
                    id="prod-name"
                    type="text"
                    className="text-input"
                    placeholder="e.g. Minimalist Ceramic Cup"
                    value={newProduct.productName}
                    onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-cat">Category *</label>
                  <select
                    id="prod-cat"
                    className="text-input"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    required
                  >
                    <option value="ELECTRONICS">Electronics</option>
                    <option value="FOOTWEAR">Footwear</option>
                    <option value="APPAREL">Apparel</option>
                    <option value="ACCESSORIES">Accessories</option>
                    <option value="BAGS">Bags</option>
                    <option value="AUDIO">Audio</option>
                    <option value="HOME">Home & Living</option>
                    <option value="BEAUTY">Beauty</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-price">Price (₹) *</label>
                  <input
                    id="prod-price"
                    type="number"
                    min="1"
                    className="text-input"
                    placeholder="e.g. 1499"
                    value={newProduct.productPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, productPrice: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-grid-3">
                <div className="form-group">
                  <label className="form-label" htmlFor="prod-id">Product SKU / ID (Optional)</label>
                  <input
                    id="prod-id"
                    type="text"
                    className="text-input"
                    placeholder="Leave blank for auto (e.g. P117)"
                    value={newProduct.productId}
                    onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-qty">Stock Units</label>
                  <input
                    id="prod-qty"
                    type="number"
                    min="0"
                    className="text-input"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="prod-img">Image URL</label>
                  <input
                    id="prod-img"
                    type="url"
                    className="text-input"
                    placeholder="https://images.unsplash.com/..."
                    value={newProduct.productImage}
                    onChange={(e) => setNewProduct({ ...newProduct, productImage: e.target.value })}
                  />
                  <div style={{ marginTop: '4px', display: 'flex', gap: '6px', fontSize: '11px' }}>
                    <span style={{ color: 'var(--ink-400)' }}>Preset:</span>
                    <button type="button" onClick={() => fillSampleImage(newProduct.category)} style={{ color: 'var(--ink-700)', textDecoration: 'underline' }}>
                      Auto-fill Unsplash
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prod-desc">Product Description</label>
                <textarea
                  id="prod-desc"
                  className="text-input"
                  style={{ height: '70px', padding: '8px 12px' }}
                  placeholder="Provide specifications, material, and key features..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn-solid"
                disabled={isSubmittingProduct}
                style={{ width: 'auto', padding: '0 24px' }}
              >
                {isSubmittingProduct ? 'Saving...' : 'Add Product to Storefront'}
              </button>
            </form>
          </div>

          {/* Current Inventory Table with Pagination */}
          <div className="admin-subpanel">
            <div className="panel-header-row" style={{ marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 className="subpanel-title">Current Catalog ({products.length} Items)</h3>
                <p className="subpanel-desc" style={{ marginBottom: 0 }}>
                  Showing {products.length > 0 ? catalogStartIndex + 1 : 0}–{Math.min(catalogStartIndex + catalogPageSize, products.length)} of {products.length} items &middot; Page {safeCatalogPage} of {totalCatalogPages}
                </p>
              </div>

              {/* Page size dropdown */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                <span style={{ color: 'var(--ink-500)' }}>Per page:</span>
                <select
                  className="status-dropdown"
                  style={{ padding: '3px 8px', fontSize: '12px' }}
                  value={catalogPageSize}
                  onChange={(e) => {
                    setCatalogPageSize(Number(e.target.value));
                    setCatalogPage(1);
                  }}
                  aria-label="Items per page"
                >
                  <option value={4}>4</option>
                  <option value={6}>6</option>
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                </select>
              </div>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Department</th>
                    <th>Price</th>
                    <th>Inventory</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCatalog.map((p) => (
                    <tr key={p.productId}>
                      <td><span className="price-num">{p.productId}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={p.productImage}
                            alt={p.productName}
                            style={{ width: '36px', height: '36px', objectFit: 'contain', background: 'var(--bg-subtle)', borderRadius: '4px' }}
                          />
                          <span style={{ fontWeight: 500 }}>{p.productName}</span>
                        </div>
                      </td>
                      <td><span style={{ fontSize: '12px', color: 'var(--ink-500)' }}>{p.category}</span></td>
                      <td><strong className="price-num">₹{Number(p.productPrice).toLocaleString('en-IN')}</strong></td>
                      <td>
                        <span style={{ color: Number(p.quantity) > 0 ? 'var(--success-text)' : 'var(--error-text)', fontWeight: 600 }}>
                          {p.quantity} in stock
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-action-icon danger"
                          onClick={() => handleDeleteProduct(p.productId, p.productName)}
                          title="Delete product"
                        >
                          <Trash size={16} weight="regular" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalCatalogPages > 1 && (
              <div className="catalog-pagination-bar">
                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() => setCatalogPage((p) => Math.max(1, p - 1))}
                  disabled={safeCatalogPage <= 1}
                  aria-label="Previous Page"
                >
                  <CaretLeft size={14} weight="bold" />
                  <span>Previous</span>
                </button>

                <div className="page-numbers-group">
                  {Array.from({ length: totalCatalogPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`page-num-btn ${safeCatalogPage === num ? 'active' : ''}`}
                      onClick={() => setCatalogPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="page-nav-btn"
                  onClick={() => setCatalogPage((p) => Math.min(totalCatalogPages, p + 1))}
                  disabled={safeCatalogPage >= totalCatalogPages}
                  aria-label="Next Page"
                >
                  <span>Next</span>
                  <CaretRight size={14} weight="bold" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CASH & TRANSACTIONS */}
      {activeTab === 'cash' && (
        <div className="admin-view-panel">
          <div className="panel-header-row">
            <div>
              <h3 className="subpanel-title">Cash & Razorpay Payment Logs</h3>
              <p className="subpanel-desc">Real-time payment settlements, customer receipts, and gateway transaction IDs.</p>
            </div>
            <div className="cash-summary-pill">
              <span>Total Settled:</span>
              <strong className="price-num">₹{metrics.totalRevenue.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="empty-state">
              <h3 className="empty-title">No transactions recorded</h3>
              <p className="empty-desc">Completed orders via Razorpay will be listed here as verified cash entries.</p>
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Payment ID</th>
                    <th>Order Reference</th>
                    <th>Customer</th>
                    <th>Amount Paid</th>
                    <th>Gateway Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.orderId}>
                      <td style={{ fontSize: '12px', color: 'var(--ink-500)' }}>
                        {new Date(o.createdAt).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <code className="code-badge price-num">
                          {o.payment?.razorpayPaymentId || 'Verified'}
                        </code>
                      </td>
                      <td><strong className="price-num">#{o.orderId}</strong></td>
                      <td>
                        <div>{o.user?.username || 'Customer'}</div>
                        <div style={{ fontSize: '11.5px', color: 'var(--ink-400)' }}>{o.user?.emailId}</div>
                      </td>
                      <td>
                        <strong className="price-num" style={{ color: 'var(--success-text)', fontSize: '14px' }}>
                          +₹{Number(o.totalAmount).toLocaleString('en-IN')}
                        </strong>
                      </td>
                      <td>
                        <span className="pill-badge-paid">
                          <CheckCircle size={12} weight="fill" /> Captured
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
