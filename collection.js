// ==========================================
// AVANIKA.CO — Collection Detail Controller
// collection.js
// ==========================================

'use strict';

// 1. EXTENDED PRODUCTS SCHEMAS (Components for pricing formula)
const productsData = {
  p1: {
    id: "p1",
    name: "Meera Anti-Tarnish Kundan Chandbalis",
    image: "images/earrings/1/WhatsApp Image 2026-06-15 at 11.04.48 PM (1).jpeg",
    gallery: [
      "images/earrings/1/WhatsApp Image 2026-06-15 at 11.04.48 PM (1).jpeg"
    ],
    category: "Earrings",
    description: "Handcrafted traditional Indian Kundan Chandbalis, heavily plated in 18K yellow gold finish over a premium base alloy. Adorned with cluster CZ stones and premium faux pearls. Features our advanced anti-tarnish guard for lasting color protection. Hypoallergenic, lightweight, and perfect for ethnic celebrations.",
    gold_weight_grams: 0.0,
    base_price_making: 149.00,
    gemstone_cost: 0.00,
    is_preorder: false,
    is_consignment: false,
    reviews: []
  },
  p2: {
    id: "p2",
    name: "Aura Celestial Gold Plated Hoops",
    image: "images/earrings/2/WhatsApp Image 2026-06-15 at 11.04.48 PM.jpeg",
    gallery: [
      "images/earrings/2/WhatsApp Image 2026-06-15 at 11.04.48 PM.jpeg"
    ],
    category: "Earrings",
    description: "Minimalist, daily-wear geometric hoop earrings plated in high-shine 18K gold. Fitted with a secure click-lock latch. Fully anti-tarnish treated for lasting color protection. Waterproof, sweat-proof, and designed to match both Western and casual outfits.",
    gold_weight_grams: 0.0,
    base_price_making: 149.00,
    gemstone_cost: 0.00,
    is_preorder: false,
    is_consignment: false,
    reviews: []
  },
  p3: {
    id: "p3",
    name: "Ziya Simulated Emerald Drop Jhumkas",
    image: "images/earrings/3/WhatsApp Image 2026-06-15 at 11.04.51 PM (1).jpeg",
    gallery: [
      "images/earrings/3/WhatsApp Image 2026-06-15 at 11.04.51 PM (1).jpeg",
      "images/earrings/3/WhatsApp Image 2026-06-12 at 10.53.22 AM.jpeg"
    ],
    category: "Earrings",
    description: "Fusion dangle jhumkas with vibrant simulated emerald drops suspended from a micro-pave cubic zirconia floral stud. Plated in 18K yellow gold base alloy. Features advanced anti-tarnish protection for lasting color. Extremely lightweight and comfortable.",
    gold_weight_grams: 0.0,
    base_price_making: 149.00,
    gemstone_cost: 0.00,
    is_preorder: false,
    is_consignment: false,
    reviews: []
  },
  p4: {
    id: "p4",
    name: "Avni Royal Kundan Pearl Drops",
    image: "images/earrings/4/WhatsApp Image 2026-06-12 at 2.19.55 PM.jpeg",
    gallery: [
      "images/earrings/4/WhatsApp Image 2026-06-12 at 2.19.55 PM.jpeg",
      "images/earrings/4/WhatsApp Image 2026-06-12 at 2.20.37 PM.jpeg"
    ],
    category: "Earrings",
    description: "Regal drop earrings featuring hand-set Kundan stones and suspended organic shell pearls. Plated in an antique 18K yellow gold finish. Protected with an anti-tarnish barrier and designed for long-lasting wear. The perfect accessory for wedding and bridal wear.",
    gold_weight_grams: 0.0,
    base_price_making: 149.00,
    gemstone_cost: 0.00,
    is_preorder: false,
    is_consignment: false,
    reviews: []
  },
  p5: {
    id: "p5",
    name: "Lumina Premium CZ Solitaire Studs",
    image: "images/earrings/5/WhatsApp Image 2026-06-15 at 11.04.50 PM.jpeg",
    gallery: [
      "images/earrings/5/WhatsApp Image 2026-06-15 at 11.04.50 PM.jpeg"
    ],
    category: "Earrings",
    description: "Classic four-prong stud earrings holding flawless AAAAA-grade simulated cubic zirconia solitaires. Plated in premium platinum-finish base alloy. Anti-tarnish coated for lasting color protection. Versatile and timeless, ideal for office wear and special occasions.",
    gold_weight_grams: 0.0,
    base_price_making: 149.00,
    gemstone_cost: 0.00,
    is_preorder: false,
    is_consignment: false,
    reviews: []
  },
  p6: {
    id: "p6",
    name: "Tara Rose Gold Starburst Dangles",
    image: "images/earrings/6/WhatsApp Image 2026-06-12 at 3.18.11 PM.jpeg",
    gallery: [
      "images/earrings/6/WhatsApp Image 2026-06-12 at 3.18.11 PM.jpeg",
      "images/earrings/6/WhatsApp Image 2026-06-12 at 3.21.40 PM.jpeg"
    ],
    category: "Earrings",
    description: "Elegant starburst danglers featuring pave-set CZ stone arrays that capture and reflect light. Plated in highly polished 18K rose gold. Includes premium anti-tarnish coating for lasting color protection. Hypoallergenic posts make them comfortable for sensitive ears.",
    gold_weight_grams: 0.0,
    base_price_making: 149.00,
    gemstone_cost: 0.00,
    is_preorder: false,
    is_consignment: false,
    reviews: []
  },
  p7: {
    id: "p7",
    name: "Nisha Geometric Gold Drops",
    image: "images/earrings/7/WhatsApp Image 2026-06-15 at 11.04.48 PM (2).jpeg",
    gallery: [
      "images/earrings/7/WhatsApp Image 2026-06-15 at 11.04.48 PM (2).jpeg"
    ],
    category: "Earrings",
    description: "Chic geometric hexagonal drop earrings with an elegant ribbed/shell design top stud. Fully anti-tarnish treated with a high-shine yellow gold finish over a premium base alloy. Modern, bold, and extremely lightweight.",
    gold_weight_grams: 0.0,
    base_price_making: 149.00,
    gemstone_cost: 0.00,
    is_preorder: false,
    is_consignment: false,
    reviews: []
  },
  p8: {
    id: "p8",
    name: "Riya Twisted Gold Hoops",
    image: "images/earrings/8/WhatsApp Image 2026-06-15 at 11.04.51 PM.jpeg",
    gallery: [
      "images/earrings/8/WhatsApp Image 2026-06-15 at 11.04.51 PM.jpeg"
    ],
    category: "Earrings",
    description: "Stunning twisted rope hoop earrings plated in premium yellow gold finish. Comes with a secure click-lock post. Sweat-proof, waterproof, anti-tarnish treated, and perfect for adding texture to any look.",
    gold_weight_grams: 0.0,
    base_price_making: 149.00,
    gemstone_cost: 0.00,
    is_preorder: false,
    is_consignment: false,
    reviews: []
  }
};


