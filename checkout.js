// ==========================================
// AVANIKA.CO — Checkout Controller
// checkout.js
// ==========================================

'use strict';

let checkoutCart = [];
let selectedPaymentMode = 'prepaid';
let shippingDetails = {};
let currentCurrency = localStorage.getItem('avanika_currency') || 'INR';

// Promo Code State
let activeCoupon = null; 
let couponDiscountAmount = 0.00;

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€' };
const CURRENCY_RATES = { INR: 1.0, USD: 0.012, EUR: 0.011 };

// Convert price helper
function convertPrice(priceInINR) {
  return priceInINR * CURRENCY_RATES[currentCurrency];
}

function formatPrice(priceInINR) {
  const converted = convertPrice(priceInINR);
  return `${CURRENCY_SYMBOLS[currentCurrency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Log conversion funnel analytics mock events
function logAnalyticsEvent(eventName, params = {}) {
  const events = JSON.parse(localStorage.getItem('avanika_analytics_events') || '[]');
  events.push({
    event: eventName,
    params: params,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('avanika_analytics_events', JSON.stringify(events));
}

// Load cart state from localStorage
function loadCart() {
  try {
    const saved = localStorage.getItem('avanika_cart');
    checkoutCart = saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Error loading cart', e);
    checkoutCart = [];
  }
}

// Save cart state to localStorage
function saveCart() {
  try {
    localStorage.setItem('avanika_cart', JSON.stringify(checkoutCart));
  } catch (e) {
    console.error('Error saving cart', e);
  }
}

// Calculate Indian GST: 3% on gemstone/jewelry value + 18% on making charge
function calculateGST(item) {
  let baseMakingRate = 800.00;
  if (item.category === "Necklaces") baseMakingRate = 1800.00;
  else if (item.category === "Bracelets") baseMakingRate = 1100.00;
  else if (item.category === "Earrings") baseMakingRate = 900.00;

  const qty = item.quantity;
  const totalItemCost = item.price * qty; // Total in INR
  const makingChargesTotal = baseMakingRate * qty;
  const jewelryValueTotal = Math.max(0, totalItemCost - makingChargesTotal);

  const tax = (jewelryValueTotal * 0.03) + (makingChargesTotal * 0.18);
  return tax;
}

// Calculate delivery charge and order totals
function updatePriceSummary() {
  const itemCount = checkoutCart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0); // INR
  
  // Flipkart style delivery charge: Free above 899, else 50
  const deliveryCharge = (subtotal >= 899 || subtotal === 0) ? 0 : 50; // INR
  
  // Prepaid order discount
  const prepaidDiscount = (selectedPaymentMode === 'prepaid' && subtotal > 0) ? 100 : 0; // INR
  
  // GST Tax calculation
  const totalTax = checkoutCart.reduce((sum, item) => sum + calculateGST(item), 0); // INR
  
  // Coupon Discount
  let couponDiscount = 0.00;
  if (activeCoupon) {
    if (activeCoupon.type === 'percent') {
      couponDiscount = subtotal * (parseFloat(activeCoupon.discount) / 100);
    } else {
      couponDiscount = activeCoupon.discount;
    }
  }
  couponDiscountAmount = Math.min(subtotal, couponDiscount);

  // Total payable in INR
  const totalPayable = Math.max(0, subtotal + deliveryCharge + totalTax - prepaidDiscount - couponDiscountAmount);
  
  // Update UI texts (Convert values dynamically)
  const itemCountText = document.getElementById('summaryItemCount');
  const subtotalText = document.getElementById('summarySubtotal');
  const deliveryText = document.getElementById('summaryShipping');
  const discountRow = document.getElementById('summaryDiscountRow');
  const discountText = document.getElementById('summaryDiscount');
  const taxText = document.getElementById('summaryTax');
  const totalText = document.getElementById('summaryTotal');
  
  if (itemCountText) itemCountText.textContent = itemCount;
  if (subtotalText) subtotalText.textContent = formatPrice(subtotal);
  
  if (deliveryText) {
    if (deliveryCharge === 0) {
      deliveryText.textContent = 'FREE';
      deliveryText.style.color = '#2a9d8f';
      deliveryText.style.fontWeight = '600';
    } else {
      deliveryText.textContent = formatPrice(deliveryCharge);
      deliveryText.style.color = '';
      deliveryText.style.fontWeight = '';
    }
  }
  
  // Combined discounts (Prepaid + Coupon)
  const totalDeductions = prepaidDiscount + couponDiscountAmount;
  if (discountRow && discountText) {
    if (totalDeductions > 0) {
      discountRow.style.display = 'flex';
      discountText.textContent = `-${formatPrice(totalDeductions)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  if (taxText) {
    taxText.textContent = formatPrice(totalTax);
  }
  
  if (totalText) {
    totalText.textContent = formatPrice(totalPayable);
  }
  
  // Enable or disable place order button
  const btnPlaceOrder = document.getElementById('btnPlaceOrder');
  if (btnPlaceOrder) {
    const isStep2Completed = document.getElementById('step-2').classList.contains('completed');
    btnPlaceOrder.disabled = !(isStep2Completed && checkoutCart.length > 0);
  }
}

// Render cart summary items inside Step 1
function renderCartItems() {
  const container = document.getElementById('checkoutCartItems');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (checkoutCart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem 0; font-family: var(--font-sans);">
        <p style="color: var(--cream-muted); margin-bottom: 1.5rem;">Your shopping cart is empty.</p>
        <a href="index.html" class="btn-primary" style="display: inline-flex; width: auto; text-decoration: none;">Go to Shop</a>
      </div>
    `;
    const btnContinue = document.getElementById('btn-continue-to-shipping');
    if (btnContinue) btnContinue.style.display = 'none';
    return;
  }
  
  const btnContinue = document.getElementById('btn-continue-to-shipping');
  if (btnContinue) btnContinue.style.display = 'inline-flex';

  checkoutCart.forEach(item => {
    // Formatting variant specs
    let variantDetails = `Size: ${item.size || 'N/A'} | Plating: ${item.metal || 'Yellow Gold'} | Stone: ${item.stone || 'Solitaire'}`;
    if (item.engraving) {
      variantDetails += ` | <strong style="color:var(--gold);">Engraving: "${item.engraving}"</strong>`;
    }
    if (item.tryAtHome) {
      variantDetails += ` | <span style="background:rgba(42, 157, 143, 0.15); padding: 2px 6px; color:#2a9d8f; font-size:10px; font-weight:bold;">Try-At-Home Requested</span>`;
    }
    if (item.preorder) {
      variantDetails += ` | <span style="background:rgba(223, 183, 108, 0.15); padding: 2px 6px; color:var(--gold); font-size:10px; font-weight:bold;">Pre-Order SKU</span>`;
    }

    const itemRow = document.createElement('div');
    itemRow.className = 'checkout-cart-item';
    itemRow.innerHTML = `
      <div class="checkout-item-img-wrap">
        <img src="${item.image}" alt="${item.name}" class="checkout-item-img" />
      </div>
      <div class="checkout-item-details">
        <div class="checkout-item-header">
          <div>
            <h4 class="checkout-item-name">${item.name}</h4>
            <span class="checkout-item-category" style="margin-top: 0.15rem; display:block; font-size:0.75rem; color:var(--cream-muted);">${variantDetails}</span>
          </div>
          <span class="checkout-item-price">${formatPrice(item.price * item.quantity)}</span>
        </div>
        <div class="checkout-item-footer">
          <div class="cart-quantity-selector" style="margin-top: 0;">
            <button class="cart-qty-btn decrease-qty" data-id="${item.id}">−</button>
            <span class="cart-qty-val">${item.quantity}</span>
            <button class="cart-qty-btn increase-qty" data-id="${item.id}">+</button>
          </div>
          <button class="checkout-remove-btn" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
    container.appendChild(itemRow);
  });
  
  // Bind listeners
  container.querySelectorAll('.decrease-qty').forEach(btn => {
    btn.addEventListener('click', () => updateItemQty(btn.dataset.id, -1));
  });
  
  container.querySelectorAll('.increase-qty').forEach(btn => {
    btn.addEventListener('click', () => updateItemQty(btn.dataset.id, 1));
  });
  
  container.querySelectorAll('.checkout-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => removeCartItem(btn.dataset.id));
  });
}

