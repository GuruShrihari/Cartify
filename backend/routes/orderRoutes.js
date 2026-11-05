const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// Helper to authenticate user or guest
const authenticateRequest = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'cartify_jwt_secret_key_default'
      );
      req.user = decoded;
    }
  } catch (e) {
    // Continue
  }
  next();
};

// Admin verification
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
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

// Resend Email Helper
const sendOrderConfirmationEmail = async ({ toEmail, username, order }) => {
  const apiKey = process.env.RESEND_API_KEY || 're_6u2BZ5An_621ZyZ3tQBFVXTPhgjBoqsb5';
  const mailFrom = process.env.MAIL_FROM || 'noreply@sreeaditya.tech';

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee;">
          <strong style="color: #171717;">${item.productName}</strong><br/>
          <span style="font-size: 12px; color: #777777;">Qty: ${item.quantity} &times; ₹${Number(item.productPrice).toLocaleString('en-IN')}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #eeeeee; text-align: right; font-weight: 600; color: #171717;">
          ₹${Number(item.itemTotal).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f8; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e5e7; padding: 32px; color: #171717;">
        <div style="border-bottom: 1px solid #e5e5e7; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="font-size: 22px; margin: 0; letter-spacing: -0.03em;">Cartify</h1>
          <p style="margin: 4px 0 0; color: #737373; font-size: 13px;">Order Confirmation &middot; #${order.orderId}</p>
        </div>

        <p style="font-size: 15px; margin: 0 0 16px;">Hello <strong>${username || 'Customer'}</strong>,</p>
        <p style="font-size: 14px; color: #525252; line-height: 1.5; margin: 0 0 24px;">
          Thank you for your purchase. We have successfully received your payment via <strong>Razorpay</strong> and your order is currently being prepared for dispatch.
        </p>

        <div style="background: #fafafa; border: 1px solid #eeeeee; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; color: #525252;">
            <tr>
              <td><strong>Order ID:</strong></td>
              <td style="text-align: right; color: #171717;">${order.orderId}</td>
            </tr>
            <tr>
              <td><strong>Payment ID:</strong></td>
              <td style="text-align: right; color: #171717;">${order.payment.razorpayPaymentId || 'Verified'}</td>
            </tr>
            <tr>
              <td><strong>Status:</strong></td>
              <td style="text-align: right; color: #166534; font-weight: 600;">Paid &middot; Processing</td>
            </tr>
          </table>
        </div>

        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #737373; margin: 0 0 12px;">Items Ordered</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 16px; font-weight: 600;">Total Amount Paid</td>
              <td style="padding-top: 16px; text-align: right; font-weight: 700; font-size: 16px;">₹${Number(order.totalAmount).toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div style="border-top: 1px solid #e5e5e7; padding-top: 20px; font-size: 12px; color: #737373; text-align: center;">
          <p style="margin: 0 0 4px;">Deliveries are tracked and fulfilled by Cartify Logistics.</p>
          <p style="margin: 0;">Questions? Reply directly to this email or visit your account portal.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Cartify <${mailFrom}>`,
        to: [toEmail],
        subject: `Order Confirmed: #${order.orderId} - Cartify`,
        html: emailHtml,
      }),
    });
    const data = await res.json();
    console.log(`[Resend Order Confirmation Email] Dispatched to ${toEmail}:`, data);
    return { success: res.ok, data };
  } catch (err) {
    console.error('[Resend Email Error]:', err.message);
    return { success: false, error: err.message };
  }
};

