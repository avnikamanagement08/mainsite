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
let trafficLogs = [];
let products = [];
let circle = [];

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
          <button class="tab-btn active" data-tab="tab-orders" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Order Logs</button>
          <button class="tab-btn" data-tab="tab-inventory" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Manage Listings</button>
          <button class="tab-btn" data-tab="tab-circle" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Circle Sheet</button>
          <button class="tab-btn" data-tab="tab-returns" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Parcels Returned</button>
          <button class="tab-btn" data-tab="tab-abandons" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Abandoned Carts</button>
          <button class="tab-btn" data-tab="tab-emails" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Mail Logs</button>
          <button class="tab-btn" data-tab="tab-traffic" style="padding: 0.6rem 1.2rem; background: transparent; border: 1px solid var(--black-4); color: var(--cream-muted); font-family: inherit; font-size: 0.82rem; cursor: pointer; white-space: nowrap;">Traffic Insights</button>
        </nav>

        <!-- TAB 1: LIVE ORDERS PANE -->
        <div class="dashboard-pane active" id="tab-orders">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-family: var(--font-serif); font-size:1.3rem; color:var(--cream); font-weight:500;">Order Logs & Tracker</h3>
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

        <!-- TAB 2: MANAGE LISTINGS PANE -->
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
              <h4 style="font-family: var(--font-serif); font-size: 1rem; color: var(--gold); margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">Add Catalogue Product</h4>
              <form id="createProductForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Product ID</label>
                  <input type="text" id="prodId" placeholder="e.g. p7" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Product Name</label>
                  <input type="text" id="prodName" placeholder="e.g. Bridal Diamond Hoop" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Category</label>
                  <select id="prodCategory" style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;">
                    <option value="Earrings">Earrings</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Necklace">Necklace</option>
                    <option value="Rings">Rings</option>
                  </select>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Image Path / URL</label>
                  <input type="text" id="prodImage" placeholder="e.g. images/earrings/1/pic.jpeg" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Making Charges (INR)</label>
                  <input type="number" id="prodMaking" value="300" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Gold Weight (grams)</label>
                  <input type="number" step="0.01" id="prodGoldWeight" value="0" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Gemstone Cost (INR)</label>
                  <input type="number" id="prodGemstone" value="0" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Initial Stock</label>
                  <input type="number" id="prodStock" value="10" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
                </div>
                <div style="grid-column: span 2; display:flex; flex-direction:column; gap:0.3rem;">
                  <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Description</label>
                  <textarea id="prodDesc" rows="3" placeholder="Premium handcrafted anti-tarnish jewelry description..." required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem; font-family:inherit; resize:vertical; line-height:1.4;"></textarea>
                </div>
                <div style="grid-column: span 2; display:flex; justify-content: flex-end;">
                  <button type="submit" class="btn-primary" style="width: auto; padding: 0.6rem 1.5rem;">Add Listing</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Listings Directory Table -->
          <div style="background: var(--black-2); border: 1px solid var(--black-4); padding: 1.5rem; margin-bottom: 2rem;">
            <h4 style="font-family: var(--font-serif); font-size: 1.1rem; color: var(--cream); margin-bottom: 1rem; font-weight: 500;">Listings Directory & Sales Analysis</h4>
            <div class="admin-table-wrapper" style="overflow-x: auto;">
              <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
                <thead>
                  <tr style="background: var(--black-3); border-bottom: 1px solid var(--black-4);">
                    <th style="padding: 0.8rem;">Product ID</th>
                    <th style="padding: 0.8rem;">Image</th>
                    <th style="padding: 0.8rem;">Product Details</th>
                    <th style="padding: 0.8rem;">Category</th>
                    <th style="padding: 0.8rem;">Making Charge</th>
                    <th style="padding: 0.8rem; text-align:center;">Orders Sold</th>
                    <th style="padding: 0.8rem;">Revenue Generated</th>
                    <th style="padding: 0.8rem; text-align: right;">Actions</th>
                  </tr>
                </thead>
                <tbody id="adminProductsList">
                  <!-- Rendered via JS -->
                </tbody>
              </table>
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

        <!-- TAB 4: CIRCLE SHEET PANE -->
        <div class="dashboard-pane" id="tab-circle" style="display: none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
            <h3 style="font-family: var(--font-serif); font-size: 1.3rem; color: var(--cream); font-weight: 500;">AVANIKA.CO Circle Members</h3>
            <button id="exportCircleCSV" class="btn-primary" style="width: auto; padding: 0.5rem 1rem; font-size: 0.75rem;">Export CSV</button>
          </div>
          <div class="admin-table-wrapper" style="overflow-x: auto; background: var(--black-2); border: 1px solid var(--black-4);">
            <table class="admin-table" style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.85rem;">
              <thead>
                <tr style="background: var(--black-3); border-bottom: 1px solid var(--black-4);">
                  <th style="padding: 1rem;">Subscriber ID</th>
                  <th style="padding: 1rem;">Customer Name</th>
                  <th style="padding: 1rem;">Mobile Number</th>
                  <th style="padding: 1rem;">Join Date</th>
                  <th style="padding: 1rem; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody id="adminCircleList">
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
                <span id="weeklyViewsTotal" style="color: var(--gold); font-size: 0.8rem; font-family: var(--font-sans);">Total: 0</span>
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

    <!-- ===== EDIT PRODUCT MODAL ===== -->
    <div id="editProductModal" class="modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(10, 22, 17, 0.96); z-index: 10000; align-items: center; justify-content: center; padding: 1.5rem; font-family: 'Inter', sans-serif;">
      <div style="background: #12241C; border: 1px solid #DFB76C; max-width: 600px; width: 100%; padding: 2.5rem 2rem; box-shadow: 0 15px 40px rgba(0,0,0,0.5); position: relative; max-height: 90vh; overflow-y: auto;">
        <button id="closeEditModalBtn" style="position: absolute; top: 1rem; right: 1rem; background: none; border: none; color: var(--cream-muted); font-size: 1.5rem; cursor: pointer;">&times;</button>
        <h3 style="font-family: var(--font-serif); font-size: 1.4rem; color: var(--gold); margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 0.05em;">Edit Product Details</h3>
        <form id="editProductForm" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <input type="hidden" id="editProdId" />
          <div style="grid-column: span 2; display:flex; flex-direction:column; gap:0.3rem;">
            <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Product Name</label>
            <input type="text" id="editProdName" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
          </div>
          <div style="display:flex; flex-direction:column; gap:0.3rem;">
            <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Category</label>
            <select id="editProdCategory" style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;">
              <option value="Earrings">Earrings</option>
              <option value="Bracelets">Bracelets</option>
              <option value="Necklace">Necklace</option>
              <option value="Rings">Rings</option>
            </select>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.3rem;">
            <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Image Path / URL</label>
            <input type="text" id="editProdImage" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
          </div>
          <div style="grid-column: span 2; display:flex; flex-direction:column; gap:0.3rem;">
            <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Description</label>
            <textarea id="editProdDesc" rows="4" style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem; font-family:inherit; line-height:1.4; resize:vertical;"></textarea>
          </div>
          <div style="display:flex; flex-direction:column; gap:0.3rem;">
            <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Making Charges (INR)</label>
            <input type="number" id="editProdMaking" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
          </div>
          <div style="display:flex; flex-direction:column; gap:0.3rem;">
            <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Gold Weight (g)</label>
            <input type="number" step="0.01" id="editProdGoldWeight" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
          </div>
          <div style="display:flex; flex-direction:column; gap:0.3rem;">
            <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Gemstone Cost (INR)</label>
            <input type="number" id="editProdGemstone" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
          </div>
          <div style="display:flex; flex-direction:column; gap:0.3rem;">
            <label style="font-size:0.7rem; color:var(--cream-muted); text-transform:uppercase; font-weight:600;">Stock</label>
            <input type="number" id="editProdStock" required style="padding: 0.5rem; background: var(--black-3); border: 1px solid var(--black-4); color: var(--cream); font-size:0.8rem;" />
          </div>
          <div style="grid-column: span 2; display:flex; justify-content: flex-end; gap:1rem; margin-top:1rem;">
            <button type="button" id="cancelEditBtn" class="btn-primary" style="background:transparent; border:1px solid var(--black-4); color:var(--cream-muted); width:auto; padding:0.6rem 1.2rem;">Cancel</button>
            <button type="submit" class="btn-primary" style="width: auto; padding: 0.6rem 1.5rem;">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.getElementById('dashboard-mount').innerHTML = dashboardHTML;
}