function updateItemQty(id, delta) {
  const item = checkoutCart.find(i => i.id === id);
  if (item) {
    item.quantity += delta;
    if (item.quantity <= 0) {
      removeCartItem(id);
    } else {
      saveCart();
      renderCartItems();
      updatePriceSummary();
    }
  }
}

function removeCartItem(id) {
  checkoutCart = checkoutCart.filter(i => i.id !== id);
  saveCart();
  renderCartItems();
  updatePriceSummary();
}

// Stepper workflow management
function switchStep(activeStepId) {
  const steps = ['step-1', 'step-2', 'step-3'];
  
  steps.forEach(stepId => {
    const stepEl = document.getElementById(stepId);
    if (!stepEl) return;
    
    if (stepId === activeStepId) {
      stepEl.classList.add('active');
    } else {
      stepEl.classList.remove('active');
    }
  });
}

// Date formatter estimate helper
function getDeliveryEstimateDate() {
  const estimateDate = new Date();
  estimateDate.setDate(estimateDate.getDate() + 3);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return estimateDate.toLocaleDateString('en-US', options);
}

// Generator for order confirmations
function generateOrderID() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randStr = '';
  for (let i = 0; i < 6; i++) {
    randStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `AVN-2026-${randStr}`;
}

// Apply promo code logic
async function applyPromoCode(code) {
  const feedback = document.getElementById('promoFeedback');
  if (!feedback) return;

  feedback.style.display = 'block';
  feedback.style.color = 'var(--cream-muted)';
  feedback.textContent = 'Verifying promo code...';

  const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('active', true)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        if (subtotal < parseFloat(data.min_cart_value)) {
          feedback.style.color = '#c94c4c';
          feedback.textContent = `Minimum order amount of ₹${parseFloat(data.min_cart_value)} required for this code.`;
          activeCoupon = null;
        } else {
          feedback.style.color = '#2a9d8f';
          feedback.textContent = `Success! Promo code applied: ${data.discount}${data.type === 'percent' ? '% Off' : ' Flat Off'}`;
          activeCoupon = data;
        }
      } else {
        feedback.style.color = '#c94c4c';
        feedback.textContent = 'Invalid or expired promo code.';
        activeCoupon = null;
      }
    } catch(e) {
      console.error(e);
      feedback.style.color = '#c94c4c';
      feedback.textContent = 'Verification failed. Falling back...';
      fallbackOfflinePromo(code, subtotal);
    }
  } else {
    fallbackOfflinePromo(code, subtotal);
  }

  updatePriceSummary();
}