// Resend Status Update Email Helper
const sendStatusUpdateEmail = async ({ toEmail, username, order, newStatus }) => {
  const apiKey = process.env.RESEND_API_KEY || 're_6u2BZ5An_621ZyZ3tQBFVXTPhgjBoqsb5';
  const mailFrom = process.env.MAIL_FROM || 'noreply@sreeaditya.tech';

  let headline = `Your order status is now ${newStatus}`;
  let message = `Great news! Your Cartify order #${order.orderId} status has been updated to "${newStatus}".`;
  let badgeColor = '#2563eb';

  if (newStatus === 'Shipped') {
    headline = 'Your Order Has Shipped!';
    message = `Exciting news! Your order #${order.orderId} is on its way. Our courier team has dispatched your items.`;
    badgeColor = '#2563eb';
  } else if (newStatus === 'Delivered') {
    headline = 'Your Order Has Been Delivered!';
    message = `Your order #${order.orderId} has been successfully delivered. We hope you love your new essentials!`;
    badgeColor = '#166534';
  }

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"/></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f8; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e5e5e7; padding: 32px; color: #171717;">
        <div style="border-bottom: 1px solid #e5e5e7; padding-bottom: 20px; margin-bottom: 24px;">
          <h1 style="font-size: 22px; margin: 0; letter-spacing: -0.03em;">Cartify</h1>
          <p style="margin: 4px 0 0; color: #737373; font-size: 13px;">Shipment Update &middot; #${order.orderId}</p>
        </div>

        <h2 style="font-size: 18px; color: #171717; margin: 0 0 12px;">${headline}</h2>
        <p style="font-size: 14px; color: #525252; line-height: 1.5; margin: 0 0 20px;">
          Hello <strong>${username || 'Customer'}</strong>,<br/><br/>
          ${message}
        </p>

        <div style="background: #fafafa; border: 1px solid #eeeeee; border-radius: 6px; padding: 16px; margin-bottom: 24px;">
          <table style="width: 100%; font-size: 13px; color: #525252;">
            <tr>
              <td><strong>Order ID:</strong></td>
              <td style="text-align: right; color: #171717;">${order.orderId}</td>
            </tr>
            <tr>
              <td><strong>Updated Status:</strong></td>
              <td style="text-align: right; color: ${badgeColor}; font-weight: 700;">${newStatus}</td>
            </tr>
            <tr>
              <td><strong>Delivery Destination:</strong></td>
              <td style="text-align: right; color: #171717;">${order.shippingAddress?.city || 'Default Location'}</td>
            </tr>
          </table>
        </div>

        <p style="font-size: 13px; color: #737373; margin: 0 0 20px;">
          You can track your order live anytime in your Cartify account under <strong>My Orders</strong>.
        </p>

        <div style="border-top: 1px solid #e5e5e7; padding-top: 20px; font-size: 12px; color: #737373; text-align: center;">
          <p style="margin: 0 0 4px;">Thank you for shopping with Cartify.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Cartify <${mailFrom}>`,
        to: [toEmail],
        subject: `Update: Order #${order.orderId} is now ${newStatus} - Cartify`,
        html: emailHtml,
      }),
    });
    const data = await res.json();
    console.log(`[Resend Status Update Email] Dispatched to ${toEmail}:`, data);
    return { success: res.ok, data };
  } catch (err) {
    console.error('[Resend Status Update Email Error]:', err.message);
    return { success: false, error: err.message };
  }
};

// 1. POST /api/payments/create-order
router.post('/create-order', authenticateRequest, async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Valid payment amount is required.' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TBk2cz1k0IdiW4';
    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'Ki4wmCXQzOnissELm0N3Mzla';

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    return res.status(500).json({ message: 'Error initiating payment: ' + error.message });
  }
});

// 2. POST /api/payments/verify-payment
router.post('/verify-payment', authenticateRequest, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      shippingAddress,
      customerEmail,
      customerName,
    } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET || 'Ki4wmCXQzOnissELm0N3Mzla';

    // Verify HMAC SHA256 Signature
    if (razorpay_signature && razorpay_order_id && razorpay_payment_id) {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed: invalid signature.' });
      }
    }

    // Determine recipient user and email
    const email = (customerEmail || req.user?.emailId || 'customer@cartify.com').trim().toLowerCase();
    const name = (customerName || req.user?.username || 'Valued Customer').trim();

    // Generate readable Order ID
    const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const formattedItems = (items || []).map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage || '',
      productPrice: Number(item.productPrice),
      quantity: Number(item.quantity) || 1,
      itemTotal: Number(item.productPrice) * (Number(item.quantity) || 1),
    }));

    const finalTotal = totalAmount || formattedItems.reduce((sum, i) => sum + i.itemTotal, 0);

    const newOrder = new Order({
      orderId,
      user: {
        emailId: email,
        username: name,
      },
      items: formattedItems,
      totalAmount: finalTotal,
      currency: 'INR',
      shippingAddress: shippingAddress || {
        fullName: name,
        addressLine: 'Default delivery address',
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600001',
        phone: '9876543210',
      },
      payment: {
        gateway: 'razorpay',
        razorpayOrderId: razorpay_order_id || `sim_${Date.now()}`,
        razorpayPaymentId: razorpay_payment_id || `pay_${Date.now()}`,
        razorpaySignature: razorpay_signature || 'verified',
        status: 'paid',
      },
      fulfillmentStatus: 'Processing',
      emailSent: false,
    });

    await newOrder.save();

    // Decrement stock for purchased items
    for (const item of formattedItems) {
      await Product.updateOne(
        { productId: item.productId },
        { $inc: { quantity: -item.quantity } }
      ).catch(() => {});
    }

    // Send confirmation email via Resend
    let emailResult = await sendOrderConfirmationEmail({
      toEmail: email,
      username: name,
      order: newOrder,
    });

    if (emailResult.success) {
      newOrder.emailSent = true;
      newOrder.emailReceiptId = emailResult.data?.id;
      await newOrder.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order created successfully.',
      order: newOrder,
      emailSent: newOrder.emailSent,
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ message: 'Error processing order payment: ' + error.message });
  }
});