// Seed simulated traffic logs for fallback/offline display
function seedSimulatedTrafficLogs() {
  const logs = [];
  const now = new Date();
  
  const referrers = ['instagram.com', 'instagram.com', 'instagram.com', 'Direct', 'Direct', 'google.com'];
  const devices = ['mobile', 'mobile', 'mobile', 'desktop', 'desktop', 'tablet'];
  
  for (let i = 6; i >= 0; i--) {
    const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const viewsCount = 80 + Math.floor(Math.random() * 80); 
    
    for (let j = 0; j < viewsCount; j++) {
      const logDate = new Date(dayDate);
      logDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
      
      const sessionNum = Math.floor(100000 + Math.random() * 900000);
      const sessionId = `sess-${sessionNum}-${logDate.getTime()}`;
      
      const referrer = referrers[Math.floor(Math.random() * referrers.length)];
      const device = devices[Math.floor(Math.random() * devices.length)];
      
      logs.push({
        id: 'trf-' + Math.random().toString(36).substring(2, 9),
        page_path: Math.random() > 0.4 ? '/index.html' : '/collection.html',
        referrer: referrer,
        device_type: device,
        session_id: sessionId,
        event_name: 'page_view',
        created_at: logDate.toISOString()
      });
      
      if (Math.random() < 0.55) {
        logs.push({
          id: 'trf-' + Math.random().toString(36).substring(2, 9),
          page_path: '/collection.html',
          referrer: referrer,
          device_type: device,
          session_id: sessionId,
          event_name: 'view_pdp',
          created_at: new Date(logDate.getTime() + 60000).toISOString()
        });
        
        if (Math.random() < 0.25) {
          logs.push({
            id: 'trf-' + Math.random().toString(36).substring(2, 9),
            page_path: '/collection.html',
            referrer: referrer,
            device_type: device,
            session_id: sessionId,
            event_name: 'add_to_cart',
            created_at: new Date(logDate.getTime() + 120000).toISOString()
          });
          
          if (Math.random() < 0.40) {
            logs.push({
              id: 'trf-' + Math.random().toString(36).substring(2, 9),
              page_path: '/checkout.html',
              referrer: referrer,
              device_type: device,
              session_id: sessionId,
              event_name: 'checkout_start',
              created_at: new Date(logDate.getTime() + 180000).toISOString()
            });
            
            if (Math.random() < 0.30) {
              logs.push({
                id: 'trf-' + Math.random().toString(36).substring(2, 9),
                page_path: '/checkout.html',
                referrer: referrer,
                device_type: device,
                session_id: sessionId,
                event_name: 'purchase',
                created_at: new Date(logDate.getTime() + 240000).toISOString()
              });
            }
          }
        }
      }
    }
  }
  return logs;
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

  if (!localStorage.getItem('avanika_simulated_traffic')) {
    localStorage.setItem('avanika_simulated_traffic', JSON.stringify(seedSimulatedTrafficLogs()));
  }
  trafficLogs = JSON.parse(localStorage.getItem('avanika_simulated_traffic'));
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

// Update real-time Traffic Metrics active visitor counter
function updateTrafficMetrics() {
  const trafficMetricVal = document.getElementById('metricTraffic');
  if (trafficMetricVal) {
    const now = Date.now();
    const activeSessions = new Set();
    
    trafficLogs.forEach(log => {
      const logTime = new Date(log.created_at).getTime();
      // Within last 15 minutes
      if (now - logTime < 900000) {
        activeSessions.add(log.session_id);
      }
    });
    
    const activeCount = Math.max(1, activeSessions.size);
    trafficMetricVal.textContent = activeCount;
  }
}

// Fetch Traffic Logs from Supabase (or localStorage fallback)
async function fetchTrafficLogs() {
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('traffic_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      if (data && data.length > 0) {
        trafficLogs = data;
      }
    } catch (e) {
      console.error('Error fetching live traffic logs:', e);
    }
  }

  // Load from localStorage if Supabase is offline or returned empty list
  if (!trafficLogs || trafficLogs.length === 0) {
    const cached = localStorage.getItem('avanika_simulated_traffic');
    if (cached) {
      trafficLogs = JSON.parse(cached);
    } else {
      trafficLogs = seedSimulatedTrafficLogs();
      localStorage.setItem('avanika_simulated_traffic', JSON.stringify(trafficLogs));
    }
  }

  updateTrafficMetrics();
  drawTrafficCharts();
}