function fallbackOfflinePromo(code, subtotal) {
  const feedback = document.getElementById('promoFeedback');
  const upperCode = code.toUpperCase();
  
  if (upperCode === 'GOLD2026') {
    if (subtotal < 1000) {
      feedback.style.color = '#c94c4c';
      feedback.textContent = 'Minimum order amount of ₹1,000 required for this code.';
      activeCoupon = null;
    } else {
      feedback.style.color = '#2a9d8f';
      feedback.textContent = 'Success! Promo code applied: 15% Off';
      activeCoupon = { code: 'GOLD2026', discount: 15, type: 'percent' };
    }
  } else if (upperCode === 'AVANIKA10') {
    feedback.style.color = '#2a9d8f';
    feedback.textContent = 'Success! Promo code applied: ₹250.00 Flat Off';
    activeCoupon = { code: 'AVANIKA10', discount: 250, type: 'flat' };
  } else {
    feedback.style.color = '#c94c4c';
    feedback.textContent = 'Invalid promo code.';
    activeCoupon = null;
  }
}

// Log cart abandon capture
async function captureAbandonedCart() {
  const email = document.getElementById('shipName').value.trim(); // Simulating email search/input
  const phone = document.getElementById('shipPhone').value.trim();
  
  if (!phone || checkoutCart.length === 0) return;
  
  // Find name to extract mock email
  const cleanName = email.replace(/\s+/g, '.').toLowerCase();
  const mockEmail = `${cleanName || 'guest'}@gmail.com`;

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      await window.supabaseClient.from('abandoned_carts').insert([{
        email: mockEmail,
        phone: phone,
        cart_items: checkoutCart
      }]);
    } catch (e) {
      console.error('Error tracking abandoned cart:', e);
    }
  } else {
    const list = JSON.parse(localStorage.getItem('avanika_simulated_abandons') || '[]');
    list.push({
      email: mockEmail,
      phone: phone,
      cart_items: checkoutCart,
      updated_at: new Date().toISOString()
    });
    localStorage.setItem('avanika_simulated_abandons', JSON.stringify(list));
  }
}