// State Variables
let activeProduct = 'p1';
let activeSize = '6';
let activeMetal = 'yellowgold';
let activeStone = 'diamond';
let activeStock = 5;
let goldRate = 7200.00; // Default gold rate per gram
let currentCurrency = localStorage.getItem('avanika_currency') || 'INR';

const CURRENCY_SYMBOLS = { INR: '₹', USD: '$', EUR: '€' };
const CURRENCY_RATES = { INR: 1.0, USD: 0.012, EUR: 0.011 }; // Exchange rates

let uploadedImagesBase64 = [];

// Convert currency helper
function formatPrice(priceInINR) {
  const rate = CURRENCY_RATES[currentCurrency];
  const converted = priceInINR * rate;
  return `${CURRENCY_SYMBOLS[currentCurrency]}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// 2. MOCK VARIANT INVENTORY INITIALIZER
function initVariantInventory() {
  let simulatedInv = localStorage.getItem('avanika_simulated_inventory');
  // Reinitialize if it doesn't exist or is missing the new product p6
  if (!simulatedInv || !simulatedInv.includes('p6')) {
    const defaultInv = {};
    const products = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];
    const sizes = ['6', '7', '8'];
    const metals = ['yellowgold', 'rosegold', 'platinum'];
    const stones = ['diamond', 'emerald', 'pearl'];
    
    products.forEach(p => {
      sizes.forEach(sz => {
        metals.forEach(mt => {
          stones.forEach(st => {
            const key = `${p}-${sz}-${mt}-${st}`;
            // Stock counts distributed between 0 (out of stock) and 10
            defaultInv[key] = Math.floor(Math.random() * 11);
          });
        });
      });
    });
    localStorage.setItem('avanika_simulated_inventory', JSON.stringify(defaultInv));
  }
}

// Calculate price dynamically based on gold rates, gemstone modifications, engravings and try-at-home
function calculateProductPrice() {
  const product = productsData[activeProduct];
  
  // Base calculations
  let basePrice = product.gemstone_cost + product.base_price_making;
  
  // Gold value calculation: Weight * Spot Rate * 0.05 (for plating proportion)
  let goldCost = product.gold_weight_grams * goldRate * 0.05;
  if (activeMetal === 'platinum') {
    goldCost = goldCost * 1.25; // Platinum plating premium
  } else if (activeMetal === 'rosegold') {
    goldCost = goldCost * 1.05;
  }
  
  // Stone premiums
  let stonePremium = 0;
  if (activeStone === 'emerald') stonePremium = 0.00;
  else if (activeStone === 'pearl') stonePremium = 0.00;
  
  let finalPrice = basePrice + goldCost + stonePremium;
  
  // Engraving charge
  const engravingVal = document.getElementById('engravingInput')?.value.trim();
  if (engravingVal && engravingVal.length > 0) {
    finalPrice += 300.00;
  }
  
  // Try-at-home deposit
  const isTryAtHome = document.getElementById('tryAtHomeCheckbox')?.checked;
  if (isTryAtHome) {
    finalPrice += 500.00;
  }
  
  return finalPrice;
}

// Update the price and customizer labels on PDP
function updatePDPPriceAndInventory() {
  // Update price text
  const priceINR = calculateProductPrice();
  const priceText = document.getElementById('detailPrice');
  if (priceText) {
    priceText.textContent = formatPrice(priceINR);
  }

  // Update stock counts
  queryActiveVariantStock().then(stock => {
    activeStock = stock;
    const indicator = document.getElementById('stockIndicator');
    const indicatorText = document.getElementById('stockIndicatorText');
    const btnCart = document.getElementById('detailAddToCartBtn');
    
    if (indicator && indicatorText && btnCart) {
      if (stock === 0) {
        indicator.style.color = '#c94c4c';
        indicator.querySelector('.stock-dot').style.background = '#c94c4c';
        indicatorText.textContent = 'Out of Stock (Pre-order Available)';
        btnCart.querySelector('span').textContent = 'Pre-Order Now';
        btnCart.disabled = false; // Allow pre-orders
      } else if (stock <= 3) {
        indicator.style.color = 'var(--gold)';
        indicator.querySelector('.stock-dot').style.background = 'var(--gold)';
        indicatorText.textContent = `🔥 Only ${stock} items left!`;
        btnCart.querySelector('span').textContent = 'Add to Cart';
        btnCart.disabled = false;
      } else {
        indicator.style.color = '#2a9d8f';
        indicator.querySelector('.stock-dot').style.background = '#2a9d8f';
        indicatorText.textContent = `In Stock (${stock} available)`;
        btnCart.querySelector('span').textContent = 'Add to Cart';
        btnCart.disabled = false;
      }
    }
  });
}

// Query stock level for the active size/metal/stone variant
async function queryActiveVariantStock() {
  const variantSku = `${activeProduct}-${activeSize}-${activeMetal}-${activeStone}`;
  
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('inventory')
        .select('stock')
        .eq('sku', variantSku)
        .maybeSingle();
        
      if (error) throw error;
      if (data) return data.stock;
      
      // Auto-insert missing SKU to database if configure is live
      const initialStock = Math.floor(Math.random() * 8) + 2;
      await window.supabaseClient.from('inventory').insert([{
        sku: variantSku,
        product_id: activeProduct,
        size: activeSize,
        metal: activeMetal,
        stone: activeStone,
        stock: initialStock
      }]);
      return initialStock;
    } catch(e) {
      console.error('Error querying Supabase stock:', e);
    }
  }
  
  // Fallback to localstorage inventory
  const simInv = JSON.parse(localStorage.getItem('avanika_simulated_inventory') || '{}');
  return simInv[variantSku] !== undefined ? simInv[variantSku] : 5;
}

// Fetch active Gold Rate from Supabase
async function fetchActiveGoldRate() {
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
        console.log(`⚡ Live Spot Gold Rate fetched from Supabase: ₹${goldRate}/gram`);
      }
    } catch(e) {
      console.error('Error fetching live gold rate:', e);
    }
  }
}

// Format date
function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Render reviews list
function renderReviews() {
  const reviewsList = document.getElementById('reviewsList');
  const ratingSummaryStars = document.getElementById('ratingSummaryStars');
  const ratingSummaryText = document.getElementById('ratingSummaryText');
  
  if (!reviewsList) return;
  
  const product = productsData[activeProduct];
  reviewsList.innerHTML = '';
  
  if (product.reviews.length === 0) {
    reviewsList.innerHTML = '<p class="rating-text" style="text-align: center; padding: 2rem 0; color: var(--cream-muted);">No reviews yet for this product. Be the first to review!</p>';
    if (ratingSummaryStars) ratingSummaryStars.textContent = '☆☆☆☆☆';
    if (ratingSummaryText) ratingSummaryText.textContent = '0/5 (based on 0 reviews)';
    return;
  }
  
  const totalStars = product.reviews.reduce((acc, r) => acc + r.stars, 0);
  const avgStars = (totalStars / product.reviews.length).toFixed(1);
  
  let avgStarsText = '';
  for (let i = 1; i <= 5; i++) {
    avgStarsText += i <= Math.round(parseFloat(avgStars)) ? '★' : '☆';
  }
  if (ratingSummaryStars) ratingSummaryStars.textContent = avgStarsText;
  if (ratingSummaryText) ratingSummaryText.textContent = `${avgStars}/5 (based on ${product.reviews.length} review${product.reviews.length > 1 ? 's' : ''})`;
  
  product.reviews.forEach(review => {
    const item = document.createElement('div');
    item.className = 'review-item';
    
    let starsText = '';
    for (let i = 1; i <= 5; i++) {
      starsText += i <= review.stars ? '★' : '☆';
    }
    
    let imagesMarkup = '';
    if (review.images && review.images.length > 0) {
      imagesMarkup = '<div class="review-images" style="display:flex; gap:0.5rem; flex-wrap:wrap; margin-top: 0.8rem;">';
      review.images.forEach(imgData => {
        imagesMarkup += `<img src="${imgData}" alt="Review Upload" class="review-uploaded-img" style="width:70px; height:70px; object-fit:cover;" />`;
      });
      imagesMarkup += '</div>';
    }
    
    item.innerHTML = `
      <div class="review-meta">
        <span class="reviewer-name">${review.name}</span>
        <span class="review-date">${review.date}</span>
      </div>
      <div class="review-stars">${starsText}</div>
      <p class="review-text">${review.text}</p>
      ${imagesMarkup}
    `;
    reviewsList.appendChild(item);
  });
}

// Load reviews from DB
async function loadReviewsFromDatabase() {
  if (!window.isSupabaseConfigured || !window.supabaseClient) {
    renderReviews();
    return;
  }
  
  try {
    const { data, error } = await window.supabaseClient
      .from('reviews')
      .select('*')
      .eq('product_id', activeProduct)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    if (data) {
      productsData[activeProduct].reviews = data.map(row => ({
        name: row.name,
        date: formatDate(new Date(row.created_at)),
        stars: row.rating,
        text: row.comment,
        images: row.images || []
      }));
    }
  } catch (e) {
    console.error('Error fetching reviews:', e);
  }
  
  renderReviews();
}

// Dynamic SEO Page Title update matching selected variants
function updatePDPTitle() {
  const product = productsData[activeProduct];
  const titleText = `${product.name} | Premium Anti-Tarnish Jewelry — Avanika.co`;
  document.title = titleText;
}

// Render product image gallery thumbnails
function renderProductGallery(product) {
  const galleryRow = document.getElementById('detailGalleryRow');
  if (!galleryRow) return;
  galleryRow.innerHTML = '';
  
  const images = product.gallery || [product.image];
  images.forEach((imgSrc, index) => {
    const thumb = document.createElement('div');
    thumb.className = `gallery-thumb ${index === 0 ? 'active' : ''}`;
    thumb.style.cssText = `
      width: 50px;
      height: 50px;
      border: 1px solid ${index === 0 ? 'var(--gold)' : 'var(--black-4)'};
      cursor: pointer;
      flex-shrink: 0;
      background: var(--black-3);
      border-radius: var(--btn-radius);
      overflow: hidden;
      transition: border-color 0.2s;
    `;
    thumb.innerHTML = `<img src="${imgSrc}" alt="${product.name} View ${index + 1}" style="width:100%; height:100%; object-fit:cover;" />`;
    
    thumb.addEventListener('click', () => {
      document.getElementById('detailImg').src = imgSrc;
      galleryRow.querySelectorAll('.gallery-thumb').forEach(t => {
        t.style.borderColor = 'var(--black-4)';
        t.classList.remove('active');
      });
      thumb.style.borderColor = 'var(--gold)';
      thumb.classList.add('active');
    });
    
    galleryRow.appendChild(thumb);
  });
}

// Handle product change
function handleProductChange(productId) {
  activeProduct = productId;
  const product = productsData[productId];
  
  // Set default properties for each product (since customizer buttons are removed for earrings)
  if (productId === 'p1') {
    activeMetal = 'yellowgold';
    activeStone = 'pearl';
  } else if (productId === 'p2') {
    activeMetal = 'yellowgold';
    activeStone = 'diamond';
  } else if (productId === 'p3') {
    activeMetal = 'yellowgold';
    activeStone = 'emerald';
  } else if (productId === 'p4') {
    activeMetal = 'yellowgold';
    activeStone = 'pearl';
  } else if (productId === 'p5') {
    activeMetal = 'platinum';
    activeStone = 'diamond';
  } else if (productId === 'p6') {
    activeMetal = 'rosegold';
    activeStone = 'diamond';
  }
  
  // Size group is only visible for rings (none since all are earrings)
  const sizeGroup = document.getElementById('sizeGroup');
  if (sizeGroup) {
    sizeGroup.style.display = (product.category === 'Rings') ? 'flex' : 'none';
  }

  // Animate detail view transition
  gsap.to('.active-product-detail', {
    opacity: 0.6,
    y: 10,
    duration: 0.2,
    onComplete: () => {
      document.getElementById('detailImg').src = product.image;
      document.getElementById('detailImg').alt = `${product.name} - Avanika Premium Handcrafted Jewelry`;
      document.getElementById('detailTitle').textContent = product.name;
      document.getElementById('detailDesc').textContent = product.description;
      
      // Reset custom inputs on product change
      const engravingInput = document.getElementById('engravingInput');
      if (engravingInput) engravingInput.value = '';
      const engravingCharCount = document.getElementById('engravingCharCount');
      if (engravingCharCount) engravingCharCount.textContent = '0/15 chars';
      const tryAtHome = document.getElementById('tryAtHomeCheckbox');
      if (tryAtHome) tryAtHome.checked = false;

       loadReviewsFromDatabase();
      updatePDPPriceAndInventory();
      updatePDPTitle();
      renderProductGallery(product);
      renderRelatedProducts(product);
      
      gsap.to('.active-product-detail', {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
  });
}

// Add item to cart
function addActiveProductToCart() {
  const product = productsData[activeProduct];
  const priceINR = calculateProductPrice();
  
  let cart = [];
  try {
    const saved = localStorage.getItem('avanika_cart');
    if (saved) cart = JSON.parse(saved);
  } catch(e) {
    console.error(e);
  }
  
  const selectedMetalText = activeMetal === 'yellowgold' ? '18K Yellow Gold' : activeMetal === 'rosegold' ? '18K Rose Gold' : 'Platinum';
  const selectedStoneText = activeStone === 'diamond' ? 'CZ Solitaire' : activeStone === 'emerald' ? 'Simulated Emerald' : 'Cultured Pearl';
  
  const engravingVal = document.getElementById('engravingInput')?.value.trim().toUpperCase() || '';
  const isTryAtHome = document.getElementById('tryAtHomeCheckbox')?.checked || false;
  
  // Format variant identifiers
  const skuId = `${activeProduct}-${activeSize}-${activeMetal}-${activeStone}-${engravingVal.replace(/\s+/g, '')}-${isTryAtHome?'try':''}`;
  
  const existing = cart.find(item => item.id === skuId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: skuId,
      product_id: activeProduct,
      name: product.name,
      price: priceINR, // Store base value in INR
      image: product.image,
      category: product.category,
      quantity: 1,
      size: activeSize,
      metal: selectedMetalText,
      stone: selectedStoneText,
      engraving: engravingVal,
      tryAtHome: isTryAtHome,
      preorder: activeStock === 0
    });
  }
  
  localStorage.setItem('avanika_cart', JSON.stringify(cart));
  
  // Update badges
  updateNavbarCartBadge();
  showCartToast(product.name);
  
  // Log analytics session funnel: Add to Cart event
  logAnalyticsEvent('add_to_cart', { product_id: activeProduct });
}

// Sync Navbar Cart badge
function updateNavbarCartBadge() {
  const badge = document.getElementById('cartBadge');
  if (!badge) return;
  try {
    const saved = localStorage.getItem('avanika_cart');
    const cart = saved ? JSON.parse(saved) : [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
  } catch (e) {
    console.error(e);
  }
}

// Toast notification helper
function showCartToast(productName) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      z-index: 2100;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      pointer-events: none;
    `;
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  toast.className = 'cart-toast';
  toast.style.cssText = `
    background: var(--black-1);
    color: var(--cream);
    border: 1px solid var(--gold);
    border-radius: var(--other-radius);
    padding: 1.2rem 1.6rem;
    box-shadow: 0 10px 30px rgba(107,21,66,0.08);
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    pointer-events: auto;
    transform: translateY(20px);
    opacity: 0;
    width: 320px;
    font-family: 'Inter', sans-serif;
  `;
  
  toast.innerHTML = `
    <div style="font-weight: 600; font-size: 0.88rem; display: flex; align-items: center; gap: 0.5rem; color: var(--cream);">
      <span style="color: var(--gold);">✨</span> Item Added to Cart
    </div>
    <div style="font-size: 0.82rem; color: var(--cream-muted); line-height: 1.4;">
      "${productName}" is now in your cart.
    </div>
    <div style="display: flex; justify-content: flex-end; gap: 0.8rem; margin-top: 0.4rem;">
      <a href="checkout.html" style="font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--gold); font-weight: 600; text-decoration: none; border-bottom: 1px solid var(--gold); padding-bottom: 1px;">Checkout Now</a>
    </div>
  `;
  
  container.appendChild(toast);
  
  gsap.to(toast, {
    y: 0,
    opacity: 1,
    duration: 0.4,
    ease: 'power3.out',
    onComplete: () => {
      setTimeout(() => {
        gsap.to(toast, {
          y: -20,
          opacity: 0,
          duration: 0.4,
          ease: 'power3.in',
          onComplete: () => {
            toast.remove();
          }
        });
      }, 4000);
    }
  });
}