// Draw Custom Dynamic SVG Charts based on real visitor logs
function drawTrafficCharts() {
  const lineContainer = document.getElementById('viewsLineChart');
  const barContainer = document.getElementById('referrerBarChart');
  const splitContainer = document.getElementById('deviceSplitChart');
  const funnelContainer = document.getElementById('funnelChart');
  const totalLabel = document.getElementById('weeklyViewsTotal');
  
  if (!lineContainer || !barContainer || !splitContainer || !funnelContainer) return;

  // 1. Weekly Page Views Line Graph (SVG)
  const last7Days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    last7Days.push({
      dateString: d.toDateString(),
      dayLabel: dayNames[d.getDay()],
      views: 0
    });
  }

  trafficLogs.forEach(log => {
    if (log.event_name === 'page_view') {
      const logDateStr = new Date(log.created_at).toDateString();
      const match = last7Days.find(d => d.dateString === logDateStr);
      if (match) {
        match.views++;
      }
    }
  });

  const totalViewsLast7Days = last7Days.reduce((sum, d) => sum + d.views, 0);
  if (totalLabel) {
    totalLabel.textContent = `Total: ${totalViewsLast7Days.toLocaleString()}`;
  }

  const maxViews = Math.max(10, ...last7Days.map(d => d.views));
  const yVal1 = Math.round(maxViews * 0.33);
  const yVal2 = Math.round(maxViews * 0.66);
  const yVal3 = maxViews;

  const points = last7Days.map((d, idx) => {
    const x = 40 + idx * 73.33;
    const y = 210 - (d.views / maxViews) * 190;
    return { x, y };
  });

  const linePathD = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPathD = `M40,210 ` + points.map(p => `L${p.x},${p.y}`).join(' ') + ` L480,210 Z`;

  let circlesHtml = '';
  points.forEach(p => {
    circlesHtml += `<circle cx="${p.x}" cy="${p.y}" r="4" class="chart-dot" style="fill:var(--gold);" />`;
  });

  let xLabelsHtml = '';
  last7Days.forEach((d, idx) => {
    const x = 32 + idx * 73.33;
    xLabelsHtml += `<text x="${x}" y="228" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">${d.dayLabel}</text>`;
  });

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
      <text x="10" y="150" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">${yVal1}</text>
      <text x="10" y="86" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">${yVal2}</text>
      <text x="10" y="23" class="chart-axis-text" style="font-size:10px; fill:var(--cream-muted);">${yVal3}</text>
      <path class="chart-line-area" d="${areaPathD}" style="fill:url(#chart-gradient);" />
      <path class="chart-line" d="${linePathD}" style="fill:none; stroke:var(--gold); stroke-width:2;" />
      ${circlesHtml}
      ${xLabelsHtml}
    </svg>
  `;

  // 2. Referrer Bar Chart
  const referrerCounts = {};
  let totalReferrerEvents = 0;
  
  trafficLogs.forEach(log => {
    let ref = log.referrer || 'Direct Visits';
    ref = ref.trim();
    if (!ref || ref.toLowerCase() === 'direct') {
      ref = 'Direct Visits';
    } else {
      const lowerRef = ref.toLowerCase();
      if (lowerRef.includes('instagram')) ref = 'Instagram';
      else if (lowerRef.includes('google')) ref = 'Google Search';
      else if (lowerRef.includes('facebook')) ref = 'Facebook';
    }
    referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
    totalReferrerEvents++;
  });

  const referrers = Object.entries(referrerCounts).map(([source, count]) => {
    const percent = totalReferrerEvents > 0 ? Math.round((count / totalReferrerEvents) * 100) : 0;
    return { source, percent, count };
  }).sort((a, b) => b.count - a.count);

  const colors = ["var(--gold)", "var(--gold-dark)", "#2a9d8f", "#e76f51", "#577590"];
  barContainer.innerHTML = '';
  
  const displayReferrers = referrers.slice(0, 4);
  if (displayReferrers.length === 0) {
    barContainer.innerHTML = '<span style="color:var(--cream-muted); font-size:0.8rem;">No referrer logs found.</span>';
  } else {
    displayReferrers.forEach((ref, idx) => {
      const color = colors[idx % colors.length];
      barContainer.innerHTML += `
        <div style="font-size:0.8rem; font-family:inherit;">
          <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;">
            <span style="font-weight:600; color:var(--cream);">${ref.source}</span>
            <span style="color:var(--gold); font-weight:bold;">${ref.percent}%</span>
          </div>
          <div style="height:6px; background:var(--black-4); overflow:hidden;">
            <div style="height:100%; width:${ref.percent}%; background:${color}; transition: width 1s ease;"></div>
          </div>
        </div>
      `;
    });
  }

  // 3. Device Split Graph (Donut)
  let mobileCount = 0;
  let desktopCount = 0;
  let tabletCount = 0;
  
  trafficLogs.forEach(log => {
    const dev = (log.device_type || 'desktop').toLowerCase();
    if (dev === 'mobile') mobileCount++;
    else if (dev === 'tablet') tabletCount++;
    else desktopCount++;
  });
  
  const totalDeviceLogs = mobileCount + desktopCount + tabletCount;
  const mobilePct = totalDeviceLogs > 0 ? Math.round((mobileCount / totalDeviceLogs) * 100) : 0;
  const desktopPct = totalDeviceLogs > 0 ? Math.round((desktopCount / totalDeviceLogs) * 100) : 0;
  const tabletPct = totalDeviceLogs > 0 ? Math.round((tabletCount / totalDeviceLogs) * 100) : 0;

  const c1_dash = `${mobilePct} ${100 - mobilePct}`;
  const c1_offset = 0;
  const c2_dash = `${desktopPct} ${100 - desktopPct}`;
  const c2_offset = -mobilePct;
  const c3_dash = `${tabletPct} ${100 - tabletPct}`;
  const c3_offset = -(mobilePct + desktopPct);

  splitContainer.innerHTML = `
    <svg width="100" height="100" viewBox="0 0 36 36" style="transform: rotate(-90deg); flex-shrink:0;">
      <circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--black-4)" stroke-width="4"></circle>
      ${mobilePct > 0 ? `<circle cx="18" cy="18" r="15.915" fill="none" stroke="var(--gold)" stroke-width="4" stroke-dasharray="${c1_dash}" stroke-dashoffset="${c1_offset}"></circle>` : ''}
      ${desktopPct > 0 ? `<circle cx="18" cy="18" r="15.915" fill="none" stroke="#2a9d8f" stroke-width="4" stroke-dasharray="${c2_dash}" stroke-dashoffset="${c2_offset}"></circle>` : ''}
      ${tabletPct > 0 ? `<circle cx="18" cy="18" r="15.915" fill="none" stroke="#e76f51" stroke-width="4" stroke-dasharray="${c3_dash}" stroke-dashoffset="${c3_offset}"></circle>` : ''}
    </svg>
    <div style="display:flex; flex-direction:column; gap:0.4rem; font-size:0.8rem;">
      <div style="display:flex; align-items:center; gap:0.4rem;">
        <span style="display:block; width:10px; height:10px; background:var(--gold);"></span>
        <span>Mobile Phone: <strong>${mobilePct}%</strong></span>
      </div>
      <div style="display:flex; align-items:center; gap:0.4rem;">
        <span style="display:block; width:10px; height:10px; background:#2a9d8f;"></span>
        <span>Desktop Browser: <strong>${desktopPct}%</strong></span>
      </div>
      <div style="display:flex; align-items:center; gap:0.4rem;">
        <span style="display:block; width:10px; height:10px; background:#e76f51;"></span>
        <span>Tablet Browser: <strong>${tabletPct}%</strong></span>
      </div>
    </div>
  `;

  // 4. Conversion Funnel Chart
  const sessionsPageView = new Set();
  const sessionsPdpView = new Set();
  const sessionsAddToCart = new Set();
  const sessionsCheckoutStart = new Set();
  const sessionsPurchase = new Set();
  
  trafficLogs.forEach(log => {
    const sId = log.session_id;
    if (log.event_name === 'page_view') sessionsPageView.add(sId);
    else if (log.event_name === 'view_pdp') sessionsPdpView.add(sId);
    else if (log.event_name === 'add_to_cart') sessionsAddToCart.add(sId);
    else if (log.event_name === 'checkout_start') sessionsCheckoutStart.add(sId);
    else if (log.event_name === 'purchase') sessionsPurchase.add(sId);
  });
  
  const countSiteEntry = sessionsPageView.size;
  const countPdp = Math.min(countSiteEntry, sessionsPdpView.size);
  const countAddToCart = Math.min(countPdp, sessionsAddToCart.size);
  const countCheckout = Math.min(countAddToCart, sessionsCheckoutStart.size);
  const countPurchase = Math.min(countCheckout, sessionsPurchase.size);
  
  const pctSiteEntry = 100;
  const pctPdp = countSiteEntry > 0 ? Math.round((countPdp / countSiteEntry) * 100) : 0;
  const pctAddToCart = countSiteEntry > 0 ? Math.round((countAddToCart / countSiteEntry) * 100) : 0;
  const pctCheckout = countSiteEntry > 0 ? Math.round((countCheckout / countSiteEntry) * 100) : 0;
  const pctPurchase = countSiteEntry > 0 ? Math.round((countPurchase / countSiteEntry) * 100) : 0;
  
  const funnelSteps = [
    { name: "Site Visits", count: countSiteEntry, percent: pctSiteEntry, color: "var(--gold)" },
    { name: "PDP Views", count: countPdp, percent: pctPdp, color: "var(--gold-dark)" },
    { name: "Cart Additions", count: countAddToCart, percent: pctAddToCart, color: "#2d7f6c" },
    { name: "Checkout Started", count: countCheckout, percent: pctCheckout, color: "#2d7f6c" },
    { name: "Successful Purchases", count: countPurchase, percent: pctPurchase, color: "#2a9d8f" }
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

// ===== MANAGE LISTINGS: DATABASE ACTIONS & RENDERING =====
async function fetchProductsData() {
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('products')
        .select('*')
        .order('id', { ascending: true });
        
      if (error) throw error;
      if (data) products = data;
    } catch (e) {
      console.error('Error fetching live products:', e);
    }
  }
  
  if (products.length === 0) {
    const cached = localStorage.getItem('avanika_simulated_products');
    if (cached) {
      products = JSON.parse(cached);
    } else {
      // Seed default products
      products = [
        { id: "p1", name: "Meera Anti-Tarnish Kundan Chandbalis", category: "Earrings", image: "images/earrings/1/WhatsApp Image 2026-06-11 at 9.13.35 PM.jpeg", description: "Handcrafted traditional Indian Kundan Chandbalis, heavily plated in 18K yellow gold finish over a premium base alloy. Adorned with cluster CZ stones and premium faux pearls. Features our advanced anti-tarnish guard for lasting color protection. Hypoallergenic, lightweight, and perfect for ethnic celebrations.", base_price_making: 300, gold_weight_grams: 0, gemstone_cost: 0, stock: 10 },
        { id: "p2", name: "Aura Celestial Gold Plated Hoops", category: "Earrings", image: "images/earrings/2/WhatsApp Image 2026-06-12 at 10.42.03 AM.jpeg", description: "Minimalist, daily-wear geometric hoop earrings plated in high-shine 18K gold. Fitted with a secure click-lock latch. Fully anti-tarnish treated for lasting color protection. Waterproof, sweat-proof, and designed to match both Western and casual outfits.", base_price_making: 300, gold_weight_grams: 0, gemstone_cost: 0, stock: 10 },
        { id: "p3", name: "Ziya Simulated Emerald Drop Jhumkas", category: "Earrings", image: "images/earrings/3/WhatsApp Image 2026-06-12 at 10.52.55 AM.jpeg", description: "Fusion dangle jhumkas with vibrant simulated emerald drops suspended from a micro-pave cubic zirconia floral stud. Plated in 18K yellow gold base alloy. Features advanced anti-tarnish protection for lasting color. Extremely lightweight and comfortable.", base_price_making: 300, gold_weight_grams: 0, gemstone_cost: 0, stock: 10 },
        { id: "p4", name: "Avni Royal Kundan Pearl Drops", category: "Earrings", image: "images/earrings/4/WhatsApp Image 2026-06-12 at 2.19.55 PM.jpeg", description: "Regal drop earrings featuring hand-set Kundan stones and suspended organic shell pearls. Plated in an antique 18K yellow gold finish. Protected with an anti-tarnish barrier and designed for long-lasting wear. The perfect accessory for wedding and bridal wear.", base_price_making: 300, gold_weight_grams: 0, gemstone_cost: 0, stock: 10 },
        { id: "p5", name: "Lumina Premium CZ Solitaire Studs", category: "Earrings", image: "images/earrings/5/WhatsApp Image 2026-06-12 at 2.25.32 PM.jpeg", description: "Classic four-prong stud earrings holding flawless AAAAA-grade simulated cubic zirconia solitaires. Plated in premium platinum-finish base alloy. Anti-tarnish coated for lasting color protection. Versatile and timeless, ideal for office wear and special occasions.", base_price_making: 300, gold_weight_grams: 0, gemstone_cost: 0, stock: 10 },
        { id: "p6", name: "Tara Rose Gold Starburst Dangles", category: "Earrings", image: "images/earrings/6/WhatsApp Image 2026-06-12 at 3.18.11 PM.jpeg", description: "Elegant starburst danglers featuring pave-set CZ stone arrays that capture and reflect light. Plated in highly polished 18K rose gold. Includes premium anti-tarnish coating for lasting color protection. Hypoallergenic posts make them comfortable for sensitive ears.", base_price_making: 300, gold_weight_grams: 0, gemstone_cost: 0, stock: 10 }
      ];
      localStorage.setItem('avanika_simulated_products', JSON.stringify(products));
    }
  }
  
  renderProductsTable();
}

function renderProductsTable() {
  const container = document.getElementById('adminProductsList');
  if (!container) return;

  container.innerHTML = '';

  if (products.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 3rem 0; color: var(--cream-muted);">No catalog products found.</td>
      </tr>
    `;
    return;
  }

  // Generate a map of product sales from orders log
  const salesMap = {};
  const revenueMap = {};

  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const prodId = item.id.split('-')[0];
        const qty = item.quantity || 1;
        const price = parseFloat(item.price || 300);

        salesMap[prodId] = (salesMap[prodId] || 0) + qty;
        revenueMap[prodId] = (revenueMap[prodId] || 0) + (qty * price);
      });
    }
  });

  products.forEach(p => {
    const sold = salesMap[p.id] || 0;
    const rev = revenueMap[p.id] || 0;

    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--black-4)';
    row.innerHTML = `
      <td style="padding: 0.8rem; font-family: monospace; font-weight:600; color:var(--gold);">${p.id}</td>
      <td style="padding: 0.8rem;">
        <img src="${p.image}" alt="${p.name}" width="36" height="36" style="object-fit:cover; border: 1px solid var(--black-4);" />
      </td>
      <td style="padding: 0.8rem; max-width: 250px;">
        <strong style="color:var(--cream);">${p.name}</strong><br>
        <span style="font-size:0.75rem; color:var(--cream-muted); display:inline-block; max-height:2.8em; overflow:hidden; text-overflow:ellipsis;">${p.description}</span>
      </td>
      <td style="padding: 0.8rem; font-weight: 500;">${p.category}</td>
      <td style="padding: 0.8rem; font-family: var(--font-serif);">₹${parseFloat(p.base_price_making || 300).toLocaleString()}</td>
      <td style="padding: 0.8rem; text-align: center; font-weight: bold; color: ${sold > 0 ? '#2a9d8f' : 'var(--cream-muted)'};">${sold}</td>
      <td style="padding: 0.8rem; font-family: var(--font-serif); font-weight: bold; color: var(--cream);">₹${rev.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
      <td style="padding: 0.8rem; text-align: right;">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button class="btn-edit-prod" data-id="${p.id}" style="padding: 0.25rem 0.6rem; background: var(--gold); border:none; color:#000; font-size:0.75rem; font-weight:bold; cursor:pointer;">Edit</button>
          <button class="btn-delete-prod" data-id="${p.id}" style="padding: 0.25rem 0.6rem; background: #c94c4c; border:none; color:#fff; font-size:0.75rem; font-weight:bold; cursor:pointer;">Delete</button>
        </div>
      </td>
    `;
    container.appendChild(row);
  });

  // Bind actions
  container.querySelectorAll('.btn-edit-prod').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      openEditProductModal(id);
    });
  });

  container.querySelectorAll('.btn-delete-prod').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      deleteProductListing(id);
    });
  });
}

