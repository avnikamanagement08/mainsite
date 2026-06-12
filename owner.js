// ==========================================
// AVANIKA.CO — Owner Dashboard Controller
// owner.js
// ==========================================

'use strict';

// 1. GATEWAY ACCESS CONTROL CHECK
(function() {
  if (!window.isAdminAuthorized) {
    console.warn('🔌 Access Denied: Invalid owner dashboard security token.');
    document.addEventListener('DOMContentLoaded', () => {
      const mount = document.getElementById('dashboard-mount');
      if (mount) mount.remove();
      
      const devBtn = document.getElementById('supabase-dev-console-btn');
      if (devBtn) devBtn.remove();

      const devModal = document.getElementById('supabase-dev-modal');
      if (devModal) devModal.remove();
    });
    throw new Error("Access Denied: Invalid Token");
  }
})();

// Shared database structures for offline simulation fallback
const MOCK_ORDERS = [
  {
    id: "AVN-2026-F981X2",
    customer_name: "Sarah Mitchell",
    phone: "9876543210",
    address: "Flat 4B, Emerald Heights, Linking Road",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "400054",
    payment_mode: "prepaid",
    items: [
      { id: "p1-6-yellowgold-diamond", name: "Meera Anti-Tarnish Kundan Chandbalis", price: 1899.00, quantity: 1, category: "Earrings", image: "images/earrings/1/WhatsApp Image 2026-06-11 at 9.13.35 PM.jpeg" }
    ],
    subtotal: 1899.00,
    shipping: 0.00,
    discount: 100.00,
    tax: 114.00,
    total: 1913.00,
    delivery_status: "processing",
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  },
  {
    id: "AVN-2026-B812P9",
    customer_name: "Aisha Rahman",
    phone: "9123456789",
    address: "Apt 12, Gold Crest Towers, Sector 15",
    city: "Noida",
    state: "Uttar Pradesh",
    pincode: "201301",
    payment_mode: "cod",
    items: [
      { id: "p2-7-yellowgold-emerald", name: "Aura Celestial Gold Plated Hoops", price: 1299.00, quantity: 1, category: "Earrings", image: "images/earrings/2/WhatsApp Image 2026-06-12 at 10.42.03 AM.jpeg" }
    ],
    subtotal: 1299.00,
    shipping: 50.00,
    discount: 0.00,
    tax: 78.00,
    total: 1427.00,
    delivery_status: "shipped",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  }
];

const MOCK_RETURNS = [
  {
    id: "RET-2026-08A",
    order_id: "AVN-2026-F981X2",
    customer_name: "Sarah Mitchell",
    product_details: "Meera Anti-Tarnish Kundan Chandbalis (Qty: 1)",
    reason: "Incorrect Size / Fit — Needs one size larger.",
    created_at: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    status: "processing"
  }
];

const MOCK_ACCOUNTS = [
  {
    id: "USR-004812",
    name: "Amara Osei",
    email: "amara.osei@gmail.com",
    joined_date: "May 10, 2026",
    lifetime_orders: 3,
    total_spent: 8450.00,
    status: "Active"
  },
  {
    id: "USR-005193",
    name: "Sarah Mitchell",
    email: "sarah.mitchell@gmail.com",
    joined_date: "June 2, 2026",
    lifetime_orders: 1,
    total_spent: 1913.00,
    status: "Active"
  }
];