// Log conversion funnel analytics events
function logAnalyticsEvent(eventName, params = {}) {
  const pagePath = window.location.pathname;
  let referrerVal = document.referrer ? document.referrer.trim() : 'Direct';
  
  try {
    if (referrerVal !== 'Direct') {
      const urlObj = new URL(referrerVal);
      referrerVal = urlObj.hostname;
      if (referrerVal.startsWith('www.')) {
        referrerVal = referrerVal.substring(4);
      }
    }
  } catch (e) {}

  let deviceType = 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    deviceType = 'mobile';
  }

  let sessionId = sessionStorage.getItem('avanika_session_id');
  if (!sessionId) {
    sessionId = 'sess-' + Math.floor(100000 + Math.random() * 900000) + '-' + Date.now();
    sessionStorage.setItem('avanika_session_id', sessionId);
  }

  const logData = {
    page_path: pagePath,
    referrer: referrerVal,
    device_type: deviceType,
    session_id: sessionId,
    event_name: eventName
  };

  if (window.isSupabaseConfigured && window.supabaseClient) {
    window.supabaseClient
      .from('traffic_logs')
      .insert([logData])
      .then(({ error }) => {
        if (error) console.error('❌ Error logging event:', error);
      });
  }

  const offlineLogs = JSON.parse(localStorage.getItem('avanika_simulated_traffic') || '[]');
  offlineLogs.push({
    ...logData,
    created_at: new Date().toISOString()
  });
  if (offlineLogs.length > 2000) offlineLogs.shift();
  localStorage.setItem('avanika_simulated_traffic', JSON.stringify(offlineLogs));
}