async function addNewProductListing(e) {
  e.preventDefault();
  
  const id = document.getElementById('prodId').value.trim();
  const name = document.getElementById('prodName').value.trim();
  const category = document.getElementById('prodCategory').value;
  const image = document.getElementById('prodImage').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();
  const making = parseFloat(document.getElementById('prodMaking').value) || 300;
  const goldW = parseFloat(document.getElementById('prodGoldWeight').value) || 0;
  const gem = parseFloat(document.getElementById('prodGemstone').value) || 0;
  const stock = parseInt(document.getElementById('prodStock').value) || 10;

  if (products.some(p => p.id === id)) {
    alert(`❌ Product ID "${id}" already exists. Please choose a unique ID.`);
    return;
  }

  const newProd = {
    id: id,
    name: name,
    category: category,
    image: image,
    description: desc,
    base_price_making: making,
    gold_weight_grams: goldW,
    gemstone_cost: gem,
    stock: stock
  };

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { error } = await window.supabaseClient
        .from('products')
        .insert([newProd]);

      if (error) throw error;
    } catch (err) {
      console.error('Supabase product creation failed:', err);
    }
  }

  // Save locally
  const list = JSON.parse(localStorage.getItem('avanika_simulated_products') || '[]');
  list.push(newProd);
  localStorage.setItem('avanika_simulated_products', JSON.stringify(list));
  products = list;

  // Auto-generate variants in localstorage inventory backup
  const simInv = JSON.parse(localStorage.getItem('avanika_simulated_inventory') || '{}');
  const sizes = ['6', '7', '8'];
  const metals = ['yellowgold', 'rosegold', 'platinum'];
  const stones = ['diamond', 'emerald', 'pearl'];

  sizes.forEach(sz => {
    metals.forEach(mt => {
      stones.forEach(st => {
        const key = `${id}-${sz}-${mt}-${st}`;
        simInv[key] = stock;
      });
    });
  });
  localStorage.setItem('avanika_simulated_inventory', JSON.stringify(simInv));

  alert(`⚡ Product "${name}" added successfully!`);
  document.getElementById('createProductForm').reset();
  
  fetchProductsData();
  fetchInventoryData();
}