// 3. GET /api/orders/my-orders (User order history)
router.get('/my-orders', authenticateRequest, async (req, res) => {
  try {
    const email = req.user?.emailId || req.query.emailId;
    if (!email) {
      return res.status(400).json({ message: 'User email is required.' });
    }

    const orders = await Order.find({ 'user.emailId': email.toLowerCase() }).sort({ createdAt: -1 });
    return res.status(200).json({ count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching orders: ' + error.message });
  }
});

// 4. GET /api/orders/:orderId (Order details)
router.get('/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: `Order #${orderId} not found.` });
    }
    return res.status(200).json({ order });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving order: ' + error.message });
  }
});

// 5. GET /api/admin/orders (Admin: view all orders)
router.get('/admin/all', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return res.status(200).json({ count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving all orders: ' + error.message });
  }
});

// 6. PATCH /api/admin/orders/:orderId/status (Admin: update status)
router.patch('/admin/:orderId/status', verifyAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { fulfillmentStatus } = req.body;

    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: `Order #${orderId} not found.` });
    }

    if (fulfillmentStatus) {
      const oldStatus = order.fulfillmentStatus;
      order.fulfillmentStatus = fulfillmentStatus;
      await order.save();

      // If status changed and user has an email, dispatch shipment notification
      if (order.user?.emailId && oldStatus !== fulfillmentStatus) {
        sendStatusUpdateEmail({
          toEmail: order.user.emailId,
          username: order.user.username,
          order,
          newStatus: fulfillmentStatus,
        }).catch((e) => console.error('[Order Status Email Error]:', e.message));
      }
    }

    return res.status(200).json({
      message: `Order #${orderId} status updated to "${order.fulfillmentStatus}".`,
      order,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating order status: ' + error.message });
  }
});

// 7. GET /api/admin/analytics (Admin: analytics, metrics & cash flow)
router.get('/admin/analytics', verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.find({ 'payment.status': 'paid' });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const totalProducts = await Product.countDocuments();
    const products = await Product.find({});
    const totalInventoryStock = products.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

    const totalUsers = await User.countDocuments();

    // Revenue by category
    const categorySales = {};
    for (const order of paidOrders) {
      for (const item of order.items || []) {
        const product = products.find((p) => p.productId === item.productId);
        const cat = product?.category || 'OTHER';
        categorySales[cat] = (categorySales[cat] || 0) + Number(item.itemTotal || 0);
      }
    }

    // Recent orders
    const recentOrders = await Order.find({}).sort({ createdAt: -1 }).limit(10);

    // Cash/transactions list
    const transactions = paidOrders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 15)
      .map((o) => ({
        orderId: o.orderId,
        paymentId: o.payment?.razorpayPaymentId || 'N/A',
        customer: o.user?.username || o.user?.emailId,
        email: o.user?.emailId,
        amount: o.totalAmount,
        status: o.payment?.status,
        date: o.createdAt,
      }));

    return res.status(200).json({
      metrics: {
        totalRevenue,
        totalOrders,
        totalProducts,
        totalInventoryStock,
        totalUsers,
      },
      categorySales,
      recentOrders,
      transactions,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error computing analytics: ' + error.message });
  }
});

module.exports = router;