const MOCK_ABANDONS = [
  {
    email: "priya.sharma@gmail.com",
    phone: "8887776665",
    cart_items: [
      { id: "p6-7-platinum-pearl", name: "Tara Rose Gold Starburst Dangles", price: 1599.00, quantity: 1, category: "Earrings", image: "images/earrings/6/WhatsApp Image 2026-06-12 at 3.18.11 PM.jpeg" }
    ],
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

const MOCK_EMAILS = [
  {
    id: "EML-482910",
    to_email: "sarah.mitchell@gmail.com",
    subject: "Order Confirmed: AVN-2026-F981X2",
    body: "Hi Sarah Mitchell,\n\nYour order AVN-2026-F981X2 has been placed successfully.\nTotal paid: ₹2,399.00.",
    sent_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

let orders = [];
let returns = [];
let accounts = [];
let inventory = [];
let abandons = [];
let emails = [];
let goldRate = 7200.00;

// Mount the dashboard HTML structures dynamically
function mountDashboard() {
  const adScreen = document.getElementById('access-denied-screen');
  if (adScreen) adScreen.style.display = 'none';
  
  document.title = "AVANIKA.CO — Owner Console";

  const dashboardHTML = `
    <!-- ===== NAVBAR ===== -->
    <nav class="navbar scrolled" id="navbar">
      <div class="nav-container">
        <a href="index.html" class="nav-logo" style="display: flex; align-items: center; gap: 0.8rem; text-decoration: none;">
          <img src="images/logo.png" alt="AVNIKA" class="nav-logo-img" />
          <span class="nav-logo-text" style="font-family: var(--font-serif); font-size: 1.6rem; font-weight: 500; letter-spacing: 0.15em; color: var(--cream); text-transform: uppercase;">Avanika.co</span>
        </a>
        <div class="nav-actions" style="display: flex; align-items: center; gap: 1rem;">
          <span style="font-size: 0.72rem; color: #2a9d8f; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(42, 157, 143, 0.1); padding: 0.4rem 0.8rem; border: 1px solid rgba(42, 157, 143, 0.2); border-radius: var(--btn-radius);">Owner Console</span>
          <button id="admin-logout-btn" style="font-size: 0.72rem; color: #c94c4c; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background: rgba(201, 76, 76, 0.1); padding: 0.4rem 0.8rem; border: 1px solid rgba(201, 76, 76, 0.2); border-radius: var(--btn-radius); cursor: pointer; transition: background 0.3s ease;">Logout</button>
        </div>
      </div>
    </nav>

    <!-- ===== MAIN DASHBOARD WRAPPER ===== -->
    <main class="dashboard-wrapper" style="padding-top: calc(var(--nav-h) + 2rem); min-height: 100vh; background: var(--black); color: var(--cream); font-family: 'Inter', sans-serif;">
      <div class="dashboard-container" style="max-width: 1300px; margin: 0 auto; padding: 2rem 5%;">
        
        <!-- Dashboard Header -->
        <header class="dashboard-header" style="margin-bottom: 2.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--black-4); padding-bottom: 1.5rem;">
          <div>
            <h2 class="dashboard-brand-title" style="font-family: var(--font-serif); font-size: 2rem; color: var(--cream); font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">Avanika.co <em>Reports</em></h2>
            <p style="font-size: 0.82rem; color: var(--cream-muted); margin-top: 0.2rem;">Interconnected inventory managers, gold rates spot controls, checkouts and returns.</p>
          </div>
        </header>

        <!-- Metrics Bento Grid -->
        <section class="dashboard-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
          <div class="metric-card accent-gold" style="background: var(--black-2); border: 1px solid var(--black-4); border-left: 4px solid var(--gold); padding: 1.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
            <span class="metric-label" style="font-size: 0.72rem; text-transform: uppercase; color: var(--cream-muted); letter-spacing: 0.05em; font-weight: 600;">Total Revenue</span>
            <span class="metric-value" id="metricRevenue" style="font-size: 1.8rem; font-family: var(--font-serif); font-weight: bold; color: var(--cream);">₹0.00</span>
            <span class="metric-trend trend-up" style="font-size: 0.72rem; color: #2a9d8f;">Paid Orders Confirmation</span>
          </div>
          <div class="metric-card accent-green" style="background: var(--black-2); border: 1px solid var(--black-4); border-left: 4px solid #2a9d8f; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
            <span class="metric-label" style="font-size: 0.72rem; text-transform: uppercase; color: var(--cream-muted); letter-spacing: 0.05em; font-weight: 600;">Orders Placed</span>
            <span class="metric-value" id="metricOrders" style="font-size: 1.8rem; font-family: var(--font-serif); font-weight: bold; color: var(--cream);">0</span>
            <span class="metric-trend trend-up" style="font-size: 0.72rem; color: #2a9d8f;">Checkouts database</span>
          </div>
          <div class="metric-card accent-red" style="background: var(--black-2); border: 1px solid var(--black-4); border-left: 4px solid #c94c4c; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
            <span class="metric-label" style="font-size: 0.72rem; text-transform: uppercase; color: var(--cream-muted); letter-spacing: 0.05em; font-weight: 600;">Returned rate</span>
            <span class="metric-value" id="metricReturns" style="font-size: 1.8rem; font-family: var(--font-serif); font-weight: bold; color: var(--cream);">0%</span>
            <span class="metric-trend trend-down" style="font-size: 0.72rem; color: #c94c4c;">Returned delivery logs</span>
          </div>
          <div class="metric-card accent-gold" style="background: var(--black-2); border: 1px solid var(--black-4); border-left: 4px solid var(--gold); padding: 1.5rem; display: flex; flex-direction: column; gap: 0.4rem;">
            <span class="metric-label" style="font-size: 0.72rem; text-transform: uppercase; color: var(--cream-muted); letter-spacing: 0.05em; font-weight: 600;">Active Site Visits</span>
            <span class="metric-value" id="metricTraffic" style="font-size: 1.8rem; font-family: var(--font-serif); font-weight: bold; color: var(--cream);">47</span>
            <span class="metric-trend trend-up" style="font-size: 0.72rem; color: #2a9d8f;">Live pulsing analytics</span>
          </div>
        </section>

        <!-- Tabs Navigation -->
        <nav class="dashboard-tabs" style="display: flex; gap: 0.5rem; overflow-x: auto; border-bottom: 1px solid var(--black-4); padding-bottom: 0.8rem; margin-bottom: 2rem;">
          <button class="tab-btn active" data-tab="tab-orders" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Live Orders</button>
          <button class="tab-btn" data-tab="tab-inventory" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Inventory Manager</button>
          <button class="tab-btn" data-tab="tab-returns" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Parcels Returned</button>
          <button class="tab-btn" data-tab="tab-accounts" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Accounts & Loyalty</button>
          <button class="tab-btn" data-tab="tab-abandons" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Abandoned Carts</button>
          <button class="tab-btn" data-tab="tab-emails" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Mail Logs</button>
          <button class="tab-btn" data-tab="tab-traffic" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Traffic Insights</button>
        </nav>

        <!-- TAB 1: LIVE ORDERS PANE -->
        <div class="dashboard-pane active" id="tab-orders">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-family: var(--font-serif); font-size:1.3rem; color:var(--cream); font-weight:500;">Live Checkout Orders</h3>
          </div>
          <div class="admin-table-wrapper" style="overflow-x: auto; background: var(--black-2); border: 1px solid var(--black-4);">
            <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="background: var(--black-3); border-bottom: 1px solid var(--black-4);">
                  <th style="padding: 1rem;">Order ID</th>
                  <th style="padding: 1rem;">Recipient</th>
                  <th style="padding: 1rem;">Address Details</th>
                  <th style="padding: 1rem;">Items List</th>
                  <th style="padding: 1rem;">Tax (GST)</th>
                  <th style="padding: 1rem;">Total Paid</th>
                  <th style="padding: 1rem;">Payment</th>
                  <th style="padding: 1rem;">Delivery Status</th>
                </tr>
              </thead>
              <tbody id="adminOrdersList">
                <tr>
                  <td colspan="8" style="text-align: center; padding: 3rem 0; color: var(--cream-muted);">Loading orders data...</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 2: INVENTORY MANAGER PANE -->
        <div class="dashboard-pane" id="tab-inventory" style="display: none;">
          <div style="display: flex; gap: 2rem; flex-wrap: wrap; margin-bottom: 2rem;">
            <!-- Spot Gold Rate Config -->
            <div style="flex: 1; min-width: 280px; background: var(--black-2); border: 1px solid var(--black-4); padding: 1.5rem;">
              <h4 style="font-family: var(--font-serif); font-size: 1rem; color: var(--gold); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">Spot Gold Rate configuration</h4>
              <form id="goldRateForm" style="display: flex; gap: 0.8rem; align-items: flex-end;">
                <div style="display:flex; flex-direction:column; gap:0.4rem; flex:1;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Gold Rate per Gram (INR)</label>
                  <input type="number" id="inputGoldRate" value="7200" required style="padding: 0.6rem 0.8rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-family: inherit; font-size: 0.85rem;" />
                </div>
                <button type="submit" class="btn-primary" style="width: auto; padding: 0.6rem 1.2rem;">Save Rate</button>
              </form>
              <p style="font-size: 0.72rem; color: var(--cream-muted); margin-top: 0.6rem;">* Updating the rate propagates automatically to all pricing estimates based on making charges and raw gold weights.</p>
            </div>
            
            <!-- Create Product Form -->
            <div style="flex: 2; min-width: 320px; background: var(--black-2); border: 1px solid var(--black-4); padding: 1.5rem;">
              <h4 style="font-family: var(--font-serif); font-size: 1rem; color: var(--gold); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">Create Catalogue Product</h4>
              <form id="createProductForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Product ID</label>
                  <input type="text" id="prodId" placeholder="e.g. p5" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Product Name</label>
                  <input type="text" id="prodName" placeholder="e.g. Bridal Diamond Set" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Category</label>
                  <input type="text" id="prodCategory" placeholder="e.g. Rings, Necklaces" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Gold Weight (grams)</label>
                  <input type="number" step="0.01" id="prodGoldWeight" placeholder="e.g. 5.5" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Making Charges (INR)</label>
                  <input type="number" id="prodMaking" placeholder="e.g. 1200" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Gemstone Cost (INR)</label>
                  <input type="number" id="prodGemstone" placeholder="e.g. 1800" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="grid-column: span 2; display:flex; justify-content: flex-end;">
                  <button type="submit" class="btn-primary" style="width: auto; padding: 0.6rem 1.5rem;">Create Product</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Variants SKU Stock Manager -->
          <div style="background: var(--black-2); border: 1px solid var(--black-4); padding: 1.5rem;">
            <h4 style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--cream); margin-bottom: 1rem; font-weight: 500;">Variant SKU Stock Levels</h4>
            <div class="admin-table-wrapper" style="overflow-x: auto;">
              <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                <thead>
                  <tr style="background: var(--black-3); border-bottom: 1px solid var(--black-4);">
                    <th style="padding: 0.8rem;">SKU ID</th>
                    <th style="padding: 0.8rem;">Size</th>
                    <th style="padding: 0.8rem;">Metal alloy</th>
                    <th style="padding: 0.8rem;">Stone accent</th>
                    <th style="padding: 0.8rem;">Current Stock</th>
                    <th style="padding: 0.8rem; text-align: right;">Replenish Stock</th>
                  </tr>
                </thead>
                <tbody id="adminInventoryList">
                  <!-- Rendered via JS -->
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- TAB 3: RETURNED PARCELS PANE -->
        <div class="dashboard-pane" id="tab-returns" style="display: none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--cream); font-weight: 500;">Returned Parcels & Claims</h3>
          </div>
          <div class="admin-table-wrapper" style="overflow-x: auto; background: var(--black-2); border: 1px solid var(--black-4);">
            <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="background: var(--black-3); border-bottom: 1px solid var(--black-4);">
                  <th style="padding: 1rem;">Return ID</th>
                  <th style="padding: 1rem;">Order ID</th>
                  <th style="padding: 1rem;">Customer</th>
                  <th style="padding: 1rem;">Product Return Details</th>
                  <th style="padding: 1rem;">Reason for Claim</th>
                  <th style="padding: 1rem;">Date Requested</th>
                  <th style="padding: 1rem;">Parcel Status</th>
                </tr>
              </thead>
              <tbody id="adminReturnsList">
                <!-- Rendered via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 4: ACCOUNTS & LOYALTY PANE -->
        <div class="dashboard-pane" id="tab-accounts" style="display: none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--cream); font-weight: 500;">Customer Registration & Loyalty Points</h3>
          </div>
          <div class="admin-table-wrapper" style="overflow-x: auto; background: var(--black-2); border: 1px solid var(--black-4);">
            <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="background: var(--black-3); border-bottom: 1px solid var(--black-4);">
                  <th style="padding: 1rem;">User ID</th>
                  <th style="padding: 1rem;">Customer Name</th>
                  <th style="padding: 1rem;">Email Address</th>
                  <th style="padding: 1rem;">Joined Date</th>
                  <th style="padding: 1rem; text-align:center;">Lifetime Orders</th>
                  <th style="padding: 1rem;">Total Spent</th>
                  <th style="padding: 1rem; text-align:center;">Loyalty Points</th>
                  <th style="padding: 1rem;">Status</th>
                </tr>
              </thead>
              <tbody id="adminAccountsList">
                <!-- Rendered via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 5: ABANDONED CARTS PANE -->
        <div class="dashboard-pane" id="tab-abandons" style="display: none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--cream); font-weight: 500;">Abandoned Carts Log</h3>
          </div>
          <div class="admin-table-wrapper" style="overflow-x: auto; background: var(--black-2); border: 1px solid var(--black-4);">
            <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="background: var(--black-3); border-bottom: 1px solid var(--black-4);">
                  <th style="padding: 1rem;">Customer Contact</th>
                  <th style="padding: 1rem;">Cart Items</th>
                  <th style="padding: 1rem;">Value Estimate</th>
                  <th style="padding: 1rem;">Last Active</th>
                </tr>
              </thead>
              <tbody id="adminAbandonsList">
                <!-- Rendered via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 6: TRANSACTIONAL EMAIL LOGS PANE -->
        <div class="dashboard-pane" id="tab-emails" style="display: none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--cream); font-weight: 500;">Simulated Transmissions Outbox</h3>
          </div>
          <div class="admin-table-wrapper" style="overflow-x: auto; background: var(--black-2); border: 1px solid var(--black-4);">
            <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="background: var(--black-3); border-bottom: 1px solid var(--black-4);">
                  <th style="padding: 1rem;">Mail ID</th>
                  <th style="padding: 1rem;">Recipient</th>
                  <th style="padding: 1rem;">Subject</th>
                  <th style="padding: 1rem;">Message Preview</th>
                  <th style="padding: 1rem;">Sent Time</th>
                </tr>
              </thead>
              <tbody id="adminEmailsList">
                <!-- Rendered via JS -->
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 7: TRAFFIC INSIGHTS PANE -->
        <div class="dashboard-pane" id="tab-traffic" style="display: none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--cream); font-weight: 500;">Website Traffic & Conversion Analysis</h3>
          </div>

          <div class="analytics-flex" style="display: flex; gap: 2rem; flex-wrap: wrap;">
            <!-- Line Chart: Page Views -->
            <div class="chart-card" style="flex: 2; min-width: 350px; background: var(--black-2); border: 1px solid var(--black-4); padding: 1.5rem;">
              <h4 class="chart-title" style="display: flex; justify-content: space-between; font-family: var(--font-serif); font-size: 1rem; color: var(--cream); margin-bottom: 1rem;">
                <span>Weekly Page Views</span>
                <span style="color: var(--gold); font-size: 0.8rem; font-family: var(--font-sans);">Total: 14,820</span>
              </h4>
              <div id="viewsLineChart">
                <!-- Custom SVG graph generated by JS -->
              </div>
            </div>

            <!-- Referrers & Device Split & Funnel -->
            <div style="flex: 1.2; min-width: 300px; display: flex; flex-direction: column; gap: 1.5rem;">
              
              <!-- Conversion Funnel Chart -->
              <div class="chart-card" style="background: var(--black-2); border: 1px solid var(--black-4); padding: 1.5rem;">
                <h4 class="chart-title" style="font-family: var(--font-serif); font-size: 1rem; color: var(--cream); margin-bottom: 1rem;">Conversion Funnel</h4>
                <div id="funnelChart" style="display: flex; flex-direction: column; gap: 0.8rem;">
                  <!-- Rendered via JS -->
                </div>
              </div>

              <div class="chart-card" style="background: var(--black-2); border: 1px solid var(--black-4); padding: 1.5rem;">
                <h4 class="chart-title" style="font-family: var(--font-serif); font-size: 1rem; color: var(--cream); margin-bottom: 1rem;">Traffic Referrers</h4>
                <div id="referrerBarChart" style="display: flex; flex-direction: column; gap: 0.8rem;">
                  <!-- Generated by JS -->
                </div>
              </div>

              <div class="chart-card" style="background: var(--black-2); border: 1px solid var(--black-4); padding: 1.5rem;">
                <h4 class="chart-title" style="font-family: var(--font-serif); font-size: 1rem; color: var(--cream); margin-bottom: 1rem;">Device Breakdown</h4>
                <div id="deviceSplitChart" style="display: flex; gap: 1rem; align-items: center; justify-content: space-around;">
                  <!-- Generated by JS -->
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  `;
  document.getElementById('dashboard-mount').innerHTML = dashboardHTML;
}

// Initialize simulated database data
function initDatabase() {
  if (!localStorage.getItem('avanika_simulated_orders')) {
    localStorage.setItem('avanika_simulated_orders', JSON.stringify(MOCK_ORDERS));
  }
  orders = JSON.parse(localStorage.getItem('avanika_simulated_orders'));

  if (!localStorage.getItem('avanika_simulated_returns')) {
    localStorage.setItem('avanika_simulated_returns', JSON.stringify(MOCK_RETURNS));
  }
  returns = JSON.parse(localStorage.getItem('avanika_simulated_returns'));

  if (!localStorage.getItem('avanika_simulated_accounts')) {
    localStorage.setItem('avanika_simulated_accounts', JSON.stringify(MOCK_ACCOUNTS));
  }
  accounts = JSON.parse(localStorage.getItem('avanika_simulated_accounts'));

  if (!localStorage.getItem('avanika_simulated_abandons')) {
    localStorage.setItem('avanika_simulated_abandons', JSON.stringify(MOCK_ABANDONS));
  }
  abandons = JSON.parse(localStorage.getItem('avanika_simulated_abandons'));

  if (!localStorage.getItem('avanika_simulated_emails')) {
    localStorage.setItem('avanika_simulated_emails', JSON.stringify(MOCK_EMAILS));
  }
  emails = JSON.parse(localStorage.getItem('avanika_simulated_emails'));
}

// Fetch orders data
async function fetchOrdersData() {
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) orders = data;
    } catch (e) {
      console.error('Error fetching live orders:', e);
    }
  }
  renderOrdersTable();
  updateMetrics();
}

// Render the Live Orders Table HTML
function renderOrdersTable() {
  const tableBody = document.getElementById('adminOrdersList');
  if (!tableBody) return;

  tableBody.innerHTML = '';

  if (orders.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem 0; color: var(--cream-muted);">No orders placed yet.</td>
      </tr>
    `;
    return;
  }

  orders.forEach(order => {
    let itemsMarkup = '<div style="display:flex; flex-direction:column; gap:0.4rem;">';
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        let variantInfo = `Size: ${item.size || 'N/A'} | Metal: ${item.metal || 'Gold'} | Stone: ${item.stone || 'CZ'}`;
        if (item.engraving) variantInfo += ` | Eng: "${item.engraving}"`;
        if (item.tryAtHome) variantInfo += ` | [Try-At-Home]`;
        
        itemsMarkup += `
          <div style="font-size:0.8rem; display:flex; align-items:center; gap:0.5rem;">
            <img src="${item.image}" alt="${item.name}" width="24" height="24" style="object-fit:cover; flex-shrink:0;" />
            <span>${item.name} <strong style="color:var(--gold);">x${item.quantity}</strong><br><small style="color:var(--cream-muted); font-size:10px;">${variantInfo}</small></span>
          </div>
        `;
      });
    } else {
      itemsMarkup += '<span style="font-size:0.8rem; color:var(--cream-muted);">No items details</span>';
    }
    itemsMarkup += '</div>';

    const statusSelectHTML = `
      <select class="status-select" data-id="${order.id}" style="padding:0.3rem; background:var(--black-3); border:1px solid var(--black-4); color:var(--cream); font-size:0.8rem;">
        <option value="processing" ${order.delivery_status === 'processing' ? 'selected' : ''}>Processing</option>
        <option value="shipped" ${order.delivery_status === 'shipped' ? 'selected' : ''}>Shipped</option>
        <option value="delivered" ${order.delivery_status === 'delivered' ? 'selected' : ''}>Delivered</option>
        <option value="returned" ${order.delivery_status === 'returned' ? 'selected' : ''}>Returned</option>
      </select>
    `;

    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--black-4)';
    row.innerHTML = `
      <td style="padding: 1rem; font-family: monospace; font-weight:bold; color:var(--gold);">${order.id}</td>
      <td style="padding: 1rem; font-weight:600;">${order.customer_name}<br><span style="font-size:0.75rem; color:var(--cream-muted); font-weight:normal;">${order.phone}</span></td>
      <td style="padding: 1rem; max-width:200px; font-size:0.8rem; line-height:1.4;">
        ${order.address}, ${order.city}, ${order.state} - <strong>${order.pincode}</strong>
      </td>
      <td style="padding: 1rem;">${itemsMarkup}</td>
      <td style="padding: 1rem; font-family:var(--font-serif);">₹${parseFloat(order.tax || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
      <td style="padding: 1rem; font-family:var(--font-serif); font-weight:bold; color:var(--cream);">₹${parseFloat(order.total || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
      <td style="padding: 1rem; text-transform:uppercase; font-size:0.75rem; font-weight:600;">${order.payment_mode}</td>
      <td style="padding: 1rem;">
        <div style="display:flex; align-items:center; gap:0.6rem;">
          <span class="status-badge status-${order.delivery_status}">${order.delivery_status}</span>
          ${statusSelectHTML}
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });

  tableBody.querySelectorAll('.status-select').forEach(select => {
    select.addEventListener('change', function() {
      const orderId = this.getAttribute('data-id');
      const newStatus = this.value;
      updateOrderStatus(orderId, newStatus);
    });
  });
}

// Update order status
async function updateOrderStatus(orderId, status) {
  // UI Badge update
  const selectEl = document.querySelector(`.status-select[data-id="${orderId}"]`);
  if (selectEl) {
    const badge = selectEl.parentElement.querySelector('.status-badge');
    if (badge) {
      badge.className = `status-badge status-${status}`;
      badge.textContent = status;
    }
  }

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { error } = await window.supabaseClient
        .from('orders')
        .update({ delivery_status: status })
        .eq('id', orderId);
      if (error) throw error;
    } catch (e) {
      console.error('Error updating status in Supabase:', e);
    }
  }

  // Update localStorage backup
  const list = JSON.parse(localStorage.getItem('avanika_simulated_orders') || '[]');
  const idx = list.findIndex(o => o.id === orderId);
  if (idx !== -1) {
    list[idx].delivery_status = status;
    localStorage.setItem('avanika_simulated_orders', JSON.stringify(list));
  }
  orders = list;
  
  // If status is changed to Shipped, generate AWB and simulated email
  if (status === 'shipped') {
    const matchedOrder = orders.find(o => o.id === orderId);
    if (matchedOrder) {
      const awb = `AWB-${Math.floor(100000 + Math.random() * 900000)}`;
      const emailOutbox = JSON.parse(localStorage.getItem('avanika_simulated_emails') || '[]');
      emailOutbox.unshift({
        id: `EML-${Math.floor(100000 + Math.random() * 900000)}`,
        to_email: `${matchedOrder.customer_name.replace(/\s+/g, '.').toLowerCase()}@gmail.com`,
        subject: `Your Avanika order is Shipped!`,
        body: `Hi ${matchedOrder.customer_name},\n\nGood news! Your order ${orderId} has been shipped. Track shipment using AWB: ${awb}.\n\nWarm regards,\nAvanika.co`,
        sent_at: new Date().toISOString()
      });
      localStorage.setItem('avanika_simulated_emails', JSON.stringify(emailOutbox));
      fetchEmailsData();
    }
  } else if (status === 'delivered') {
    // Deliver confirmation triggers loyalty reviews request simulated mail
    const matchedOrder = orders.find(o => o.id === orderId);
    if (matchedOrder) {
      const emailOutbox = JSON.parse(localStorage.getItem('avanika_simulated_emails') || '[]');
      emailOutbox.unshift({
        id: `EML-${Math.floor(100000 + Math.random() * 900000)}`,
        to_email: `${matchedOrder.customer_name.replace(/\s+/g, '.').toLowerCase()}@gmail.com`,
        subject: `Write a Review for your jewelry piece!`,
        body: `Hi ${matchedOrder.customer_name},\n\nWe hope you love your package. Please click the link to write a review with photos:\nhttp://localhost:3000/collection.html\n\nThanks,\nAvanika.co`,
        sent_at: new Date().toISOString()
      });
      localStorage.setItem('avanika_simulated_emails', JSON.stringify(emailOutbox));
      fetchEmailsData();
    }
  }

  updateMetrics();
  renderReturnsTable();
}

// Calculate global metrics widgets
function updateMetrics() {
  const metricRevenue = document.getElementById('metricRevenue');
  const metricOrders = document.getElementById('metricOrders');
  const metricReturns = document.getElementById('metricReturns');
  
  if (orders.length > 0) {
    // Revenue calculated only from paid orders (Prepaid OR COD that is Delivered/Shipped)
    const paidOrders = orders.filter(o => o.payment_mode === 'prepaid' || o.delivery_status === 'delivered' || o.delivery_status === 'shipped');
    const totalRev = paidOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
    
    if (metricRevenue) metricRevenue.textContent = `₹${totalRev.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    if (metricOrders) metricOrders.textContent = orders.length;
    
    const returnedCount = orders.filter(o => o.delivery_status === 'returned').length;
    const rate = ((returnedCount / orders.length) * 100).toFixed(1);
    if (metricReturns) metricReturns.textContent = `${rate}%`;
  }
}

// Fetch dynamic inventory levels
async function fetchInventoryData() {
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('inventory')
        .select('*')
        .order('sku', { ascending: true });
        
      if (error) throw error;
      if (data) {
        inventory = data;
        renderInventoryTable();
        return;
      }
    } catch(e) {
      console.error(e);
    }
  }
  
  // Fallback
  const simInv = JSON.parse(localStorage.getItem('avanika_simulated_inventory') || '{}');
  inventory = Object.keys(simInv).map(key => {
    const parts = key.split('-');
    return {
      sku: key,
      product_id: parts[0],
      size: parts[1],
      metal: parts[2] === 'yellowgold' ? '18K Yellow Gold' : parts[2] === 'rosegold' ? '18K Rose Gold' : 'Platinum',
      stone: parts[3] === 'diamond' ? 'CZ Solitaire' : parts[3] === 'emerald' ? 'Simulated Emerald' : 'Cultured Pearl',
      stock: simInv[key]
    };
  });
  renderInventoryTable();
}

function renderInventoryTable() {
  const container = document.getElementById('adminInventoryList');
  if (!container) return;

  container.innerHTML = '';

  inventory.forEach(inv => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--black-4)';
    row.innerHTML = `
      <td style="padding: 0.8rem; font-family: monospace; font-weight:600; color:var(--cream);">${inv.sku}</td>
      <td style="padding: 0.8rem;">Size: ${inv.size}</td>
      <td style="padding: 0.8rem;">${inv.metal}</td>
      <td style="padding: 0.8rem; color:var(--gold);">${inv.stone}</td>
      <td style="padding: 0.8rem; font-weight:bold; color:${inv.stock === 0 ? '#c94c4c' : inv.stock <= 3 ? '#DFB76C' : '#2a9d8f'};">${inv.stock}</td>
      <td style="padding: 0.8rem; text-align: right;">
        <input type="number" class="stock-refill-input" data-sku="${inv.sku}" value="5" min="1" style="width: 50px; padding:0.2rem; background:var(--black-3); border:1px solid var(--black-4); color:var(--cream); text-align:center;" />
        <button type="button" class="btn-refill-stock" data-sku="${inv.sku}" style="padding: 0.25rem 0.6rem; background: var(--gold); border:none; color:#000; font-size:0.75rem; font-weight:bold; cursor:pointer; margin-left:0.4rem;">Refill</button>
      </td>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.btn-refill-stock').forEach(btn => {
    btn.addEventListener('click', function() {
      const sku = this.getAttribute('data-sku');
      const input = container.querySelector(`.stock-refill-input[data-sku="${sku}"]`);
      const addVal = parseInt(input.value) || 0;
      refillVariantStock(sku, addVal);
    });
  });
}

// Refill stock logic
async function refillVariantStock(sku, quantity) {
  const matched = inventory.find(i => i.sku === sku);
  if (!matched) return;

  const newStock = matched.stock + quantity;

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { error } = await window.supabaseClient
        .from('inventory')
        .update({ stock: newStock })
        .eq('sku', sku);
      if (error) throw error;
    } catch (e) {
      console.error(e);
    }
  }

  // Update local storage backup
  const simInv = JSON.parse(localStorage.getItem('avanika_simulated_inventory') || '{}');
  simInv[sku] = newStock;
  localStorage.setItem('avanika_simulated_inventory', JSON.stringify(simInv));

  alert(`⚡ Variant ${sku} replenished successfully. New Stock: ${newStock}`);
  fetchInventoryData();
}