function openEditProductModal(id) {
  const prod = products.find(p => p.id === id);
  if (!prod) return;

  document.getElementById('editProdId').value = prod.id;
  document.getElementById('editProdName').value = prod.name;
  document.getElementById('editProdCategory').value = prod.category;
  document.getElementById('editProdImage').value = prod.image;
  document.getElementById('editProdDesc').value = prod.description || '';
  document.getElementById('editProdMaking').value = prod.base_price_making || 300;
  document.getElementById('editProdGoldWeight').value = prod.gold_weight_grams || 0;
  document.getElementById('editProdGemstone').value = prod.gemstone_cost || 0;
  document.getElementById('editProdStock').value = prod.stock || 10;

  const modal = document.getElementById('editProductModal');
  if (modal) {
    modal.style.display = 'flex';
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(modal.querySelector('div'),
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    }
  }
}

async function saveProductEdits(e) {
  e.preventDefault();

  const id = document.getElementById('editProdId').value;
  const name = document.getElementById('editProdName').value.trim();
  const category = document.getElementById('editProdCategory').value;
  const image = document.getElementById('editProdImage').value.trim();
  const desc = document.getElementById('editProdDesc').value.trim();
  const making = parseFloat(document.getElementById('editProdMaking').value) || 300;
  const goldW = parseFloat(document.getElementById('editProdGoldWeight').value) || 0;
  const gem = parseFloat(document.getElementById('editProdGemstone').value) || 0;
  const stock = parseInt(document.getElementById('editProdStock').value) || 10;

  const updatedProd = {
    id: id,
    name: name,
    category: category,
    image: image,
    description: desc,
    base_price_making: making,
    gold_weight_grams: goldW,
    gemstone_cost: gem,
    stock: stock
  };

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { error } = await window.supabaseClient
        .from('products')
        .update(updatedProd)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Supabase update failed:', err);
    }
  }

  // Update locally
  const list = JSON.parse(localStorage.getItem('avanika_simulated_products') || '[]');
  const idx = list.findIndex(p => p.id === id);
  if (idx !== -1) {
    list[idx] = updatedProd;
    localStorage.setItem('avanika_simulated_products', JSON.stringify(list));
  }
  products = list;

  alert(`⚡ Product "${name}" updated successfully.`);
  closeEditProductModal();
  fetchProductsData();
}