// Deduct inventory stock levels on payment success
async function deductInventoryStock() {
  for (const item of checkoutCart) {
    const skuId = `${item.product_id}-${item.size || '6'}-${item.metal === '18K Yellow Gold' ? 'yellowgold' : item.metal === '18K Rose Gold' ? 'rosegold' : 'platinum'}-${item.stone === 'CZ Solitaire' ? 'diamond' : item.stone === 'Simulated Emerald' ? 'emerald' : 'pearl'}`;
    
    if (window.isSupabaseConfigured && window.supabaseClient) {
      try {
        const { data } = await window.supabaseClient
          .from('inventory')
          .select('stock')
          .eq('sku', skuId)
          .maybeSingle();
          
        if (data) {
          const newStock = Math.max(0, data.stock - item.quantity);
          await window.supabaseClient
            .from('inventory')
            .update({ stock: newStock })
            .eq('sku', skuId);
        }
      } catch(e) {
        console.error('Error updating stock counts:', e);
      }
    } else {
      const simInv = JSON.parse(localStorage.getItem('avanika_simulated_inventory') || '{}');
      if (simInv[skuId] !== undefined) {
        simInv[skuId] = Math.max(0, simInv[skuId] - item.quantity);
        localStorage.setItem('avanika_simulated_inventory', JSON.stringify(simInv));
      }
    }
  }
}

// Loyalty points calculations
async function creditLoyaltyPoints(finalAmountINR) {
  const email = `${shippingDetails.name.replace(/\s+/g, '.').toLowerCase()}@gmail.com`;
  const pointsToEarn = Math.floor(finalAmountINR / 100);

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data } = await window.supabaseClient
        .from('loyalty_points')
        .select('*')
        .eq('user_email', email)
        .maybeSingle();

      if (data) {
        const newCredit = data.points_credited + pointsToEarn;
        await window.supabaseClient
          .from('loyalty_points')
          .update({ points_credited: newCredit })
          .eq('user_email', email);
      } else {
        await window.supabaseClient
          .from('loyalty_points')
          .insert([{
            user_email: email,
            points_pending: 0,
            points_credited: pointsToEarn
          }]);
      }
    } catch(e) {
      console.error('Error crediting loyalty points:', e);
    }
  } else {
    // Offline simulation loyalty
    const accounts = JSON.parse(localStorage.getItem('avanika_simulated_accounts') || '[]');
    const userIdx = accounts.findIndex(a => a.email === email);
    if (userIdx !== -1) {
      accounts[userIdx].lifetime_orders += 1;
      accounts[userIdx].total_spent += finalAmountINR;
      localStorage.setItem('avanika_simulated_accounts', JSON.stringify(accounts));
    } else {
      accounts.push({
        id: `USR-${Math.floor(100000 + Math.random() * 900000)}`,
        name: shippingDetails.name,
        email: email,
        joined_date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lifetime_orders: 1,
        total_spent: finalAmountINR,
        status: "Active"
      });
      localStorage.setItem('avanika_simulated_accounts', JSON.stringify(accounts));
    }
  }
}