// Fetch gold rate
async function fetchGoldRate() {
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('gold_rates')
        .select('rate_per_gram')
        .eq('id', 'spot')
        .single();
      if (error) throw error;
      if (data) {
        goldRate = parseFloat(data.rate_per_gram);
      }
    } catch(e) {
      console.error(e);
    }
  }
  
  const inputEl = document.getElementById('inputGoldRate');
  if (inputEl) inputEl.value = Math.round(goldRate);
}

// Update gold rate
async function saveGoldRate(rate) {
  goldRate = parseFloat(rate);
  
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { error } = await window.supabaseClient
        .from('gold_rates')
        .update({ rate_per_gram: goldRate })
        .eq('id', 'spot');
      if (error) throw error;
    } catch(e) {
      console.error(e);
    }
  }

  alert(`⚡ Gold Rate updated globally to: ₹${goldRate}/gram`);
}

// Render returns
function renderReturnsTable() {
  const container = document.getElementById('adminReturnsList');
  if (!container) return;

  returns = JSON.parse(localStorage.getItem('avanika_simulated_returns') || '[]');
  container.innerHTML = '';

  if (returns.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; padding: 3rem 0; color: var(--cream-muted);">No returns requested.</td>
      </tr>
    `;
    return;
  }

  returns.forEach(ticket => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--black-4)';
    row.innerHTML = `
      <td style="padding:1rem; font-family:monospace; font-weight:bold; color:var(--gold);">${ticket.id}</td>
      <td style="padding:1rem; font-family:monospace; font-weight:bold;">${ticket.order_id}</td>
      <td style="padding:1rem; font-weight:600;">${ticket.customer_name}</td>
      <td style="padding:1rem; font-size:0.8rem;">${ticket.product_details}</td>
      <td style="padding:1rem; font-size:0.8rem; max-width:250px; line-height:1.4; font-style:italic;">"${ticket.reason}"</td>
      <td style="padding:1rem;">${new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td style="padding:1rem;">
        <span class="status-badge status-${ticket.status === 'processing' ? 'processing' : 'returned'}">
          ${ticket.status === 'processing' ? 'Claim Filed' : 'Refunded'}
        </span>
      </td>
    `;
    container.appendChild(row);
  });
}

// Fetch Accounts Data
async function fetchAccountsData() {
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('loyalty_points')
        .select('*');
        
      if (error) throw error;
      if (data) {
        // Zip DB loyalty points details back to accounts list
        const loyaltyMap = {};
        data.forEach(d => { loyaltyMap[d.user_email] = d.points_credited; });
        
        accounts.forEach(a => {
          if (loyaltyMap[a.email] !== undefined) {
            a.loyalty = loyaltyMap[a.email];
          }
        });
      }
    } catch(e) {
      console.error(e);
    }
  }
  renderAccountsTable();
}

function renderAccountsTable() {
  const container = document.getElementById('adminAccountsList');
  if (!container) return;

  container.innerHTML = '';
  accounts.forEach(user => {
    const pts = user.loyalty || Math.floor(user.total_spent / 100);
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--black-4)';
    row.innerHTML = `
      <td style="padding:1rem; font-family:monospace; font-weight:bold; color:var(--cream-muted);">${user.id}</td>
      <td style="padding:1rem; font-weight:600; color:var(--cream);">${user.name}</td>
      <td style="padding:1rem; font-size:0.8rem; font-family:monospace;">${user.email}</td>
      <td style="padding:1rem;">${user.joined_date}</td>
      <td style="padding:1rem; text-align:center; font-weight:600; color:var(--gold);">${user.lifetime_orders}</td>
      <td style="padding:1rem; font-family:var(--font-serif);">₹${parseFloat(user.total_spent || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
      <td style="padding:1rem; text-align:center; font-weight:bold; color:#2a9d8f;">${pts} Pts</td>
      <td style="padding:1rem;">
        <span class="status-badge status-shipped" style="background:rgba(42,157,143,0.1); border-color:rgba(42,157,143,0.3); color:#2a9d8f;">
          ${user.status}
        </span>
      </td>
    `;
    container.appendChild(row);
  });
}

// Fetch Abandoned checkout logs
async function fetchAbandonsData() {
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('abandoned_carts')
        .select('*')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      if (data) abandons = data;
    } catch(e) {
      console.error(e);
    }
  } else {
    abandons = JSON.parse(localStorage.getItem('avanika_simulated_abandons') || '[]');
  }
  renderAbandonsTable();
}

function renderAbandonsTable() {
  const container = document.getElementById('adminAbandonsList');
  if (!container) return;

  container.innerHTML = '';
  
  if (abandons.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="4" style="text-align: center; padding: 3rem 0; color: var(--cream-muted);">No abandoned carts logged.</td>
      </tr>
    `;
    return;
  }

  abandons.forEach(cart => {
    let itemsStr = '';
    let valSum = 0;
    if (cart.cart_items) {
      itemsStr = cart.cart_items.map(i => {
        valSum += (i.price * i.quantity);
        return `${i.name} (x${i.quantity})`;
      }).join(', ');
    }

    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--black-4)';
    row.innerHTML = `
      <td style="padding:1rem; font-weight:600;">${cart.email}<br><span style="font-size:0.75rem; font-family:monospace; font-weight:normal; color:var(--cream-muted);">${cart.phone || 'No Phone'}</span></td>
      <td style="padding:1rem; font-size:0.8rem; max-width:300px; line-height:1.4;">${itemsStr}</td>
      <td style="padding:1rem; font-family:var(--font-serif); font-weight:bold; color:var(--gold);">₹${valSum.toLocaleString()}</td>
      <td style="padding:1rem; font-size:0.8rem;">${new Date(cart.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
    `;
    container.appendChild(row);
  });
}

// Fetch simulated mail outbox
async function fetchEmailsData() {
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('sent_emails')
        .select('*')
        .order('sent_at', { ascending: false });
      if (error) throw error;
      if (data) emails = data;
    } catch(e) {
      console.error(e);
    }
  } else {
    emails = JSON.parse(localStorage.getItem('avanika_simulated_emails') || '[]');
  }
  renderEmailsTable();
}