function closeEditProductModal() {
  const modal = document.getElementById('editProductModal');
  if (modal) {
    if (typeof gsap !== 'undefined') {
      gsap.to(modal.querySelector('div'), {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          modal.style.display = 'none';
        }
      });
    } else {
      modal.style.display = 'none';
    }
  }
}

async function deleteProductListing(id) {
  if (!confirm(`⚠️ Are you sure you want to delete product "${id}"? This will remove it from the catalog.`)) return;

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { error } = await window.supabaseClient
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Supabase delete failed:', err);
    }
  }

  // Delete locally
  const list = JSON.parse(localStorage.getItem('avanika_simulated_products') || '[]');
  const filteredList = list.filter(p => p.id !== id);
  localStorage.setItem('avanika_simulated_products', JSON.stringify(filteredList));
  products = filteredList;

  alert(`⚡ Product "${id}" deleted successfully.`);
  fetchProductsData();
}


// ===== CIRCLE SHEET: DATABASE ACTIONS & RENDERING =====
async function fetchCircleData() {
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('circle_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      if (data) circle = data;
    } catch (e) {
      console.error('Error fetching circle subscribers:', e);
    }
  }
  
  if (circle.length === 0) {
    circle = JSON.parse(localStorage.getItem('avanika_simulated_circle') || '[]');
  }
  
  renderCircleTable();
}