// Convert Base64 upload to Blobs
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

// Upload base64 strings to Supabase Storage
async function uploadReviewImagesToStorage() {
  const urls = [];
  for (let i = 0; i < uploadedImagesBase64.length; i++) {
    const base64Str = uploadedImagesBase64[i];
    if (base64Str.startsWith('http')) {
      urls.push(base64Str);
      continue;
    }
    try {
      const blob = dataURLtoBlob(base64Str);
      const fileExt = blob.type.split('/')[1] || 'png';
      const fileName = `review_${activeProduct}_${Date.now()}_${i}.${fileExt}`;
      
      const { data, error } = await window.supabaseClient.storage
        .from('review-images')
        .upload(fileName, blob, { contentType: blob.type });
        
      if (error) throw error;
      
      if (data) {
        const { data: publicUrlData } = window.supabaseClient.storage
          .from('review-images')
          .getPublicUrl(fileName);
          
        if (publicUrlData) {
          urls.push(publicUrlData.publicUrl);
        }
      }
    } catch(e) {
      console.error('Error uploading image to storage:', e);
      urls.push(base64Str);
    }
  }
  return urls;
}

// Catalog filters state
let catalogSearchQuery = '';
let catalogActiveCategory = 'all';
let catalogSortOption = 'default';

function renderSelectionCards() {
  const container = document.getElementById('selectionCardsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Filter productsData
  let filtered = Object.values(productsData);
  
  // 1. Search Query Filter
  if (catalogSearchQuery.length > 0) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(catalogSearchQuery) || p.description.toLowerCase().includes(catalogSearchQuery));
  }
  
  // 2. Category Filter
  if (catalogActiveCategory !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === catalogActiveCategory.toLowerCase());
  }
  
  // 3. Sorting
  if (catalogSortOption === 'price-asc') {
    filtered.sort((a, b) => {
      const priceA = a.gemstone_cost + a.base_price_making;
      const priceB = b.gemstone_cost + b.base_price_making;
      return priceA - priceB;
    });
  } else if (catalogSortOption === 'price-desc') {
    filtered.sort((a, b) => {
      const priceA = a.gemstone_cost + a.base_price_making;
      const priceB = b.gemstone_cost + b.base_price_making;
      return priceB - priceA;
    });
  }
  
  if (filtered.length === 0) {
    container.innerHTML = `<p style="color: var(--cream-muted); text-align: center; padding: 2rem;">No items match your filters.</p>`;
    return;
  }
  
  filtered.forEach(p => {
    const cardPrice = p.gemstone_cost + p.base_price_making;
    const isActive = p.id === activeProduct;
    
    const cardDiv = document.createElement('div');
    cardDiv.className = `selection-card ${isActive ? 'active' : ''}`;
    cardDiv.setAttribute('data-product', p.id);
    cardDiv.innerHTML = `
      <div class="selection-img-wrap">
        <img src="${p.image}" alt="${p.name}" class="selection-img" />
      </div>
      <div class="selection-details">
        <h3 class="selection-name">${p.name}</h3>
        <span class="selection-price">${formatPrice(cardPrice)}</span>
      </div>
    `;
    
    cardDiv.addEventListener('click', function() {
      if (this.classList.contains('active')) return;
      container.querySelectorAll('.selection-card').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      handleProductChange(p.id);
    });
    
    container.appendChild(cardDiv);
  });
}