function renderEmailsTable() {
  const container = document.getElementById('adminEmailsList');
  if (!container) return;

  container.innerHTML = '';
  
  if (emails.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem 0; color: var(--cream-muted);">Simulated mail outbox is empty.</td>
      </tr>
    `;
    return;
  }

  emails.forEach(mail => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--black-4)';
    row.innerHTML = `
      <td style="padding:1rem; font-family:monospace; font-size:0.75rem; color:var(--cream-muted);">${mail.id || 'N/A'}</td>
      <td style="padding:1rem; font-weight:600;">${mail.to_email}</td>
      <td style="padding:1rem; font-weight:600; color:var(--gold);">${mail.subject}</td>
      <td style="padding:1rem; font-size:0.8rem; max-width:350px; white-space:pre-line; line-height:1.4; color:var(--cream-muted); font-style:italic;">"${mail.body}"</td>
      <td style="padding:1rem; font-size:0.8rem;">${new Date(mail.sent_at || mail.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
    `;
    container.appendChild(row);
  });
}

// Draw Custom Interactive SVG Charts for Traffic Analysis
function drawTrafficCharts() {
  const lineContainer = document.getElementById('viewsLineChart');
  const barContainer = document.getElementById('referrerBarChart');
  const splitContainer = document.getElementById('deviceSplitChart');
  const funnelContainer = document.getElementById('funnelChart');
  
  if (!lineContainer || !barContainer || !splitContainer || !funnelContainer) return;

  // 1. Weekly Page Views Line Graph (SVG)
  lineContainer.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 500 250" style="width:100%; height:auto;">
      <defs>
        <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#DFB76C" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#DFB76C" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <line x1="40" y1="210" x2="480" y2="210" class="chart-axis" style="stroke:var(--black-4); stroke-width:1;" />
      <line x1="40" y1="20" x2="40" y2="210" class="chart-axis" style="stroke:var(--black-4); stroke-width:1;" />
      <line x1="40" y1="147" x2="480" y2="147" class="chart-axis" style="stroke:var(--black-4); stroke-dasharray:4; opacity:0.2;" />
      <line x1="40" y1="83" x2="480" y2="83" class="chart-axis" style="stroke:var(--black-4); stroke-dasharray:4; opacity:0.2;" />
      <line x1="40" y1="20" x2="480" y2="20" class="chart-axis" style="stroke:var(--black-4); stroke-dasharray:4; opacity:0.2;" />
      <text x="10" y="213" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">0</text>
      <text x="10" y="150" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">1.5k</text>
      <text x="10" y="86" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">3k</text>
      <text x="10" y="23" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">4.5k</text>
      <path class="chart-line-area" d="M40,210 L40,159 L113,146 L186,133 L260,117 L333,108 L406,79 L480,100 L480,210 Z" style="fill:url(#chart-gradient);" />
      <path class="chart-line" d="M40,159 L113,146 L186,133 L260,117 L333,108 L406,79 L480,100" style="fill:none; stroke:var(--gold); stroke-width:2;" />
      <circle cx="40" cy="159" r="4" class="chart-dot" style="fill:var(--gold);" />
      <circle cx="113" cy="146" r="4" class="chart-dot" style="fill:var(--gold);" />
      <circle cx="186" cy="133" r="4" class="chart-dot" style="fill:var(--gold);" />
      <circle cx="260" cy="117" r="4" class="chart-dot" style="fill:var(--gold);" />
      <circle cx="333" cy="108" r="4" class="chart-dot" style="fill:var(--gold);" />
      <circle cx="406" cy="79" r="4" class="chart-dot" style="fill:var(--gold);" />
      <circle cx="480" cy="100" r="4" class="chart-dot" style="fill:var(--gold);" />
      <text x="32" y="228" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">Sun</text>
      <text x="105" y="228" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">Mon</text>
      <text x="178" y="228" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">Tue</text>
      <text x="252" y="228" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">Wed</text>
      <text x="325" y="228" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">Thu</text>
      <text x="398" y="228" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">Fri</text>
      <text x="472" y="228" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">Sat</text>
    </svg>
  `;

  // 2. Referrer Bar Chart
  const referrers = [
    { source: "Instagram Link", percent: 62, color: "var(--gold)" },
    { source: "Direct Visits", percent: 24, color: "var(--gold-dark)" },
    { source: "Google Search", percent: 14, color: "#2a9d8f" }
  ];
  
  barContainer.innerHTML = '';
  referrers.forEach(ref => {
    barContainer.innerHTML += `
      <div style="font-size:0.8rem; font-family:inherit;">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
          <span style="font-weight:600; color:var(--cream);">${ref.source}</span>
          <span style="color:var(--gold); font-weight:bold;">${ref.percent}%</span>
        </div>
        <div style="height:6px; background:var(--black-4); overflow:hidden;">
          <div style="height:100%; width:${ref.percent}%; background:${ref.color}; transition: width 1s ease;"></div>
        </div>
      </div>
    `;
  });

  // 3. Device Split Graph (Donut)
  splitContainer.innerHTML = `
    <svg width="100" height="100" viewBox="0 0 36 36" style="transform: rotate(-90deg); flex-shrink:0;">
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--black-4)" stroke-width="4"></circle>
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--gold)" stroke-width="4" stroke-dasharray="74 26" stroke-dashoffset="0"></circle>
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="#2a9d8f" stroke-width="4" stroke-dasharray="26 74" stroke-dashoffset="-74"></circle>
    </svg>
    <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.8rem;">
      <div style="display:flex; align-items:center; gap:0.4rem;">
        <span style="display:block; width:10px; height:10px; background:var(--gold);"></span>
        <span>Mobile Phone: <strong>74%</strong></span>
      </div>
      <div style="display:flex; align-items:center; gap:0.4rem;">
        <span style="display:block; width:10px; height:10px; background:#2a9d8f;"></span>
        <span>Desktop Browser: <strong>26%</strong></span>
      </div>
    </div>
  `;

  // 4. Conversion Funnel Chart
  const funnelSteps = [
    { name: "PDP Views", count: 8520, percent: 100, color: "var(--gold)" },
    { name: "Cart Additions", count: 4089, percent: 48, color: "var(--gold-dark)" },
    { name: "Checkout Started", count: 2044, percent: 24, color: "#2d7f6c" },
    { name: "Successful Purchases", count: 1022, percent: 12, color: "#2a9d8f" }
  ];

  funnelContainer.innerHTML = '';
  funnelSteps.forEach(step => {
    funnelContainer.innerHTML += `
      <div style="font-size:0.8rem; font-family:inherit;">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.2rem;">
          <span style="font-weight:600; color:var(--cream);">${step.name} (${step.count})</span>
          <span style="color:var(--cream-muted);">${step.percent}% conversion</span>
        </div>
        <div style="height:14px; background:var(--black-4); overflow:hidden; display:flex; align-items:center;">
          <div style="height:100%; width:${step.percent}%; background:${step.color}; display:flex; align-items:center; justify-content:flex-end; padding-right:6px; font-size:9px; font-weight:bold; color:#000;">
            ${step.percent}%
          </div>
        </div>
      </div>
    `;
  });
}

// Create new catalog products
async function createNewProduct(e) {
  e.preventDefault();

  const id = document.getElementById('prodId').value.trim();
  const name = document.getElementById('prodName').value.trim();
  const cat = document.getElementById('prodCategory').value.trim();
  const goldW = parseFloat(document.getElementById('prodGoldWeight').value) || 0;
  const making = parseFloat(document.getElementById('prodMaking').value) || 0;
  const gem = parseFloat(document.getElementById('prodGemstone').value) || 0;

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { error } = await window.supabaseClient
        .from('products')
        .insert([{
          id: id,
          name: name,
          category: cat,
          image: "images/product_ring.png", // Default image placeholder
          description: `Handcrafted premium customized jewelry, certified by Avanika. Made of gold-plated alloy framework and premium settings.`,
          gold_weight_grams: goldW,
          base_price_making: making,
          compare_at_price: (making + gem + (goldW * goldRate * 0.05)) * 1.3 // 30% higher comparison RRP
        }]);

      if (error) throw error;
    } catch(err) {
      console.error(err);
      alert('Supabase catalog creation failed.');
    }
  }

  // Auto-generate variants in localstorage simulation to keep in sync
  const simInv = JSON.parse(localStorage.getItem('avanika_simulated_inventory') || '{}');
  const sizes = ['6', '7', '8'];
  const metals = ['yellowgold', 'rosegold', 'platinum'];
  const stones = ['diamond', 'emerald', 'pearl'];

  sizes.forEach(sz => {
    metals.forEach(mt => {
      stones.forEach(st => {
        const key = `${id}-${sz}-${mt}-${st}`;
        simInv[key] = 5; // Start with 5 units stock
      });
    });
  });
  localStorage.setItem('avanika_simulated_inventory', JSON.stringify(simInv));

  alert(`⚡ Product ${name} added successfully! Dynamic inventory generated.`);
  document.getElementById('createProductForm').reset();
  fetchInventoryData();
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mount layout
  mountDashboard();

  // 2. Initialize simulated db
  initDatabase();
  
  // 3. Load variables
  fetchOrdersData();
  fetchInventoryData();
  fetchGoldRate();
  renderReturnsTable();
  fetchAccountsData();
  fetchAbandonsData();
  fetchEmailsData();
  drawTrafficCharts();
  
  // 4. Tab toggling
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      tabButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const activeTabId = this.getAttribute('data-tab');
      document.querySelectorAll('.dashboard-pane').forEach(pane => {
        pane.style.display = 'none';
        if (pane.id === activeTabId) {
          pane.style.display = 'block';
        }
      });
      
      if (activeTabId === 'tab-traffic') {
        setTimeout(drawTrafficCharts, 100);
      }
    });
  });

  // 5. Submit Gold rate form
  const goldForm = document.getElementById('goldRateForm');
  if (goldForm) {
    goldForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = document.getElementById('inputGoldRate').value.trim();
      saveGoldRate(val);
    });
  }

  // 6. Submit Product Catalogue form
  const prodForm = document.getElementById('createProductForm');
  if (prodForm) {
    prodForm.addEventListener('submit', createNewProduct);
  }

  // 8. Admin Logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('avanika_admin_token');
      window.location.href = 'index.html';
    });
  }

  // 7. Simulated traffic pulse
  setInterval(() => {
    const trafficMetricVal = document.getElementById('metricTraffic');
    if (trafficMetricVal) {
      const currentVal = parseInt(trafficMetricVal.textContent);
      const delta = Math.floor(Math.random() * 5) - 2; // +/- 2
      const newVal = Math.max(12, currentVal + delta);
      
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(trafficMetricVal,
          { scale: 0.95 },
          { scale: 1, textContent: newVal, duration: 0.5, snap: { textContent: 1 }, ease: 'power2.out' }
        );
      } else {
        trafficMetricVal.textContent = newVal;
      }
    }
  }, 4000);
});
