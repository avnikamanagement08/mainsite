// ==========================================
// AVANIKA.CO — Returns Portal Logic
// returns.js
// ==========================================

'use strict';

let fetchedOrder = null;

// Lookup order by ID and Phone number
async function lookupOrder(orderId, phone) {
  const itemsPanel = document.getElementById('returnsItemsPanel');
  const itemsList = document.getElementById('returnOrderItemsList');
  const displayId = document.getElementById('displayOrderId');
  
  if (!itemsPanel || !itemsList) return;

  itemsPanel.style.display = 'none';
  itemsList.innerHTML = '';
  fetchedOrder = null;

  const cleanOrderId = orderId.trim().toUpperCase();
  const cleanPhone = phone.trim();

  let orderData = null;

  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('orders')
        .select('*')
        .eq('id', cleanOrderId)
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (error) throw error;
      orderData = data;
    } catch(e) {
      console.error('Error fetching order from Supabase:', e);
    }
  }

  // Fallback to local storage
  if (!orderData) {
    const list = JSON.parse(localStorage.getItem('avanika_simulated_orders') || '[]');
    orderData = list.find(o => o.id === cleanOrderId && o.phone === cleanPhone);
  }

  if (orderData) {
    fetchedOrder = orderData;
    displayId.textContent = orderData.id;
    
    // Check if order is eligible for return (i.e. not already returned)
    if (orderData.delivery_status === 'returned') {
      alert('This order has already been returned or refunded.');
      return;
    }

    // Populate items checkboxes
    if (orderData.items && Array.isArray(orderData.items)) {
      orderData.items.forEach((item, idx) => {
        const itemWrap = document.createElement('label');
        itemWrap.style.cssText = `
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--black-3);
          border: 1px solid var(--black-4);
          padding: 0.8rem 1rem;
          cursor: pointer;
        `;
        
        let variantInfo = `Size: ${item.size || 'N/A'} | Plating: ${item.metal || 'Gold'} | Stone: ${item.stone || 'Solitaire'}`;
        if (item.engraving) variantInfo += ` | Engraving: "${item.engraving}"`;
        
        itemWrap.innerHTML = `
          <input type="checkbox" name="returnItem" value="${idx}" checked style="width: 18px; height: 18px; accent-color: var(--gold);" />
          <img src="${item.image}" alt="${item.name}" width="40" height="40" style="object-fit: cover; flex-shrink: 0;" />
          <div style="flex:1;">
            <strong style="color:var(--cream); font-size:0.85rem; display:block;">${item.name}</strong>
            <span style="font-size:0.75rem; color:var(--cream-muted);">${variantInfo}</span>
          </div>
          <span style="font-weight:600; color:var(--gold); font-size:0.85rem;">Qty: ${item.quantity}</span>
        `;
        itemsList.appendChild(itemWrap);
      });
    }

    itemsPanel.style.display = 'block';
    
    // Smooth scroll down to panel
    setTimeout(() => {
      itemsPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);

  } else {
    alert('No matching order records found. Please verify the Order ID and Phone Number.');
  }
}

// Submit the return claim ticket
async function submitReturnClaim(e) {
  e.preventDefault();
  
  if (!fetchedOrder) return;

  const checkedBoxes = document.querySelectorAll('input[name="returnItem"]:checked');
  if (checkedBoxes.length === 0) {
    alert('Please select at least one item to return.');
    return;
  }

  const reason = document.getElementById('returnReason').value;
  const comments = document.getElementById('returnComments').value.trim();

  // Generate return ids
  const returnId = `RET-2026-${Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()}`;
  const returnAwb = `AWB-RET-${Math.floor(100000 + Math.random() * 900000)}`;

  // Find returned product descriptions
  const returnedProductsList = [];
  checkedBoxes.forEach(box => {
    const idx = parseInt(box.value);
    const item = fetchedOrder.items[idx];
    returnedProductsList.push(`${item.name} (Qty: ${item.quantity})`);
  });
  const productDetailsStr = returnedProductsList.join(', ');

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting Claim...';

  try {
    // 1. Log return ticket entry
    if (window.isSupabaseConfigured && window.supabaseClient) {
      // Set delivery status of original order to 'returned'
      await window.supabaseClient
        .from('orders')
        .update({ delivery_status: 'returned' })
        .eq('id', fetchedOrder.id);
        
      // In production, we'd also insert to a returned_parcels table.
      // Since dashboard pulls returns from simulated localStorage returns lists (or custom mocks),
      // we append to both Supabase logs and localStorage caches.
    } else {
      // Local simulated orders status change
      const list = JSON.parse(localStorage.getItem('avanika_simulated_orders') || '[]');
      const orderIdx = list.findIndex(o => o.id === fetchedOrder.id);
      if (orderIdx !== -1) {
        list[orderIdx].delivery_status = 'returned';
        localStorage.setItem('avanika_simulated_orders', JSON.stringify(list));
      }
    }

    // Append return claims record into local simulated returns table (so it renders on owner panel)
    const returnsList = JSON.parse(localStorage.getItem('avanika_simulated_returns') || '[]');
    returnsList.unshift({
      id: returnId,
      order_id: fetchedOrder.id,
      customer_name: fetchedOrder.customer_name,
      product_details: productDetailsStr,
      reason: `${reason} — ${comments}`,
      created_at: new Date().toISOString(),
      status: "processing"
    });
    localStorage.setItem('avanika_simulated_returns', JSON.stringify(returnsList));

    // Show Success screen values
    document.getElementById('displayReturnId').textContent = returnId;
    document.getElementById('displayReturnAwb').textContent = returnAwb;

    const overlay = document.getElementById('returnSuccessOverlay');
    overlay.style.display = 'flex';
    
    gsap.fromTo(overlay.querySelector('.checkout-success-card'),
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }
    );
    
  } catch(err) {
    console.error(err);
    alert('Failed to register return claim. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Submit Return Claim';
  }
}

// Document Listeners
document.addEventListener('DOMContentLoaded', () => {
  const lookupForm = document.getElementById('returnsLookupForm');
  if (lookupForm) {
    lookupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const orderId = document.getElementById('returnOrderId').value;
      const phone = document.getElementById('returnPhone').value;
      lookupOrder(orderId, phone);
    });
  }

  const claimForm = document.getElementById('returnsClaimSubmitForm');
  if (claimForm) {
    claimForm.addEventListener('submit', submitReturnClaim);
  }
});