function renderCircleTable() {
  const container = document.getElementById('adminCircleList');
  if (!container) return;

  container.innerHTML = '';

  if (circle.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: 3rem 0; color: var(--cream-muted);">No members have joined the Circle yet.</td>
      </tr>
    `;
    return;
  }

  circle.forEach(sub => {
    const row = document.createElement('tr');
    row.style.borderBottom = '1px solid var(--black-4)';
    row.innerHTML = `
      <td style="padding: 1rem; font-family: monospace; font-weight:600; color:var(--cream-muted);">${sub.id || 'CIR-' + Math.floor(100000 + Math.random() * 900000)}</td>
      <td style="padding: 1rem; font-weight: 600; color: var(--cream);">${sub.name}</td>
      <td style="padding: 1rem; font-family: monospace; font-size: 0.95rem; color: var(--gold);">${sub.mobile}</td>
      <td style="padding: 1rem; color: var(--cream-muted);">${new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
      <td style="padding: 1rem; text-align: right;">
        <button class="btn-delete-sub" data-id="${sub.id || sub.mobile}" style="padding: 0.25rem 0.6rem; background: #c94c4c; border:none; color:#fff; font-size:0.75rem; font-weight:bold; cursor:pointer;">Remove</button>
      </td>
    `;
    container.appendChild(row);
  });

  container.querySelectorAll('.btn-delete-sub').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-id');
      deleteCircleSubscriber(id);
    });
  });
}

async function deleteCircleSubscriber(id) {
  if (!confirm(`⚠️ Are you sure you want to remove this subscriber from the Circle?`)) return;

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { error } = await window.supabaseClient
        .from('circle_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Supabase subscriber deletion failed:', err);
    }
  }

  const list = JSON.parse(localStorage.getItem('avanika_simulated_circle') || '[]');
  const filteredList = list.filter(sub => (sub.id !== id && sub.mobile !== id));
  localStorage.setItem('avanika_simulated_circle', JSON.stringify(filteredList));
  circle = filteredList;

  alert(`⚡ Subscriber removed successfully.`);
  fetchCircleData();
}

function exportCircleToCSV() {
  if (circle.length === 0) {
    alert("No subscriber details to export.");
    return;
  }
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "ID,Name,Mobile,Join Date\n";
  
  circle.forEach(sub => {
    const row = `"${sub.id || ''}","${sub.name || ''}","${sub.mobile || ''}","${sub.created_at || ''}"`;
    csvContent += row + "\n";
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `avanika_circle_members_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mount layout
  mountDashboard();

  // 2. Initialize simulated db
  initDatabase();
  
  // 3. Load variables
  fetchOrdersData();
  fetchProductsData();
  fetchCircleData();
  fetchInventoryData();
  fetchGoldRate();
  renderReturnsTable();
  fetchAbandonsData();
  fetchEmailsData();
  fetchTrafficLogs();
  
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
        fetchTrafficLogs();
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
    prodForm.addEventListener('submit', addNewProductListing);
  }

  // 6b. Submit Edit Product form
  const editProdForm = document.getElementById('editProductForm');
  if (editProdForm) {
    editProdForm.addEventListener('submit', saveProductEdits);
  }

  // 6c. Modal close & cancel buttons
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener('click', closeEditProductModal);
  }

  // 6d. Cancel edit button
  const cancelEditBtn = document.getElementById('cancelEditBtn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', closeEditProductModal);
  }

  // 6e. Export Circle CSV button
  const exportCircleBtn = document.getElementById('exportCircleCSV');
  if (exportCircleBtn) {
    exportCircleBtn.addEventListener('click', exportCircleToCSV);
  }

  // 8. Admin Logout
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('avanika_admin_token');
      window.location.href = 'index.html';
    });
  }

  // 7. Simulated traffic pulse jittering around real active counts
  setInterval(() => {
    const trafficMetricVal = document.getElementById('metricTraffic');
    if (trafficMetricVal && trafficLogs.length > 0) {
      const now = Date.now();
      const activeSessions = new Set();
      trafficLogs.forEach(log => {
        const logTime = new Date(log.created_at).getTime();
        if (now - logTime < 900000) {
          activeSessions.add(log.session_id);
        }
      });
      const baseVal = Math.max(1, activeSessions.size);
      const jitter = Math.floor(Math.random() * 3) - 1; 
      const newVal = Math.max(1, baseVal + jitter);
      
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(trafficMetricVal,
          { scale: 0.95 },
          { scale: 1, textContent: newVal, duration: 0.5, snap: { textContent: 1 }, ease: 'power2.out' }
        );
      } else {
        trafficMetricVal.textContent = newVal;
      }
    }
  }, 5000);
});