function renderRelatedProducts(product) {
  const grid = document.getElementById('relatedProductsGrid');
  if (!grid) return;
  grid.innerHTML = '';
  
  const related = Object.values(productsData).filter(p => p.id !== product.id && p.category === product.category).slice(0, 3);
  
  // If not enough related in same category, fill with others
  if (related.length < 3) {
    const others = Object.values(productsData).filter(p => p.id !== product.id && !related.includes(p)).slice(0, 3 - related.length);
    related.push(...others);
  }
  
  related.forEach(item => {
    const itemPrice = item.gemstone_cost + item.base_price_making;
    const card = document.createElement('div');
    card.style.cssText = `
      background: var(--black-1);
      border: 1px solid var(--black-4);
      border-radius: var(--other-radius);
      padding: 0.8rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      transition: border-color 0.2s;
    `;
    card.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 4px; margin-bottom: 0.6rem;" />
      <h4 style="font-size: 0.78rem; font-weight: 500; color: var(--cream); height: 26px; overflow: hidden; margin-bottom: 0.3rem; line-height: 1.2;">${item.name}</h4>
      <span style="font-size: 0.8rem; color: var(--gold); font-weight: 600;">${formatPrice(itemPrice)}</span>
    `;
    
    card.addEventListener('mouseenter', () => card.style.borderColor = 'var(--gold)');
    card.addEventListener('mouseleave', () => card.style.borderColor = 'var(--black-4)');
    
    card.addEventListener('click', () => {
      // Select the product
      const selectionContainer = document.getElementById('selectionCardsContainer');
      if (selectionContainer) {
        selectionContainer.querySelectorAll('.selection-card').forEach(c => {
          if (c.getAttribute('data-product') === item.id) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });
      }
      handleProductChange(item.id);
    });
    grid.appendChild(card);
  });
}

function initPincodeChecker() {
  const pincodeInput = document.getElementById('pincodeInput');
  const pincodeCheckBtn = document.getElementById('pincodeCheckBtn');
  const pincodeFeedback = document.getElementById('pincodeFeedback');
  
  if (!pincodeInput || !pincodeCheckBtn || !pincodeFeedback) return;
  
  pincodeCheckBtn.addEventListener('click', () => {
    const pin = pincodeInput.value.trim();
    if (pin.length !== 6 || isNaN(pin)) {
      pincodeFeedback.textContent = '❌ Please enter a valid 6-digit Pincode.';
      pincodeFeedback.style.color = '#c94c4c';
      pincodeFeedback.style.display = 'block';
      return;
    }
    
    // Serviceable pincodes: simulating pan-India delivery
    const deliveryDays = 3 + Math.floor(Math.random() * 4); // 3 to 6 days
    const estDate = new Date();
    estDate.setDate(estDate.getDate() + deliveryDays);
    const dateStr = estDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });
    
    pincodeFeedback.innerHTML = `✅ Serviceable! Estimated delivery by <strong>${dateStr}</strong> (COD & Prepaid available)`;
    pincodeFeedback.style.color = '#2a9d8f';
    pincodeFeedback.style.display = 'block';
  });
}

// ===== DYNAMIC PRODUCTS DATABASE SYNC =====
async function loadDynamicProducts() {
  let dbProducts = [];
  if (window.isSupabaseConfigured && window.supabaseClient) {
    try {
      const { data, error } = await window.supabaseClient
        .from('products')
        .select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        dbProducts = data;
      }
    } catch (e) {
      console.error('❌ Error fetching products from Supabase:', e);
    }
  }
  
  if (dbProducts.length === 0) {
    const cached = localStorage.getItem('avanika_simulated_products');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const hasNewProducts = parsed.some(p => p.id === 'p7') && parsed.some(p => p.id === 'p8');
        const correctPricing = parsed.every(p => {
          if (p.id && p.id.startsWith('p')) {
            const priceVal = p.base_price_making !== undefined ? parseFloat(p.base_price_making) : (p.price ? parseFloat(p.price.replace(/[^0-9.]/g, '')) : 149);
            return priceVal === 149;
          }
          return true;
        });
        if (!hasNewProducts || !correctPricing) {
          dbProducts = Object.values(productsData);
          localStorage.setItem('avanika_simulated_products', JSON.stringify(dbProducts));
        } else {
          dbProducts = parsed;
        }
      } catch (err) {
        dbProducts = Object.values(productsData);
        localStorage.setItem('avanika_simulated_products', JSON.stringify(dbProducts));
      }
    } else {
      // Seed cached list from productsData
      dbProducts = Object.values(productsData);
      localStorage.setItem('avanika_simulated_products', JSON.stringify(dbProducts));
    }
  }

  // Populate dynamic database records into productsData
  dbProducts.forEach(prod => {
    productsData[prod.id] = {
      id: prod.id,
      name: prod.name,
      image: prod.image,
      gallery: prod.gallery || [prod.image],
      category: prod.category,
      description: prod.description,
      gold_weight_grams: parseFloat(prod.gold_weight_grams || 0),
      base_price_making: parseFloat(prod.base_price_making !== undefined ? prod.base_price_making : 149.00),
      gemstone_cost: parseFloat(prod.gemstone_cost || 0),
      is_preorder: prod.is_preorder || false,
      is_consignment: prod.is_consignment || false,
      reviews: productsData[prod.id] ? (productsData[prod.id].reviews || []) : []
    };
  });
}

// Document Ready Initialization
document.addEventListener('DOMContentLoaded', async () => {
  // Log page view event
  logAnalyticsEvent('page_view');

  // Load dynamic products before anything else
  await loadDynamicProducts();

  initVariantInventory();
  
  // 1. Fetch live gold rates initially
  await fetchActiveGoldRate();

  // Parse product parameter from URL query string
  const params = new URLSearchParams(window.location.search);
  const prodParam = params.get('product');
  if (prodParam && productsData[prodParam]) {
    activeProduct = prodParam;
    
    // Size group is only visible for rings
    const sizeGroup = document.getElementById('sizeGroup');
    if (sizeGroup) {
      sizeGroup.style.display = (productsData[activeProduct].category === 'Rings') ? 'flex' : 'none';
    }
    // Update active visual details
    document.getElementById('detailImg').src = productsData[activeProduct].image;
    document.getElementById('detailImg').alt = `${productsData[activeProduct].name} - Avanika Premium Handcrafted Jewelry`;
    document.getElementById('detailTitle').textContent = productsData[activeProduct].name;
    document.getElementById('detailDesc').textContent = productsData[activeProduct].description;
  }

  // 2. Load reviews & price
  loadReviewsFromDatabase();
  updatePDPPriceAndInventory();
  updatePDPTitle();
  renderProductGallery(productsData[activeProduct]);
  
  // Log PDP view analytics event
  logAnalyticsEvent('view_pdp', { product_id: activeProduct });

  // 3. Bind Currency selector
  const currencySelector = document.getElementById('currencySelector');
  if (currencySelector) {
    currencySelector.value = currentCurrency;
    currencySelector.addEventListener('change', function() {
      currentCurrency = this.value;
      localStorage.setItem('avanika_currency', currentCurrency);
      updatePDPPriceAndInventory();
    });
  }

  // 4. Bind Customizer Selection buttons
  document.body.addEventListener('click', function(e) {
    const btn = e.target.closest('.customizer-btn');
    if (!btn) return;
    
    const container = btn.parentElement;
    container.querySelectorAll('.customizer-btn').forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = 'var(--black-4)';
      b.style.color = 'var(--cream-muted)';
      b.style.background = 'var(--black-2)';
    });
    
    btn.classList.add('active');
    btn.style.borderColor = 'var(--gold)';
    btn.style.color = 'var(--gold)';
    btn.style.background = 'var(--black-1)';
    
    const type = btn.getAttribute('data-type');
    const value = btn.getAttribute('data-value');
    
    if (type === 'size') activeSize = value;
    else if (type === 'metal') activeMetal = value;
    else if (type === 'stone') activeStone = value;
    
    updatePDPPriceAndInventory();
    updatePDPTitle();
  });

  // 5. Engraving character counting & pricing
  const engravingInput = document.getElementById('engravingInput');
  if (engravingInput) {
    engravingInput.addEventListener('input', function() {
      // Force uppercase and sanitization
      this.value = this.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
      const len = this.value.length;
      document.getElementById('engravingCharCount').textContent = `${len}/15 chars`;
      updatePDPPriceAndInventory();
    });
  }

  // 6. Try at home checkbox pricing
  const tryAtHomeCheckbox = document.getElementById('tryAtHomeCheckbox');
  if (tryAtHomeCheckbox) {
    tryAtHomeCheckbox.addEventListener('change', () => {
      updatePDPPriceAndInventory();
    });
  }

  // 7. Certificate modal handlers
  const certModal = document.getElementById('certModal');
  const viewCertBtn = document.getElementById('viewCertificateBtn');
  const certModalClose = document.getElementById('certModalClose');
  
  if (viewCertBtn && certModal) {
    viewCertBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const product = productsData[activeProduct];
      const selectedMetalText = activeMetal === 'yellowgold' ? '18K Yellow Gold Plating' : activeMetal === 'rosegold' ? '18K Rose Gold Plating' : 'Platinum Plated Alloy';
      
      document.getElementById('certCategory').textContent = product.category;
      document.getElementById('certMetal').textContent = selectedMetalText;
      document.getElementById('certNumber').textContent = `AVN-GIA-${activeProduct.toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`;
      
      certModal.style.display = 'flex';
      gsap.fromTo(certModal.querySelector('.cert-modal-card'),
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.5)' }
      );
    });
  }
  
  if (certModalClose && certModal) {
    certModalClose.addEventListener('click', () => {
      gsap.to(certModal.querySelector('.cert-modal-card'), {
        scale: 0.8,
        opacity: 0,
        duration: 0.3,
        onComplete: () => { certModal.style.display = 'none'; }
      });
    });
  }

  // 8. Dynamic Product selection list filters & rendering
  const catalogSearch = document.getElementById('catalogSearch');
  const catalogSort = document.getElementById('catalogSort');
  const catFilterBtns = document.querySelectorAll('.cat-filter-btn');

  if (catalogSearch) {
    catalogSearch.addEventListener('input', (e) => {
      catalogSearchQuery = e.target.value.trim().toLowerCase();
      renderSelectionCards();
    });
  }

  if (catalogSort) {
    catalogSort.addEventListener('change', (e) => {
      catalogSortOption = e.target.value;
      renderSelectionCards();
    });
  }

  catFilterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      catFilterBtns.forEach(b => {
        b.classList.remove('active');
        b.style.borderColor = 'var(--black-4)';
        b.style.color = 'var(--cream-muted)';
        b.style.background = 'var(--black-1)';
      });
      this.classList.add('active');
      this.style.borderColor = 'var(--gold)';
      this.style.color = 'var(--gold)';
      
      catalogActiveCategory = this.getAttribute('data-category');
      renderSelectionCards();
    });
  });

  // Render selection cards initially
  renderSelectionCards();

  // Render related products initially
  renderRelatedProducts(productsData[activeProduct]);

  // Initialize Pincode Checker
  initPincodeChecker();

  // 9. Add to cart CTA click
  const addToCartBtn = document.getElementById('detailAddToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      addActiveProductToCart();
    });
  }

  // File Upload handling
  const fileInput = document.getElementById('reviewFileInput');
  const filePreviewRow = document.getElementById('filePreviewRow');
  if (fileInput && filePreviewRow) {
    fileInput.addEventListener('change', function() {
      const files = Array.from(this.files);
      files.forEach(file => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target.result;
          uploadedImagesBase64.push(base64Data);
          const thumbIdx = uploadedImagesBase64.length - 1;
          const thumb = document.createElement('div');
          thumb.className = 'file-preview-thumbnail';
          thumb.setAttribute('data-index', thumbIdx);
          thumb.innerHTML = `<img src="${base64Data}" alt="Preview" /><span class="file-remove-badge">&times;</span>`;
          thumb.querySelector('.file-remove-badge').addEventListener('click', function(evt) {
            evt.stopPropagation();
            const idx = parseInt(this.parentElement.getAttribute('data-index'));
            uploadedImagesBase64.splice(idx, 1);
            this.parentElement.remove();
          });
          filePreviewRow.appendChild(thumb);
        };
        reader.readAsDataURL(file);
      });
      fileInput.value = '';
    });
  }

  // Submit Review Form
  const reviewForm = document.getElementById('addReviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      const nameInput = document.getElementById('reviewName');
      const ratingInput = document.getElementById('reviewRating');
      const textInput = document.getElementById('reviewText');
      
      const name = nameInput.value.trim();
      const rating = parseInt(ratingInput.value);
      const text = textInput.value.trim();
      
      if (!name || !text) return;
      const submitBtn = reviewForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';

      try {
        if (window.isSupabaseConfigured && window.supabaseClient) {
          const imageUrls = await uploadReviewImagesToStorage();
          const { error } = await window.supabaseClient
            .from('reviews')
            .insert([{
              product_id: activeProduct,
              name: name,
              rating: rating,
              comment: text,
              images: imageUrls
            }]);
          if (error) throw error;
          await loadReviewsFromDatabase();
        } else {
          const newReviewObj = {
            name: name,
            date: formatDate(new Date()),
            stars: rating,
            text: text,
            images: [...uploadedImagesBase64]
          };
          productsData[activeProduct].reviews.unshift(newReviewObj);
          renderReviews();
        }
        
        nameInput.value = '';
        ratingInput.value = '5';
        textInput.value = '';
        if (filePreviewRow) filePreviewRow.innerHTML = '';
        uploadedImagesBase64 = [];
        alert('Thank you! Your review has been submitted successfully.');
      } catch (err) {
        console.error(err);
        alert('Error submitting review. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Review';
      }
    });
  }

  // FAQ Accordion toggles
  document.querySelectorAll('.faq-trigger').forEach(trigger => {
    trigger.addEventListener('click', function() {
      const item = this.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const icon = this.querySelector('.faq-icon');
      const isOpen = answer.style.display === 'block';
      
      answer.style.display = isOpen ? 'none' : 'block';
      icon.style.transform = isOpen ? 'none' : 'rotate(180deg)';
      icon.style.color = isOpen ? 'var(--cream-muted)' : 'var(--gold)';
    });
  });
});