// Log simulated email notifications
async function logSimulatedEmail(orderId, finalAmountINR) {
  const email = `${shippingDetails.name.replace(/\s+/g, '.').toLowerCase()}@gmail.com`;
  const subject = `Order Confirmed: ${orderId}`;
  const body = `Hi ${shippingDetails.name},\n\nYour order ${orderId} has been successfully placed. Amount paid: ${formatPrice(finalAmountINR)}.\nWe will ship it to: ${shippingDetails.address}, ${shippingDetails.city}.\n\nThank you,\nAvanika.co`;

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      await window.supabaseClient.from('sent_emails').insert([{
        to_email: email,
        subject: subject,
        body: body
      }]);
    } catch(e) {
      console.error(e);
    }
  } else {
    const list = JSON.parse(localStorage.getItem('avanika_simulated_emails') || '[]');
    list.push({
      id: `EML-${Math.floor(100000 + Math.random() * 900000)}`,
      to_email: email,
      subject: subject,
      body: body,
      sent_at: new Date().toISOString()
    });
    localStorage.setItem('avanika_simulated_emails', JSON.stringify(list));
  }
}

// Final order creation logic on payment completion
async function submitOrderRecord(orderId) {
  const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = (subtotal >= 899 || subtotal === 0) ? 0 : 50;
  const prepaidDiscount = selectedPaymentMode === 'prepaid' ? 100 : 0;
  const totalTax = checkoutCart.reduce((sum, item) => sum + calculateGST(item), 0);
  const finalAmount = Math.max(0, subtotal + deliveryCharge + totalTax - prepaidDiscount - couponDiscountAmount);

  // 1. Save order row to Supabase / offline database
  try {
    if (window.isSupabaseConfigured && window.supabaseClient) {
      const { error } = await window.supabaseClient
        .from('orders')
        .insert([{
          id: orderId,
          customer_name: shippingDetails.name,
          phone: shippingDetails.phone,
          address: shippingDetails.address,
          city: shippingDetails.city,
          state: shippingDetails.state,
          pincode: shippingDetails.pincode,
          payment_mode: selectedPaymentMode,
          items: checkoutCart,
          subtotal: subtotal,
          shipping: deliveryCharge,
          discount: prepaidDiscount + couponDiscountAmount,
          tax: totalTax,
          total: finalAmount,
          delivery_status: 'processing'
        }]);
        
      if (error) throw error;
    } else {
      const list = JSON.parse(localStorage.getItem('avanika_simulated_orders') || '[]');
      list.push({
        id: orderId,
        customer_name: shippingDetails.name,
        phone: shippingDetails.phone,
        address: shippingDetails.address,
        city: shippingDetails.city,
        state: shippingDetails.state,
        pincode: shippingDetails.pincode,
        payment_mode: selectedPaymentMode,
        items: checkoutCart,
        subtotal: subtotal,
        shipping: deliveryCharge,
        discount: prepaidDiscount + couponDiscountAmount,
        tax: totalTax,
        total: finalAmount,
        delivery_status: 'processing',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('avanika_simulated_orders', JSON.stringify(list));
    }

    // 2. Decrement physical stock level
    await deductInventoryStock();

    // 3. Credit loyalty accounts
    await creditLoyaltyPoints(finalAmount);

    // 4. Log sent transactional emails
    await logSimulatedEmail(orderId, finalAmount);

    // 5. Success screen values
    document.getElementById('successOrderId').textContent = orderId;
    document.getElementById('successRecipient').textContent = shippingDetails.name;
    document.getElementById('successDeliveryDate').textContent = getDeliveryEstimateDate();
    document.getElementById('successTotalPaid').textContent = formatPrice(finalAmount);
    
    // 6. Show confirmation modal
    const overlay = document.getElementById('successOverlay');
    overlay.style.display = 'flex';
    gsap.fromTo('#successCard', 
      { scale: 0.8, opacity: 0, y: 50 },
      { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.5)' }
    );

    // 7. Clear cart
    checkoutCart = [];
    saveCart();
  } catch(e) {
    console.error(e);
    alert('An error occurred while creating order records.');
  }
}

// Generate printable HTML receipt window
function printInvoiceReceipt() {
  const orderId = document.getElementById('successOrderId').textContent;
  const recipient = document.getElementById('successRecipient').textContent;
  const estDate = document.getElementById('successDeliveryDate').textContent;
  const totalPaid = document.getElementById('successTotalPaid').textContent;

  const w = window.open('', '_blank');
  w.document.write(`
    <html>
      <head>
        <title>Invoice - ${orderId}</title>
        <style>
          body { font-family: 'Inter', sans-serif; padding: 3rem; background: #fff; color: #000; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 1.5rem; margin-bottom: 2rem; }
          .brand { font-family: 'Cinzel', serif; font-size: 1.8rem; font-weight: bold; letter-spacing: 0.1em; }
          .title { font-size: 1.2rem; text-transform: uppercase; color: #555; }
          .table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; margin-bottom: 2rem; }
          .table th, .table td { padding: 0.8rem; border-bottom: 1px solid #ddd; text-align: left; font-size: 0.85rem; }
          .table th { background: #f5f5f5; }
          .meta-info { display: flex; justify-content: space-between; margin-bottom: 2rem; font-size: 0.9rem; }
          .totals { width: 300px; float: right; font-size: 0.9rem; }
          .totals-row { display: flex; justify-content: space-between; padding: 0.4rem 0; }
          .totals-row.bold { font-weight: bold; border-top: 1px solid #000; padding-top: 0.6rem; font-size: 1.05rem; }
          .footer { text-align: center; margin-top: 5rem; font-size: 0.75rem; color: #777; border-top: 1px dashed #ddd; padding-top: 2rem; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">AVANIKA.CO</div>
            <div style="font-size:0.8rem; color:#666; margin-top:0.3rem;">Authentic Designer Jewelry Atelier</div>
          </div>
          <div style="text-align:right;">
            <div class="title">Tax Invoice</div>
            <div style="font-size:0.85rem; margin-top:0.3rem;">Order No: <strong>${orderId}</strong></div>
          </div>
        </div>
        <div class="meta-info">
          <div>
            <strong>Shipped To:</strong><br>
            ${recipient}<br>
            ${shippingDetails.address || 'Address Details'}<br>
            ${shippingDetails.city || ''}, ${shippingDetails.state || ''} - ${shippingDetails.pincode || ''}<br>
            Phone: ${shippingDetails.phone || ''}
          </div>
          <div style="text-align:right;">
            <strong>Invoice Details:</strong><br>
            Date: ${new Date().toLocaleDateString('en-US')}<br>
            Est. Delivery: ${estDate}<br>
            Payment Mode: ${selectedPaymentMode.toUpperCase()}
          </div>
        </div>
        
        <h2>Purchase Items</h2>
        <table class="table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Specifications</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${checkoutCart.map(item => `
              <tr>
                <td style="font-weight:bold;">${item.name}</td>
                <td>Size: ${item.size} | Metal: ${item.metal} | Stone: ${item.stone} ${item.engraving?' | Engraving: '+item.engraving:''}</td>
                <td>${formatPrice(item.price)}</td>
                <td>${item.quantity}</td>
                <td>${formatPrice(item.price * item.quantity)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="overflow:auto;">
          <div class="totals">
            <div class="totals-row"><span>GST Tax (3% + 18%)</span><span>${document.getElementById('summaryTax').textContent}</span></div>
            <div class="totals-row"><span>Delivery Fee</span><span>${document.getElementById('summaryShipping').textContent}</span></div>
            <div class="totals-row"><span>Discounts Applied</span><span>${document.getElementById('summaryDiscount').textContent}</span></div>
            <div class="totals-row bold"><span>Total Payable</span><span>${totalPaid}</span></div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for choosing Avanika.co. For inquiries, email: avnika.management@gmail.com</p>
          <p>This is a government-registered digital invoice confirmation.</p>
        </div>
        <script>window.print();</script>
      </body>
    </html>
  `);
}

// Document Load Actions
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
  renderCartItems();
  updatePriceSummary();

  // Log checkout start event
  logAnalyticsEvent('checkout_start', { cart_items: checkoutCart });

  // 1. Currency selector sync
  const currencySelector = document.getElementById('currencySelector');
  if (currencySelector) {
    currencySelector.value = currentCurrency;
    currencySelector.addEventListener('change', function() {
      currentCurrency = this.value;
      localStorage.setItem('avanika_currency', currentCurrency);
      renderCartItems();
      updatePriceSummary();
    });
  }

  // 2. Stepper continue checks
  const btnToShipping = document.getElementById('btn-continue-to-shipping');
  if (btnToShipping) {
    btnToShipping.addEventListener('click', () => {
      document.getElementById('step-1').classList.add('completed');
      document.getElementById('step-1').classList.remove('active');
      document.getElementById('step-2').classList.add('active');
      logAnalyticsEvent('checkout_shipping_view');
    });
  }

  const editStep1 = document.getElementById('edit-step-1');
  if (editStep1) {
    editStep1.addEventListener('click', () => {
      document.getElementById('step-1').classList.remove('completed');
      document.getElementById('step-2').classList.remove('completed', 'active');
      document.getElementById('step-3').classList.remove('active');
      switchStep('step-1');
      updatePriceSummary();
    });
  }

  const editStep2 = document.getElementById('edit-step-2');
  if (editStep2) {
    editStep2.addEventListener('click', () => {
      document.getElementById('step-2').classList.remove('completed');
      document.getElementById('step-3').classList.remove('active');
      switchStep('step-2');
      updatePriceSummary();
    });
  }

  // 3. Shipping Address Form
  const shippingForm = document.getElementById('shippingForm');
  if (shippingForm) {
    shippingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const pin = document.getElementById('shipPincode').value.trim();
      
      // Pincode validation blocker: codes starting with "9" are unserviceable
      if (pin.startsWith('9')) {
        alert('❌ Logistics Blocked: Avanika does not currently ship to pincodes beginning with 9. Please specify another delivery address.');
        return;
      }
      
      shippingDetails = {
        name: document.getElementById('shipName').value.trim(),
        phone: document.getElementById('shipPhone').value.trim(),
        pincode: pin,
        state: document.getElementById('shipState').value.trim(),
        city: document.getElementById('shipCity').value.trim(),
        address: document.getElementById('shipAddress').value.trim()
      };
      
      document.getElementById('step-2').classList.add('completed');
      document.getElementById('step-2').classList.remove('active');
      document.getElementById('step-3').classList.add('active');
      
      updatePriceSummary();
      logAnalyticsEvent('checkout_payment_view');
      
      // Soft capture cart abandon data
      captureAbandonedCart();
    });
  }

  // 4. Payment method card toggles
  const paymentCards = document.querySelectorAll('.payment-method-card');
  paymentCards.forEach(card => {
    card.addEventListener('click', function() {
      paymentCards.forEach(c => c.classList.remove('selected'));
      this.classList.add('selected');
      
      const radio = this.querySelector('input[type="radio"]');
      if (radio) radio.checked = true;
      
      selectedPaymentMode = this.getAttribute('data-method');
      updatePriceSummary();
    });
  });

  // 5. Apply promo code
  const btnApplyPromo = document.getElementById('btnApplyPromo');
  if (btnApplyPromo) {
    btnApplyPromo.addEventListener('click', () => {
      const code = document.getElementById('promoInput').value.trim();
      if (code) applyPromoCode(code);
    });
  }

  // 6. Simulated payment overlays triggers
  const btnPlaceOrder = document.getElementById('btnPlaceOrder');
  const gatewayOverlay = document.getElementById('paymentGatewayOverlay');
  
  let pendingOrderId = null;

  if (btnPlaceOrder) {
    btnPlaceOrder.addEventListener('click', () => {
      const orderId = generateOrderID();
      pendingOrderId = orderId;
      
      if (selectedPaymentMode === 'prepaid') {
        const subtotal = checkoutCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryCharge = (subtotal >= 899 || subtotal === 0) ? 0 : 50;
        const prepaidDiscount = 100;
        const totalTax = checkoutCart.reduce((sum, item) => sum + calculateGST(item), 0);
        const payableINR = Math.max(0, subtotal + deliveryCharge + totalTax - prepaidDiscount - couponDiscountAmount);

        // Fetch customer details
        const customerName = document.getElementById('shipName')?.value || 'Guest Customer';
        const customerPhone = document.getElementById('shipPhone')?.value || '9876543210';
        
        // Define Razorpay options
        const options = {
          key: 'rzp_test_AVNIKA2026', // Public test key for Avanika
          amount: Math.round(payableINR * 100), // amount in paise
          currency: 'INR',
          name: 'AVANIKA.CO',
          description: 'Secure Checkout Payment',
          image: 'images/logo.png',
          handler: function(response) {
            console.log('Razorpay checkout success:', response);
            submitOrderRecord(orderId);
          },
          prefill: {
            name: customerName,
            contact: customerPhone
          },
          theme: {
            color: '#DFB76C' // Avanika gold color
          },
          modal: {
            ondismiss: function() {
              console.log('Razorpay modal dismissed. Initiating local UPI QR code gateway fallback.');
              showUPIQRCodeFallback(orderId, payableINR);
            }
          }
        };

        try {
          const rzp = new Razorpay(options);
          rzp.open();
        } catch (err) {
          console.warn('Razorpay SDK failed to open. Falling back to local UPI QR code overlay:', err);
          showUPIQRCodeFallback(orderId, payableINR);
        }
      } else {
        // Cash on delivery: submit order directly
        submitOrderRecord(orderId);
      }
    });
  }

  // Local UPI QR Code fallback display function
  function showUPIQRCodeFallback(orderId, payableINR) {
    const gatewayOverlay = document.getElementById('paymentGatewayOverlay');
    if (!gatewayOverlay) return;
    
    // Generate dynamic UPI pay URI
    const upiUrl = `upi://pay?pa=9315125305@ybl&pn=Avanika.co&am=${payableINR.toFixed(2)}&cu=INR&tn=${encodeURIComponent('Order ' + orderId)}`;

    // Set mobile VPA deep link href
    const gatewayUPILink = document.getElementById('gatewayUPILink');
    if (gatewayUPILink) {
      gatewayUPILink.href = upiUrl;
    }

    // Fetch dynamic QR code image from secure API
    const gatewayQRCode = document.getElementById('gatewayQRCode');
    if (gatewayQRCode) {
      gatewayQRCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(upiUrl)}`;
    }

    // Update gateway overlay values
    document.getElementById('gatewayRef').textContent = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    document.getElementById('gatewayAmount').textContent = formatPrice(payableINR);
    
    gatewayOverlay.style.display = 'flex';
    gsap.fromTo(gatewayOverlay.querySelector('.checkout-success-card'),
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
    );
  }

  // Gateway buttons
  const btnGatewaySuccess = document.getElementById('btnGatewaySuccess');
  const btnGatewayFailure = document.getElementById('btnGatewayFailure');
  
  if (btnGatewaySuccess && gatewayOverlay) {
    btnGatewaySuccess.addEventListener('click', () => {
      gatewayOverlay.style.display = 'none';
      if (pendingOrderId) {
        submitOrderRecord(pendingOrderId);
      } else {
        const orderId = generateOrderID();
        submitOrderRecord(orderId);
      }
    });
  }

  if (btnGatewayFailure && gatewayOverlay) {
    btnGatewayFailure.addEventListener('click', () => {
      gatewayOverlay.style.display = 'none';
      alert('❌ UPI Payment: Transaction aborted or failed. Order not created.');
    });
  }

  // 7. Invoice printing trigger
  const btnPrintInvoice = document.getElementById('btnPrintInvoice');
  if (btnPrintInvoice) {
    btnPrintInvoice.addEventListener('click', () => {
      printInvoiceReceipt();
    });
  }

  const btnSuccessHome = document.getElementById('btnSuccessHome');
  if (btnSuccessHome) {
    btnSuccessHome.addEventListener('click', () => {
      window.location.href = 'index.html';
    });
  }
});
