// ==========================================
// LUMIÈRE — Luxury Jewelry Brand JS
// script.js
// ==========================================

'use strict';

// Register GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Global mouse tracker (used by particles & bento shines)
let mouseX = 0, mouseY = 0;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

// ===== LOADER =====
function dismissLoader() {
  const loader = document.getElementById('loader');
  const progress = document.getElementById('loaderProgress');

  // Fill progress bar
  setTimeout(() => {
    if (progress) progress.style.width = '100%';
  }, 100);

  // Animate off-screen
  setTimeout(() => {
    gsap.to(loader, {
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.8,
      ease: 'power2.out',
      onComplete: () => {
        loader.style.display = 'none';
        document.body.style.overflow = '';
        initAnimations();
      }
    });
  }, 2400);

  document.body.style.overflow = 'hidden';
}

if (document.readyState === 'complete') {
  dismissLoader();
} else {
  window.addEventListener('load', dismissLoader);
}

// ===== INTRO TIMELINE (GSAP) =====
function initAnimations() {
  // 1. Text splitting for headers
  splitTextElements();

  // 2. ScrollTrigger Reveals (Section Headers)
  document.querySelectorAll('.section-header').forEach(header => {
    gsap.fromTo(header.querySelectorAll('.section-tag, .section-title, .section-subtitle'), 
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: header,
          start: 'top 80%'
        }
      }
    );
  });

  // 3. Featured Product Cards Reveal
  gsap.fromTo('.product-card', 
    { opacity: 0, y: 50 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.products-grid',
        start: 'top 75%'
      }
    }
  );
  
  // 4. Curved Marquee Animation
  initCurvedMarquee();

  // 5. Categories Scroll Drag
  initCategoriesDrag();

  // 6. Categories Click Selector
  initCategorySelector();
}

// ===== TEXT SPLITTING UTILITY =====
function splitTextElements() {
  const targets = document.querySelectorAll('.gsap-split-text');
  targets.forEach(target => {
    const lines = target.querySelectorAll('.hero-line');
    lines.forEach(line => {
      const emElement = line.querySelector('em');
      if (emElement) {
        // Split inside em elements
        const text = emElement.textContent;
        emElement.innerHTML = wrapChars(text);
      } else {
        const text = line.textContent;
        line.innerHTML = wrapChars(text);
      }
    });
  });
}

function wrapChars(str) {
  return str.split('').map(char => {
    if (char === ' ') return ' ';
    return `<span class="char-wrap"><span class="char" style="transform: translateY(105%)">${char}</span></span>`;
  }).join('');
}

// ===== CANVAS PARTICLES (HERO BACKGROUND GLITTER) =====
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const particlesContainer = document.getElementById('heroParticles');
let particles = [];

if (particlesContainer) {
  particlesContainer.appendChild(canvas);
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
  
  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() * 0.2 - 0.1);
      this.alpha = Math.random() * 0.6 + 0.1;
      this.decay = Math.random() * 0.005 + 0.002;
      this.pulseSpeed = Math.random() * 0.05 + 0.01;
      this.pulseVal = Math.random() * Math.PI;
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      
      // Pull slightly toward cursor coordinates
      const dx = mouseX - this.x;
      const dy = mouseY - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        this.x += dx * 0.002;
        this.y += dy * 0.002;
      }

      this.pulseVal += this.pulseSpeed;
      this.alpha = (Math.sin(this.pulseVal) + 1) * 0.3 + 0.1;

      if (this.y < 0 || this.x < 0 || this.x > canvas.width) {
        this.reset();
        this.y = canvas.height;
      }
    }
    draw() {
      ctx.fillStyle = `rgba(223, 183, 108, ${this.alpha})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#DFB76C';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  for (let i = 0; i < 60; i++) {
    particles.push(new Particle());
  }

  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Reset shadow for performance
    ctx.shadowBlur = 0;
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  
  animateParticles();
}

function resizeCanvas() {
  canvas.width = particlesContainer.clientWidth;
  canvas.height = particlesContainer.clientHeight;
}

// ===== MAGNETIC HOVER BUTTONS =====
const magneticBtns = document.querySelectorAll('.btn-primary, .btn-ghost, .nav-logo, .nav-link, .testi-btn, .cart-toggle-btn');
magneticBtns.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    gsap.to(btn, {
      x: x * 0.28,
      y: y * 0.28,
      duration: 0.35,
      ease: 'power2.out'
    });
  });

  btn.addEventListener('mouseleave', () => {
    gsap.to(btn, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.4)'
    });
  });
});

// ===== BENTO GRID CARD LIGHT SHINE TRACKER =====
const bentoCards = document.querySelectorAll('.bento-card');
bentoCards.forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  });
});

// ===== BENTO: METAL CUSTOMIZER PREVIEW SWITCH =====
const alloyBtns = document.querySelectorAll('.alloy-btn');
const alloyImages = document.querySelectorAll('.alloy-img-wrap');

alloyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const selectedAlloy = btn.dataset.alloy;
    
    // Toggle Active Class Buttons
    alloyBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Switch Active Class Image Wrap with crosswipe effect
    alloyImages.forEach(img => {
      img.classList.remove('active');
      if (img.dataset.alloy === selectedAlloy) {
        img.classList.add('active');
        
        // Bounce preview photo
        gsap.fromTo(img.querySelector('img'), 
          { scale: 0.85, rotate: -5 },
          { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(1.5)' }
        );
      }
    });
  });
});

// ===== BENTO: CLARITY & CUT METRICS INDICATOR GAUGE =====
const cutStats = {
  brilliant: { score: 98, clarity: 'VVS1', reflection: '99.4%', offset: 251.2 * (1 - 0.98) },
  emerald: { score: 84, clarity: 'VS2', reflection: '94.2%', offset: 251.2 * (1 - 0.84) },
  princess: { score: 91, clarity: 'VVS2', reflection: '96.8%', offset: 251.2 * (1 - 0.91) }
};

const clarityBtns = document.querySelectorAll('.clarity-selector-btn');
clarityBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const cutType = btn.dataset.cut;
    const stats = cutStats[cutType];
    
    // Toggle active selectors
    clarityBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    // Animate stats
    updateClarityGauge(stats.score);
    
    // Animate text elements with split stagger bounce
    const labelClarity = document.getElementById('statClarity');
    const labelReflect = document.getElementById('statReflect');
    
    gsap.fromTo([labelClarity, labelReflect], 
      { opacity: 0, y: 10 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.4, 
        stagger: 0.1, 
        onStart: () => {
          if (labelClarity) labelClarity.textContent = stats.clarity;
          if (labelReflect) labelReflect.textContent = stats.reflection;
        }
      }
    );
  });
});

function updateClarityGauge(score) {
  const fill = document.querySelector('.gauge-fill');
  const valText = document.getElementById('gaugeVal');
  const circumference = 251.2; // 2 * pi * r
  
  if (fill) {
    const targetOffset = circumference * (1 - score / 100);
    fill.style.strokeDashoffset = targetOffset;
  }
  
  // Numerical count-up animation
  if (valText) {
    const startVal = parseInt(valText.textContent) || 0;
    gsap.fromTo(valText, 
      { textContent: startVal },
      { 
        textContent: score, 
        duration: 1, 
        snap: { textContent: 1 }, 
        ease: 'power3.out' 
      }
    );
  }
}

// ===== TESTIMONIALS SLIDER =====
const testiTrack = document.getElementById('testiTrack');
const testiDots = document.querySelectorAll('.testi-dot');
const testiCards = document.querySelectorAll('.testi-card');
let currentTesti = 0;
let autoPlayInterval;

function goToTesti(index) {
  currentTesti = (index + testiCards.length) % testiCards.length;
  
  gsap.to(testiTrack, {
    x: `-${currentTesti * 100}%`,
    duration: 0.8,
    ease: 'power3.out'
  });

  testiDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentTesti);
  });
}

function startAutoPlay() {
  autoPlayInterval = setInterval(() => {
    goToTesti(currentTesti + 1);
  }, 6000);
}

function stopAutoPlay() {
  clearInterval(autoPlayInterval);
}

const testiNextBtn = document.getElementById('testiNext');
const testiPrevBtn = document.getElementById('testiPrev');

if (testiNextBtn) {
  testiNextBtn.addEventListener('click', () => {
    stopAutoPlay();
    goToTesti(currentTesti + 1);
    startAutoPlay();
  });
}

if (testiPrevBtn) {
  testiPrevBtn.addEventListener('click', () => {
    stopAutoPlay();
    goToTesti(currentTesti - 1);
    startAutoPlay();
  });
}

testiDots.forEach((dot, i) => {
  dot.addEventListener('click', () => {
    stopAutoPlay();
    goToTesti(i);
    startAutoPlay();
  });
});

if (testiTrack) startAutoPlay();

// ===== NAVBAR SCROLL EFFECT =====
const navbar = document.getElementById('navbar');
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  if (navbar) {
    if (scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }

  if (backToTop) {
    if (scrollY > 500) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  }
}, { passive: true });

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ===== WISHLIST TOGGLE =====
document.querySelectorAll('.product-btn.wishlist').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const svg = this.querySelector('svg');
    if (this.classList.contains('liked')) {
      this.classList.remove('liked');
      if (svg) {
        svg.style.fill = 'none';
        svg.style.stroke = 'currentColor';
      }
    } else {
      this.classList.add('liked');
      if (svg) {
        svg.style.fill = '#DFB76C';
        svg.style.stroke = '#DFB76C';
      }
      
      gsap.fromTo(this, 
        { scale: 0.8 }, 
        { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.3)' }
      );
    }
  });
});

// ===== HAMBURGER MENU (MOBILE) =====
const hamburger = document.getElementById('hamburger');
const navLinksContainer = document.getElementById('navLinks');

if (hamburger && navLinksContainer) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksContainer.classList.toggle('mobile-open');
  });
}

// ===== PARALLAX EFFECT (HERO IMAGE & CARDS) =====
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroImg = document.querySelector('.hero-img');
  const heroGlow = document.querySelector('.hero-image-glow');

  if (heroImg && scrollY < window.innerHeight) {
    gsap.to(heroImg, { y: scrollY * 0.1, duration: 0.1, overwrite: 'auto' });
  }
  if (heroGlow && scrollY < window.innerHeight) {
    gsap.to(heroGlow, { y: scrollY * 0.05, duration: 0.1, overwrite: 'auto' });
  }
}, { passive: true });

// ===== COLLECTION CARD HOVER 3D SHIFT =====
document.querySelectorAll('.collection-card, .product-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    
    gsap.to(card, {
      rotateX: y * -10,
      rotateY: x * 10,
      translateY: -8,
      duration: 0.4,
      ease: 'power2.out',
      transformPerspective: 1000
    });
  });

  card.addEventListener('mouseleave', () => {
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      translateY: 0,
      duration: 0.6,
      ease: 'power3.out'
    });
  });
});

// ===== NEWSLETTER FORM =====
const newsletterForm = document.getElementById('newsletterForm');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('nameInput').value.trim();
    const mobile = document.getElementById('mobileInput').value.trim();

    if (!name || !mobile) return;

    // Save subscriber details dynamically
    if (window.isSupabaseConfigured && window.supabaseClient) {
      window.supabaseClient
        .from('circle_subscribers')
        .insert([{ name: name, mobile: mobile }])
        .then(({ error }) => {
          if (error) console.error('❌ Error saving subscriber to Supabase:', error);
          else console.log('⚡ Subscriber saved to Supabase successfully.');
        });
    }

    // Always save to localStorage as fallback / backup
    const circle = JSON.parse(localStorage.getItem('avanika_simulated_circle') || '[]');
    circle.unshift({
      id: 'CIR-' + Math.floor(100000 + Math.random() * 900000),
      name: name,
      mobile: mobile,
      created_at: new Date().toISOString()
    });
    localStorage.setItem('avanika_simulated_circle', JSON.stringify(circle));

    const btn = newsletterForm.querySelector('.btn-primary');
    const originalHTML = btn.innerHTML;
    
    gsap.to(btn, {
      scale: 0.95,
      duration: 0.1,
      yDelta: 0,
      onComplete: () => {
        btn.innerHTML = `<span>✦ You're in the Circle!</span>`;
        btn.style.background = '#2a9d8f';
        btn.style.pointerEvents = 'none';
        
        gsap.to(btn, { scale: 1, duration: 0.4, ease: 'back.out(2)' });
      }
    });

    setTimeout(() => {
      gsap.to(btn, {
        opacity: 0,
        duration: 0.3,
        onComplete: () => {
          btn.innerHTML = originalHTML;
          btn.style.background = '';
          btn.style.pointerEvents = '';
          gsap.to(btn, { opacity: 1, duration: 0.3 });
          newsletterForm.reset();
        }
      });
    }, 4000);
  });
}

// ==========================================
// ===== SHOPPING CART LOGIC & EVENTS =====
// ==========================================

let cart = [];

function saveCartToStorage() {
  localStorage.setItem('avanika_cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('avanika_cart');
    if (saved) {
      cart = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading cart from storage', e);
  }
}

// Initial load
loadCartFromStorage();

const cartDrawer = document.getElementById('cartDrawer');
const cartDrawerOverlay = document.getElementById('cartDrawerOverlay');
const cartCloseBtn = document.getElementById('cartCloseBtn');
const cartToggleBtn = document.getElementById('cartToggleBtn');
const navShopNowBtn = document.getElementById('navShopNowBtn');
const startShoppingBtn = document.getElementById('startShoppingBtn');
const cartItemsContainer = document.getElementById('cartItems');
const cartEmptyMessage = document.getElementById('cartEmptyMessage');
const cartDrawerFooter = document.getElementById('cartDrawerFooter');
const cartSubtotalText = document.getElementById('cartSubtotal');
const cartBadge = document.getElementById('cartBadge');
const cartCountHeader = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');

// Open/Close cart functions
function openCart() {
  if (cartDrawer) {
    cartDrawer.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock page scroll when cart is open
  }
}

function closeCart() {
  if (cartDrawer) {
    cartDrawer.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Add item to cart state
function addToCart(id, name, price, image, category, qty = 1, openCartDrawer = true) {
  // Log traffic event
  logTrafficEvent('add_to_cart');

  // Clean price value from symbols and commas
  const numericPrice = typeof price === 'number' ? price : parseFloat(price.replace(/[^0-9.]/g, ''));
  const rawString = typeof price === 'number' ? `₹${price}` : price;
  
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cart.push({
      id: id,
      name: name,
      price: numericPrice,
      rawPriceString: rawString, // For clean presentation
      image: image,
      category: category,
      quantity: qty
    });
  }
  
  saveCartToStorage();
  updateCartUI();
  if (openCartDrawer) {
    openCart();
  }
}

// Remove item from cart
function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveCartToStorage();
  updateCartUI();
}

// Update quantity
function updateQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity += amount;
    if (item.quantity <= 0) {
      removeFromCart(id);
    } else {
      saveCartToStorage();
      updateCartUI();
    }
  }
}

// Re-render Cart Drawer markup and values
function updateCartUI() {
  // 1. Calculate count & totals
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // 2. Shipping calculation: Free above 899, else 50 Rs
  const shippingFee = subtotal >= 899 ? 0 : 50;
  
  // 3. Prepaid order discount: Instant 100 Rs off if Prepaid selected
  const paymentMode = document.querySelector('input[name="paymentMode"]:checked')?.value || 'prepaid';
  const prepaidDiscount = paymentMode === 'prepaid' ? 100 : 0;
  
  // Calculate Grand Total
  const grandTotal = Math.max(0, subtotal + shippingFee - prepaidDiscount);

  // 4. Update badges & titles
  if (cartBadge) cartBadge.textContent = totalItems;
  if (cartCountHeader) cartCountHeader.textContent = totalItems;
  if (cartSubtotalText) cartSubtotalText.textContent = `₹${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cartShippingText = document.getElementById('cartShipping');
  if (cartShippingText) {
    cartShippingText.textContent = shippingFee === 0 ? 'FREE' : `₹${shippingFee.toFixed(2)}`;
    // Highlight free shipping
    if (shippingFee === 0) {
      cartShippingText.style.color = '#2a9d8f';
      cartShippingText.style.fontWeight = '500';
    } else {
      cartShippingText.style.color = '';
      cartShippingText.style.fontWeight = '';
    }
  }

  const cartDiscountText = document.getElementById('cartDiscount');
  const discountRow = document.getElementById('discountRow');
  if (cartDiscountText && discountRow) {
    if (prepaidDiscount > 0) {
      discountRow.style.display = 'flex';
      cartDiscountText.textContent = `-₹${prepaidDiscount.toFixed(2)}`;
    } else {
      discountRow.style.display = 'none';
    }
  }

  const cartTotalText = document.getElementById('cartTotal');
  if (cartTotalText) {
    cartTotalText.textContent = `₹${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // 5. Render items
  if (cart.length === 0) {
    // Show empty message
    if (cartEmptyMessage) cartEmptyMessage.style.display = 'block';
    if (cartDrawerFooter) cartDrawerFooter.style.display = 'none';
    
    // Clear items wrapper
    const items = cartItemsContainer.querySelectorAll('.cart-item');
    items.forEach(el => el.remove());
  } else {
    if (cartEmptyMessage) cartEmptyMessage.style.display = 'none';
    if (cartDrawerFooter) cartDrawerFooter.style.display = 'block';
    
    // Clear existing item markup first
    const items = cartItemsContainer.querySelectorAll('.cart-item');
    items.forEach(el => el.remove());
    
    // Insert items
    cart.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'cart-item';
      itemEl.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
        <div class="cart-item-details">
          <h4 class="cart-item-name">${item.name}</h4>
          <span class="cart-item-meta">${item.category}</span>
          <div class="cart-item-price">₹${(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div class="cart-item-controls">
            <div class="cart-quantity-selector">
              <button class="cart-qty-btn decrease-qty" data-id="${item.id}">−</button>
              <span class="cart-qty-val">${item.quantity}</span>
              <button class="cart-qty-btn increase-qty" data-id="${item.id}">+</button>
            </div>
            <button class="cart-remove-btn" data-id="${item.id}">Remove</button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemEl);
    });
    
    // Bind quantity and remove click actions
    cartItemsContainer.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', () => updateQuantity(btn.dataset.id, -1));
    });
    
    cartItemsContainer.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', () => updateQuantity(btn.dataset.id, 1));
    });
    
    cartItemsContainer.querySelectorAll('.cart-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });
  }
}

// Initial UI sync
updateCartUI();

// Bind navbar and cart buttons
if (cartToggleBtn) cartToggleBtn.addEventListener('click', openCart);
if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', closeCart);

// Listen for Payment Mode radio button changes to update calculations dynamically
document.querySelectorAll('input[name="paymentMode"]').forEach(radio => {
  radio.addEventListener('change', () => {
    // Style toggle highlight
    document.querySelectorAll('.payment-option').forEach(opt => {
      const input = opt.querySelector('input');
      if (input.checked) {
        opt.style.borderColor = 'var(--gold)';
        opt.style.background = 'rgba(223, 183, 108, 0.05)';
      } else {
        opt.style.borderColor = 'rgba(255, 255, 255, 0.05)';
        opt.style.background = 'rgba(255, 255, 255, 0.02)';
      }
    });
    
    // Animate summary change
    gsap.from('.grand-total-row', { scale: 0.96, duration: 0.35, ease: 'back.out(2)' });
    
    updateCartUI();
  });
});

if (navShopNowBtn) {
  navShopNowBtn.addEventListener('click', () => {
    openCart();
  });
}

if (startShoppingBtn) {
  startShoppingBtn.addEventListener('click', (e) => {
    closeCart();
  });
}

// Bind product card clicks to trigger Quick View popup
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('click', function (e) {
    const id = this.id;
    // Perform subtle GSAP click effect
    gsap.fromTo(this, 
      { scale: 0.98 }, 
      { scale: 1, duration: 0.3, ease: 'power2.out' }
    );
    openQuickViewModal(id);
  });
  
  card.style.cursor = 'pointer';
});

// Bind search and wishlist button in navbar
const searchBtn = document.getElementById('searchBtn');
const searchOverlay = document.getElementById('searchOverlay');
const searchOverlayCloseBtn = document.getElementById('searchOverlayCloseBtn');
const searchInput = document.getElementById('searchInput');

if (searchBtn && searchOverlay) {
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchOverlay.style.display = 'flex';
    setTimeout(() => searchOverlay.classList.add('active'), 50);
    if (searchInput) searchInput.focus();
    document.body.style.overflow = 'hidden';
  });
}

if (searchOverlayCloseBtn && searchOverlay) {
  searchOverlayCloseBtn.addEventListener('click', () => {
    searchOverlay.classList.remove('active');
    setTimeout(() => searchOverlay.style.display = 'none', 300);
    document.body.style.overflow = '';
  });
}

// Checkout redirect
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
}

console.log('%c✦ avanika.co — Interactive Shopping Cart Operational ✦', 'color: #DFB76C; font-size: 16px; font-weight: 500; font-family: serif;');

  // ===== PRODUCT HOVER ZOOM & PARALLAX PAN EFFECT =====
  document.querySelectorAll('.product-card').forEach(card => {
    const imgWrap = card.querySelector('.product-img-wrap');
    const img = card.querySelector('.product-img');
    
    if (!imgWrap || !img) return;
    
    // Disable default CSS transition on hover to prevent stutter with GSAP
    img.style.transition = 'none';
    
    imgWrap.addEventListener('mouseenter', () => {
      gsap.to(img, {
        scale: 1.15,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
    
    imgWrap.addEventListener('mousemove', (e) => {
      const rect = imgWrap.getBoundingClientRect();
      const x = e.clientX - rect.left; 
      const y = e.clientY - rect.top;  
      
      const xPercent = (x / rect.width - 0.5) * 2; 
      const yPercent = (y / rect.height - 0.5) * 2; 
      
      gsap.to(img, {
        x: -xPercent * 15,
        y: -yPercent * 15,
        duration: 0.4,
        ease: 'power1.out'
      });
    });
    
    imgWrap.addEventListener('mouseleave', () => {
      gsap.to(img, {
        scale: 1,
        x: 0,
        y: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  });

  // ===== PRODUCT ZOOM LIGHTBOX MODAL =====
  const zoomModal = document.getElementById('productZoomModal');
  const zoomedImg = document.getElementById('zoomedProductImg');
  const zoomedName = document.getElementById('zoomedProductName');
  const zoomedPrice = document.getElementById('zoomedProductPrice');
  const zoomCloseBtn = document.getElementById('zoomCloseBtn');
  const zoomOverlay = document.querySelector('.zoom-modal-overlay');

  if (zoomModal && zoomedImg && zoomCloseBtn) {
    document.querySelectorAll('.product-zoom-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const card = this.closest('.product-card');
        const img = card.querySelector('.product-img');
        const name = card.querySelector('.product-name').textContent;
        const price = card.querySelector('.product-price').textContent;
        
        if (!img) return;
        
        zoomedImg.src = img.src;
        zoomedName.textContent = name;
        zoomedPrice.textContent = price;
        zoomedImg.style.transform = 'scale(1)';
        
        zoomModal.style.display = 'flex';
        setTimeout(() => {
          zoomModal.classList.add('active');
          gsap.fromTo('.zoom-modal-content', 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' }
          );
        }, 10);
      });
    });
    
    const closeZoomModal = () => {
      gsap.to('.zoom-modal-content', {
        scale: 0.8,
        opacity: 0,
        duration: 0.4,
        ease: 'power2.in',
        onComplete: () => {
          zoomModal.classList.remove('active');
          setTimeout(() => {
            zoomModal.style.display = 'none';
          }, 300);
        }
      });
    };
    
    zoomCloseBtn.addEventListener('click', closeZoomModal);
    if (zoomOverlay) zoomOverlay.addEventListener('click', closeZoomModal);
    
    const imgContainer = document.querySelector('.zoom-image-container');
    if (imgContainer) {
      imgContainer.addEventListener('mousemove', (e) => {
        const rect = imgContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const xPercent = (x / rect.width) * 100;
        const yPercent = (y / rect.height) * 100;
        
        zoomedImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        zoomedImg.style.transform = 'scale(2.2)';
      });
      
      imgContainer.addEventListener('mouseleave', () => {
        zoomedImg.style.transform = 'scale(1)';
        zoomedImg.style.transformOrigin = 'center';
      });
    }
  }

// ===== CURVED MARQUEE ANIMATION =====
function initCurvedMarquee() {
  const textPaths = document.querySelectorAll('.marquee-text-path');
  if (textPaths.length === 0) return;
  let offset = 0;
  function step() {
    offset -= 0.045; // Slow, smooth scrolling speed
    if (offset <= -33.33) {
      offset = 0;
    }
    textPaths.forEach(path => {
      path.setAttribute('startOffset', `${offset}%`);
    });
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ===== HERO SLIDER =====
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('#sliderDots .dot');
  if (slides.length === 0) return;
  
  let currentSlide = 0;
  let slideInterval;
  
  function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlide = index;
  }
  
  function nextSlide() {
    let next = (currentSlide + 1) % slides.length;
    showSlide(next);
  }
  
  function startSlideShow() {
    slideInterval = setInterval(nextSlide, 5000); // 5 seconds duration
  }
  
  function stopSlideShow() {
    clearInterval(slideInterval);
  }
  
  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      stopSlideShow();
      const slideIndex = parseInt(e.target.getAttribute('data-slide'));
      showSlide(slideIndex);
      startSlideShow();
    });
  });
  
  startSlideShow();
}

// ===== CATEGORIES SCROLL DRAG =====
function initCategoriesDrag() {
  const slider = document.getElementById('categoriesScroll');
  if (!slider) return;
  
  let isDown = false;
  let startX;
  let scrollLeft;
  
  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    slider.classList.add('active');
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });
  
  slider.addEventListener('mouseleave', () => {
    isDown = false;
    slider.classList.remove('active');
  });
  
  slider.addEventListener('mouseup', () => {
    isDown = false;
    slider.classList.remove('active');
  });
  
  slider.addEventListener('mousemove', (e) => {
    if(!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast multiplier
    slider.scrollLeft = scrollLeft - walk;
  });
}

// ===== REAL-TIME TRAFFIC VISITOR EVENT TRACKING =====
function logTrafficEvent(eventName = 'page_view') {
  const pagePath = window.location.pathname;
  let referrerVal = document.referrer ? document.referrer.trim() : 'Direct';
  
  // Clean up referrer for cleaner reports
  try {
    if (referrerVal !== 'Direct') {
      const urlObj = new URL(referrerVal);
      referrerVal = urlObj.hostname;
      if (referrerVal.startsWith('www.')) {
        referrerVal = referrerVal.substring(4);
      }
    }
  } catch (e) {
    // Fail-safe
  }

  // Determine device type
  let deviceType = 'desktop';
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    deviceType = 'mobile';
  }

  // Session ID inside sessionStorage
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

  // Write to Supabase if configured
  if (window.isSupabaseConfigured && window.supabaseClient) {
    window.supabaseClient
      .from('traffic_logs')
      .insert([logData])
      .then(({ error }) => {
        if (error) console.error('❌ Error writing traffic log:', error);
      });
  }

  // Always write to localStorage as offline simulation / backup
  const offlineLogs = JSON.parse(localStorage.getItem('avanika_simulated_traffic') || '[]');
  offlineLogs.push({
    ...logData,
    created_at: new Date().toISOString()
  });
  // Keep size capped to prevent local storage bloat
  if (offlineLogs.length > 2000) {
    offlineLogs.shift();
  }
  localStorage.setItem('avanika_simulated_traffic', JSON.stringify(offlineLogs));
}

// Make traffic logger globally accessible
window.logTrafficEvent = logTrafficEvent;

// Trigger page view event on load
logTrafficEvent('page_view');

// ===== DYNAMIC CATALOG DATA FETCH & SYNC =====
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
          dbProducts = Object.values(allProductsDatabase);
          localStorage.setItem('avanika_simulated_products', JSON.stringify(dbProducts));
        } else {
          dbProducts = parsed;
        }
      } catch (err) {
        dbProducts = Object.values(allProductsDatabase);
        localStorage.setItem('avanika_simulated_products', JSON.stringify(dbProducts));
      }
    } else {
      // Seed cached list from allProductsDatabase
      dbProducts = Object.values(allProductsDatabase);
      localStorage.setItem('avanika_simulated_products', JSON.stringify(dbProducts));
    }
  }

  // Clear existing items in allProductsDatabase reference safely
  for (const key in allProductsDatabase) {
    delete allProductsDatabase[key];
  }

  // Populate dynamic database records
  dbProducts.forEach(prod => {
    const rawPrice = parseFloat(prod.gemstone_cost || 0) + parseFloat(prod.base_price_making !== undefined ? prod.base_price_making : (prod.price ? prod.price.replace(/[^0-9.]/g, '') : 149));
    const rawCompare = prod.compare_at_price ? parseFloat(prod.compare_at_price) : Math.round(rawPrice * 1.6);
    allProductsDatabase[prod.id] = {
      id: prod.id,
      name: prod.name,
      price: "₹" + rawPrice.toFixed(0),
      compare_at_price: "₹" + rawCompare.toFixed(0),
      image: prod.image,
      category: prod.category,
      gallery: prod.gallery || [prod.image],
      description: prod.description
    };
  });
}

function renderHomepageCategory(categoryName) {
  const earringsGrid = document.getElementById('earringsGrid');
  const comingSoonContainer = document.getElementById('comingSoonContainer');
  const comingSoonTitle = document.getElementById('comingSoonTitle');

  if (!earringsGrid) return;

  // Filter products by category (case-insensitive & plural-resilient)
  const categoryProducts = Object.values(allProductsDatabase).filter(p => {
    const pCat = p.category.toLowerCase().trim();
    const targetCat = categoryName.toLowerCase().trim();
    return pCat === targetCat || 
           (targetCat === 'necklace' && pCat === 'necklaces') || 
           (targetCat === 'necklaces' && pCat === 'necklace') ||
           (targetCat === 'rings' && pCat === 'ring') ||
           (targetCat === 'ring' && pCat === 'rings') ||
           (targetCat === 'earrings' && pCat === 'earring') ||
           (targetCat === 'earring' && pCat === 'earrings') ||
           (targetCat === 'bracelets' && pCat === 'bracelet') ||
           (targetCat === 'bracelet' && pCat === 'bracelets');
  });

  if (categoryProducts.length > 0) {
    earringsGrid.innerHTML = '';
    earringsGrid.style.display = 'grid';
    if (comingSoonContainer) comingSoonContainer.style.display = 'none';

    categoryProducts.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'product-card reveal-up';
      card.id = prod.id;
      card.style.cursor = 'pointer';
      
      card.innerHTML = `
        <div class="product-img-wrap">
          <img src="${prod.image}" alt="${prod.name}" class="product-img" />
          <div class="product-actions">
            <button class="product-btn wishlist" data-id="${prod.id}" aria-label="Wishlist">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>
          <div class="product-badge">-40%</div>
        </div>
        <div class="product-info">
          <span class="product-category">${prod.category}</span>
          <h3 class="product-name">${prod.name}</h3>
          <div class="product-rating">
            <span class="stars">★★★★★</span>
            <span class="rating-count">(${Math.floor(40 + Math.random() * 60)})</span>
          </div>
          <div class="product-price-row">
            <span class="product-price">${prod.price || "₹300"} <span style="font-size:0.8rem; color:var(--cream-muted); text-decoration:line-through; font-weight:normal; margin-left:5px;">${prod.compare_at_price || "₹500"}</span></span>
            <button class="add-to-cart">View</button>
          </div>
        </div>
      `;

      // Card click opens quick view modal
      card.addEventListener('click', function(e) {
        if (e.target.closest('.wishlist') || e.target.closest('.add-to-cart')) return;
        gsap.fromTo(this, 
          { scale: 0.98 }, 
          { scale: 1, duration: 0.3, ease: 'power2.out' }
        );
        openQuickViewModal(prod.id);
      });

      // View button click opens quick view modal
      const viewBtn = card.querySelector('.add-to-cart');
      if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          gsap.fromTo(card, 
            { scale: 0.98 }, 
            { scale: 1, duration: 0.3, ease: 'power2.out' }
          );
          openQuickViewModal(prod.id);
        });
      }

      // Wishlist button click
      const wishlistBtn = card.querySelector('.wishlist');
      if (wishlistBtn) {
        wishlistBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleWishlistItem(prod.id);
        });
      }

      earringsGrid.appendChild(card);
    });

    // Animate cards
    gsap.fromTo(earringsGrid.querySelectorAll('.product-card'), 
      { opacity: 0, y: 35 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
    );

    // Sync wishlist buttons
    syncWishlistButtons();

  } else {
    earringsGrid.style.display = 'none';
    if (comingSoonContainer) {
      comingSoonContainer.style.display = 'block';
      const catName = categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
      if (comingSoonTitle) comingSoonTitle.textContent = `${catName} Collection Coming Soon`;
      
      const csNotifyForm = document.getElementById('csNotifyForm');
      const csNotifySuccess = document.getElementById('csNotifySuccess');
      if (csNotifyForm) csNotifyForm.style.display = 'flex';
      if (csNotifySuccess) csNotifySuccess.style.display = 'none';

      gsap.fromTo(comingSoonContainer,
        { opacity: 0, scale: 0.96 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.5)' }
      );
    }
  }
}

// ===== INTERACTIVE CATEGORY SELECTOR =====
function initCategorySelector() {
  const categoryItems = document.querySelectorAll('.categories-bar .category-item');
  if (categoryItems.length === 0) return;

  // Initial dynamically populated fetch and load
  loadDynamicProducts().then(() => {
    renderHomepageCategory('earrings');
  });
  
  categoryItems.forEach(item => {
    item.addEventListener('click', () => {
      // Toggle active class
      categoryItems.forEach(cat => cat.classList.remove('active'));
      item.classList.add('active');
      
      const category = item.dataset.category;
      
      // Update dynamic category name in section title after "OUR"
      const dynamicCategoryName = document.getElementById('dynamicCategoryName');
      if (dynamicCategoryName) {
        let catDisplayName = "Earrings";
        if (category === 'earrings') catDisplayName = "Earrings";
        else if (category === 'bracelets') catDisplayName = "Bracelets";
        else if (category === 'necklace') catDisplayName = "Necklaces";
        else if (category === 'rings') catDisplayName = "Rings";
        dynamicCategoryName.textContent = catDisplayName;
      }
      
      renderHomepageCategory(category);
    });
  });
}

  // Handle coming soon notify form submit
  const csNotifyFormGlobal = document.getElementById('csNotifyForm');
  const csNotifySuccessGlobal = document.getElementById('csNotifySuccess');
  if (csNotifyFormGlobal) {
    csNotifyFormGlobal.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('csEmailInput').value.trim();
      if (!email) return;
      
      // Simulate API call success
      if (csNotifyFormGlobal) csNotifyFormGlobal.style.display = 'none';
      if (csNotifySuccessGlobal) csNotifySuccessGlobal.style.display = 'block';
      
      gsap.fromTo(csNotifySuccessGlobal,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2)' }
      );
    });
  }

// =========================================================================
// ===== ADDITIONAL PRD WIDGETS LOGIC (WISHLIST, SEARCH, TOASTS, STICKY CART) =====
// =========================================================================

// 1. UNIFIED PRODUCTS DATABASE FOR INTERACTION
const allProductsDatabase = {
  "ox-1": { id: "ox-1", name: "Our Ananya Jhumka", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1778940158923.jpg", category: "Oxidised Earrings" },
  "ox-2": { id: "ox-2", name: "Our Kunali Jhumka", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1776255880782.webp", category: "Oxidised Earrings" },
  "ox-3": { id: "ox-3", name: "Our Ruchika Jhumka", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1778940294675.jpg", category: "Oxidised Earrings" },
  "ox-4": { id: "ox-4", name: "Our Ishika Jhumka", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1780760676941.jpg", category: "Oxidised Earrings" },
  "ke-1": { id: "ke-1", name: "Our Amrita Kashmiri Earring", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1771151964558.jpg", category: "Kashmiri Earrings" },
  "ke-2": { id: "ke-2", name: "Our Suhani Kashmiri Earring", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1775718594147.jpg", category: "Kashmiri Earrings" },
  "ke-3": { id: "ke-3", name: "Our Parvati Kashmiri Earring", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1771152261787.jpg", category: "Kashmiri Earrings" },
  "ke-4": { id: "ke-4", name: "Our Ravina Kashmiri Earring", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1765877669633.jpeg", category: "Kashmiri Earrings" },
  "tb-1": { id: "tb-1", name: "Our Rouya Tulip Bracelet", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1778324652013.jpg", category: "Tulip Bracelet" },
  "tb-2": { id: "tb-2", name: "Our Deniz Tulip Bracelet", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1777533294853.jpg", category: "Tulip Bracelet" },
  "tb-3": { id: "tb-3", name: "Our Eris Tulip Bracelet", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1776675446491.jpg", category: "Tulip Bracelet" },
  "tb-4": { id: "tb-4", name: "Our Arfia Tulip Bracelet", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1776675758519.jpg", category: "Tulip Bracelet" },
  "atc-1": { id: "atc-1", name: "Love Multi-layer Star Anklet", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1778328000857.jpg", category: "Anti-Tarnish Chains" },
  "atc-2": { id: "atc-2", name: "Double Layer Heart Choker", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1770298539595.jpg", category: "Anti-Tarnish Chains" },
  "atc-3": { id: "atc-3", name: "Classic Link Chain Necklace", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1770298569027.jpg", category: "Anti-Tarnish Chains" },
  "atc-4": { id: "atc-4", name: "Delicate Diamond Ring Chain", price: "₹149", image: "https://d28arj6mdig261.cloudfront.net/1770298514550.jpg", category: "Anti-Tarnish Chains" },
  "p1": { 
    id: "p1", 
    name: "Meera Anti-Tarnish Kundan Chandbalis", 
    price: "₹149", 
    image: "images/earrings/1/WhatsApp Image 2026-06-15 at 11.04.48 PM (1).jpeg", 
    category: "Earrings",
    gallery: [
      "images/earrings/1/WhatsApp Image 2026-06-15 at 11.04.48 PM (1).jpeg"
    ],
    description: "Handcrafted traditional Indian Kundan Chandbalis, finished in a premium gold-tone over a lightweight alloy base. Adorned with cluster CZ stones and premium faux pearls. Features our advanced anti-tarnish guard for lasting color protection. Hypoallergenic, lightweight, and perfect for ethnic celebrations."
  },
  "p2": { 
    id: "p2", 
    name: "Aura Celestial Hoops", 
    price: "₹149", 
    image: "images/earrings/2/WhatsApp Image 2026-06-15 at 11.04.48 PM.jpeg", 
    category: "Earrings",
    gallery: [
      "images/earrings/2/WhatsApp Image 2026-06-15 at 11.04.48 PM.jpeg"
    ],
    description: "Minimalist, daily-wear geometric hoop earrings with a high-shine gold-tone finish. Fitted with a secure click-lock latch. Fully anti-tarnish treated for lasting color protection. Waterproof, sweat-proof, and designed to match both Western and casual outfits."
  },
  "p3": { 
    id: "p3", 
    name: "Ziya Simulated Emerald Drop Jhumkas", 
    price: "₹149", 
    image: "images/earrings/3/WhatsApp Image 2026-06-15 at 11.04.51 PM (1).jpeg", 
    category: "Earrings",
    gallery: [
      "images/earrings/3/WhatsApp Image 2026-06-15 at 11.04.51 PM (1).jpeg",
      "images/earrings/3/WhatsApp Image 2026-06-12 at 10.53.22 AM.jpeg"
    ],
    description: "Fusion dangle jhumkas with vibrant simulated emerald drops suspended from a micro-pave cubic zirconia floral stud. Finished in a premium gold-tone. Features advanced anti-tarnish protection for lasting color. Extremely lightweight and comfortable."
  },
  "p4": { 
    id: "p4", 
    name: "Avni Royal Kundan Pearl Drops", 
    price: "₹149", 
    image: "images/earrings/4/WhatsApp Image 2026-06-12 at 2.19.55 PM.jpeg", 
    category: "Earrings",
    gallery: [
      "images/earrings/4/WhatsApp Image 2026-06-12 at 2.19.55 PM.jpeg",
      "images/earrings/4/WhatsApp Image 2026-06-12 at 2.20.37 PM.jpeg"
    ],
    description: "Regal drop earrings featuring hand-set Kundan stones and suspended organic shell pearls. Finished in an antique gold-tone. Protected with an anti-tarnish barrier and designed for long-lasting wear. The perfect accessory for wedding and bridal wear."
  },
  "p5": { 
    id: "p5", 
    name: "Lumina Premium CZ Solitaire Studs", 
    price: "₹149", 
    image: "images/earrings/5/WhatsApp Image 2026-06-15 at 11.04.50 PM.jpeg", 
    category: "Earrings",
    gallery: [
      "images/earrings/5/WhatsApp Image 2026-06-15 at 11.04.50 PM.jpeg"
    ],
    description: "Classic four-prong stud earrings holding flawless AAAAA-grade simulated cubic zirconia solitaires. Finished in a premium silver-tone. Anti-tarnish coated for lasting color protection. Versatile and timeless, ideal for office wear and special occasions."
  },
  "p6": { 
    id: "p6", 
    name: "Tara Rose Gold Starburst Dangles", 
    price: "₹149", 
    image: "images/earrings/6/WhatsApp Image 2026-06-12 at 3.18.11 PM.jpeg", 
    category: "Earrings",
    gallery: [
      "images/earrings/6/WhatsApp Image 2026-06-12 at 3.18.11 PM.jpeg",
      "images/earrings/6/WhatsApp Image 2026-06-12 at 3.21.40 PM.jpeg"
    ],
    description: "Elegant starburst danglers featuring pave-set CZ stone arrays that capture and reflect light. Finished in highly polished rose gold-tone. Includes premium anti-tarnish coating for lasting color protection. Hypoallergenic posts make them comfortable for sensitive ears."
  },
  "p7": {
    id: "p7",
    name: "Nisha Geometric Drops",
    price: "₹149",
    image: "images/earrings/7/WhatsApp Image 2026-06-15 at 11.04.48 PM (2).jpeg",
    category: "Earrings",
    gallery: [
      "images/earrings/7/WhatsApp Image 2026-06-15 at 11.04.48 PM (2).jpeg"
    ],
    description: "Chic geometric hexagonal drop earrings with an elegant ribbed/shell design top stud. Fully anti-tarnish treated with a high-shine yellow gold finish over a premium base alloy. Modern, bold, and extremely lightweight."
  },
  "p8": {
    id: "p8",
    name: "Riya Twisted Hoops",
    price: "₹149",
    image: "images/earrings/8/WhatsApp Image 2026-06-15 at 11.04.51 PM.jpeg",
    category: "Earrings",
    gallery: [
      "images/earrings/8/WhatsApp Image 2026-06-15 at 11.04.51 PM.jpeg"
    ],
    description: "Stunning twisted rope hoop earrings finished in a premium gold-tone. Comes with a secure click-lock post. Sweat-proof, waterproof, anti-tarnish treated, and perfect for adding texture to any look."
  }
};

// 2. SEARCH LOGIC
const searchInputEl = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const searchResultsEl = document.getElementById('searchResults');
const suggestionTags = document.querySelectorAll('.suggestion-tags .tag-pill');

if (searchInputEl) {
  searchInputEl.addEventListener('input', (e) => {
    const val = e.target.value.trim().toLowerCase();
    if (val.length > 0) {
      if (searchClearBtn) searchClearBtn.style.display = 'block';
      performSearch(val);
    } else {
      if (searchClearBtn) searchClearBtn.style.display = 'none';
      if (searchResultsEl) searchResultsEl.innerHTML = '';
    }
  });
}

if (searchClearBtn) {
  searchClearBtn.addEventListener('click', () => {
    if (searchInputEl) {
      searchInputEl.value = '';
      searchInputEl.focus();
    }
    searchClearBtn.style.display = 'none';
    if (searchResultsEl) searchResultsEl.innerHTML = '';
  });
}

suggestionTags.forEach(tag => {
  tag.addEventListener('click', () => {
    const term = tag.textContent.trim();
    if (searchInputEl) {
      searchInputEl.value = term;
      if (searchClearBtn) searchClearBtn.style.display = 'block';
      performSearch(term.toLowerCase());
    }
  });
});

function performSearch(query) {
  if (!searchResultsEl) return;
  searchResultsEl.innerHTML = '';
  
  const matches = [];
  for (const id in allProductsDatabase) {
    const prod = allProductsDatabase[id];
    if (prod.name.toLowerCase().includes(query) || prod.category.toLowerCase().includes(query)) {
      matches.push(prod);
    }
  }
  
  if (matches.length === 0) {
    searchResultsEl.innerHTML = `<p style="color: var(--cream-muted); text-align: center; padding: 2rem;">No items found matching "${query}"</p>`;
    return;
  }
  
  matches.forEach(item => {
    const div = document.createElement('div');
    div.className = 'search-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="search-item-img" />
      <div class="search-item-info">
        <h4>${item.name}</h4>
        <span>${item.price}</span>
      </div>
    `;
    div.addEventListener('click', () => {
      window.open(`collection.html?product=${item.id}`, '_blank');
    });
    searchResultsEl.appendChild(div);
  });
}

// 3. WISHLIST SYSTEM
let wishlist = JSON.parse(localStorage.getItem('avanika_wishlist') || '[]');

const wishlistToggleBtn = document.getElementById('wishlistToggleBtn');
const wishlistDrawer = document.getElementById('wishlistDrawer');
const wishlistDrawerOverlay = document.getElementById('wishlistDrawerOverlay');
const wishlistCloseBtn = document.getElementById('wishlistCloseBtn');
const wishlistCountEl = document.getElementById('wishlistCount');
const wishlistBadgeEl = document.getElementById('wishlistBadge');
const wishlistItemsEl = document.getElementById('wishlistItems');
const wishlistEmptyMsg = document.getElementById('wishlistEmptyMessage');
const wishlistStartShoppingBtn = document.getElementById('wishlistStartShoppingBtn');

function saveWishlist() {
  localStorage.setItem('avanika_wishlist', JSON.stringify(wishlist));
  updateWishlistUI();
}

function toggleWishlistItem(productId) {
  const idx = wishlist.indexOf(productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
  } else {
    wishlist.push(productId);
  }
  saveWishlist();
  syncWishlistButtons();
}

function syncWishlistButtons() {
  document.querySelectorAll('.product-btn.wishlist').forEach(btn => {
    const card = btn.closest('.product-card');
    const productId = btn.dataset.id || (card ? card.id : null);
    if (!productId) return;
    
    const svg = btn.querySelector('svg');
    if (wishlist.includes(productId)) {
      btn.classList.add('liked');
      if (svg) {
        svg.style.fill = '#DFB76C';
        svg.style.stroke = '#DFB76C';
      }
    } else {
      btn.classList.remove('liked');
      if (svg) {
        svg.style.fill = 'none';
        svg.style.stroke = 'currentColor';
      }
    }
  });
}

function updateWishlistUI() {
  const count = wishlist.length;
  if (wishlistCountEl) wishlistCountEl.textContent = count;
  if (wishlistBadgeEl) wishlistBadgeEl.textContent = count;
  
  if (!wishlistItemsEl) return;
  
  // Clear list but keep empty message
  const items = wishlistItemsEl.querySelectorAll('.wishlist-item');
  items.forEach(i => i.remove());
  
  if (count === 0) {
    if (wishlistEmptyMsg) wishlistEmptyMsg.style.display = 'block';
    return;
  }
  
  if (wishlistEmptyMsg) wishlistEmptyMsg.style.display = 'none';
  
  wishlist.forEach(productId => {
    const item = allProductsDatabase[productId];
    if (!item) return;
    
    const div = document.createElement('div');
    div.className = 'wishlist-item';
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="wishlist-item-img" />
      <div class="wishlist-item-details">
        <h4 class="wishlist-item-name">${item.name}</h4>
        <span class="wishlist-item-price">${item.price}</span>
        <div class="wishlist-item-actions">
          <button class="wishlist-btn-cart" data-id="${item.id}">Add to Cart</button>
          <button class="wishlist-btn-remove" data-id="${item.id}">Remove</button>
        </div>
      </div>
    `;
    
    // Bind Add to Cart from wishlist
    div.querySelector('.wishlist-btn-cart').addEventListener('click', function(e) {
      e.stopPropagation();
      addToCart(item.id, item.name, item.price, item.image, item.category);
      toggleWishlistItem(item.id); // Remove from wishlist once added to cart
    });
    
    // Bind Remove from wishlist
    div.querySelector('.wishlist-btn-remove').addEventListener('click', function(e) {
      e.stopPropagation();
      toggleWishlistItem(item.id);
    });
    
    wishlistItemsEl.appendChild(div);
  });
}

// Open / Close Wishlist
if (wishlistToggleBtn && wishlistDrawer) {
  wishlistToggleBtn.addEventListener('click', (e) => {
    e.preventDefault();
    wishlistDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  });
}

if (wishlistCloseBtn && wishlistDrawer) {
  wishlistCloseBtn.addEventListener('click', () => {
    wishlistDrawer.classList.remove('active');
    document.body.style.overflow = '';
  });
}

if (wishlistDrawerOverlay && wishlistDrawer) {
  wishlistDrawerOverlay.addEventListener('click', () => {
    wishlistDrawer.classList.remove('active');
    document.body.style.overflow = '';
  });
}

if (wishlistStartShoppingBtn && wishlistDrawer) {
  wishlistStartShoppingBtn.addEventListener('click', () => {
    wishlistDrawer.classList.remove('active');
    document.body.style.overflow = '';
    window.location.hash = '#featured';
  });
}

// Bind custom click to all product card wishlist buttons
document.querySelectorAll('.product-btn.wishlist').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const card = this.closest('.product-card');
    const productId = this.dataset.id || (card ? card.id : null);
    if (productId) {
      toggleWishlistItem(productId);
    }
  });
});

// Initialize Wishlist
updateWishlistUI();
syncWishlistButtons();

// 4. SOCIAL PROOF (RECENT ORDERS TOAST)
const socialProofPopup = document.getElementById('socialProofPopup');
const spCustomerName = document.getElementById('spCustomerName');
const spCustomerCity = document.getElementById('spCustomerCity');
const spProductName = document.getElementById('spProductName');
const spProductImg = document.getElementById('spProductImg');
const spTimeAgo = document.getElementById('spTimeAgo');
const spCloseBtn = document.getElementById('spCloseBtn');

const mockPurchases = [
  { name: "Simran", city: "Delhi", productId: "p1", time: "3 mins ago" },
  { name: "Anjali", city: "Mumbai", productId: "p2", time: "12 mins ago" },
  { name: "Priya", city: "Bangalore", productId: "p3", time: "8 mins ago" },
  { name: "Meera", city: "Jaipur", productId: "ox-1", time: "18 mins ago" },
  { name: "Kirti", city: "Pune", productId: "ox-3", time: "4 mins ago" },
  { name: "Shreya", city: "Ahmedabad", productId: "tb-2", time: "22 mins ago" }
];

let purchaseIndex = 0;

function showSocialProof() {
  if (!socialProofPopup) return;
  
  const purchase = mockPurchases[purchaseIndex % mockPurchases.length];
  const product = allProductsDatabase[purchase.productId];
  
  if (!product) return;
  
  if (spCustomerName) spCustomerName.textContent = purchase.name;
  if (spCustomerCity) spCustomerCity.textContent = purchase.city;
  if (spProductName) spProductName.textContent = product.name;
  if (spProductImg) spProductImg.src = product.image;
  if (spTimeAgo) spTimeAgo.textContent = purchase.time;
  
  socialProofPopup.classList.add('active');
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    socialProofPopup.classList.remove('active');
  }, 5000);
  
  purchaseIndex++;
}

if (spCloseBtn) {
  spCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (socialProofPopup) socialProofPopup.classList.remove('active');
  });
}

// Start social proof rotation (Disabled by user request)
// setTimeout(showSocialProof, 8000); // 8s after load
// setInterval(showSocialProof, 22000); // Every 22s

// 5. STICKY MOBILE CART BAR
const stickyMobileCartBar = document.getElementById('stickyMobileCartBar');
const stickyCartCount = document.getElementById('stickyCartCount');
const stickyCartTotal = document.getElementById('stickyCartTotal');
const stickyCheckoutBtn = document.getElementById('stickyCheckoutBtn');

function updateStickyCartUI() {
  if (!stickyMobileCartBar) return;
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  if (stickyCartCount) stickyCartCount.textContent = `${totalItems} item${totalItems > 1 ? 's' : ''}`;
  if (stickyCartTotal) stickyCartTotal.textContent = `₹${subtotal.toLocaleString()}`;
  
  // Only activate bar if cart is not empty, screen is mobile, and scrolled past hero
  const isMobile = window.innerWidth <= 768;
  const isScrolledPastHero = window.scrollY > 400;
  
  if (totalItems > 0 && isMobile && isScrolledPastHero) {
    stickyMobileCartBar.classList.add('active');
  } else {
    stickyMobileCartBar.classList.remove('active');
  }
}

if (stickyCheckoutBtn) {
  stickyCheckoutBtn.addEventListener('click', () => {
    window.location.href = 'checkout.html';
  });
}

// Listen to scrolls and cart modifications
window.addEventListener('scroll', updateStickyCartUI);
window.addEventListener('resize', updateStickyCartUI);

// Hook into existing cart update
const originalUpdateCartUI = window.updateCartUI || updateCartUI;
window.updateCartUI = function() {
  if (typeof originalUpdateCartUI === 'function') {
    originalUpdateCartUI();
  }
  updateStickyCartUI();
};


// ===== QUICK VIEW DETAILS MODAL CONTROLLER =====
let activeQuickViewProduct = null;

function openQuickViewModal(productId) {
  const product = allProductsDatabase[productId];
  if (!product) return;

  activeQuickViewProduct = product;

  const qvModal = document.getElementById('quickViewModal');
  const qvMainImage = document.getElementById('qvMainImage');
  const qvThumbnails = document.getElementById('qvThumbnails');
  const qvCategory = document.getElementById('qvCategory');
  const qvName = document.getElementById('qvName');
  const qvDescription = document.getElementById('qvDescription');
  const qvQtyInput = document.getElementById('qvQtyInput');
  const qvPriceDiscounted = document.getElementById('qvPriceDiscounted');
  const qvPriceOriginal = document.getElementById('qvPriceOriginal');

  if (qvCategory) qvCategory.textContent = product.category;
  if (qvName) qvName.textContent = product.name;
  if (qvDescription) qvDescription.textContent = product.description || "Premium handcrafted anti-tarnish jewelry piece.";
  if (qvMainImage) {
    qvMainImage.src = product.image;
    qvMainImage.alt = product.name;
  }
  
  if (qvPriceDiscounted) qvPriceDiscounted.textContent = product.price || "₹300";
  if (qvPriceOriginal) qvPriceOriginal.textContent = product.compare_at_price || "₹500";
  
  if (qvQtyInput) qvQtyInput.value = 1;

  // Render thumbnails
  if (qvThumbnails) {
    qvThumbnails.innerHTML = '';
    const gallery = product.gallery || [product.image];
    gallery.forEach(imgUrl => {
      const thumbWrap = document.createElement('div');
      thumbWrap.className = 'qv-thumb-wrap' + (imgUrl === product.image ? ' active' : '');
      thumbWrap.innerHTML = `<img src="${imgUrl}" alt="${product.name} thumbnail" />`;
      thumbWrap.addEventListener('click', () => {
        if (qvMainImage) {
          qvMainImage.src = imgUrl;
        }
        qvThumbnails.querySelectorAll('.qv-thumb-wrap').forEach(t => t.classList.remove('active'));
        thumbWrap.classList.add('active');
      });
      qvThumbnails.appendChild(thumbWrap);
    });
  }

  if (qvModal) {
    qvModal.style.display = 'flex';
    setTimeout(() => {
      qvModal.classList.add('active');
      document.body.style.overflow = 'hidden'; // Lock page scroll
    }, 10);
  }
}

function closeQuickViewModal() {
  const qvModal = document.getElementById('quickViewModal');
  if (qvModal) {
    qvModal.classList.remove('active');
    setTimeout(() => {
      qvModal.style.display = 'none';
      document.body.style.overflow = ''; // Restore scroll
      activeQuickViewProduct = null;
    }, 300);
  }
}

// Bind close button and overlay clicks
const qvCloseBtn = document.getElementById('qvCloseBtn');
const qvModalOverlay = document.getElementById('qvModalOverlay');

if (qvCloseBtn) {
  qvCloseBtn.addEventListener('click', closeQuickViewModal);
}
if (qvModalOverlay) {
  qvModalOverlay.addEventListener('click', closeQuickViewModal);
}

// Close on escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuickViewModal();
  }
});

// Quantity selection buttons in Quick View
const qvQtyMinus = document.getElementById('qvQtyMinus');
const qvQtyPlus = document.getElementById('qvQtyPlus');
const qvQtyInput = document.getElementById('qvQtyInput');

if (qvQtyMinus && qvQtyInput) {
  qvQtyMinus.addEventListener('click', () => {
    let currentVal = parseInt(qvQtyInput.value) || 1;
    if (currentVal > 1) {
      qvQtyInput.value = currentVal - 1;
    }
  });
}

if (qvQtyPlus && qvQtyInput) {
  qvQtyPlus.addEventListener('click', () => {
    let currentVal = parseInt(qvQtyInput.value) || 1;
    qvQtyInput.value = currentVal + 1;
  });
}

// Action button: Add to Cart from Quick View
const qvAddToCartBtn = document.getElementById('qvAddToCartBtn');
if (qvAddToCartBtn) {
  qvAddToCartBtn.addEventListener('click', () => {
    if (!activeQuickViewProduct) return;
    const qty = parseInt(qvQtyInput.value) || 1;
    addToCart(
      activeQuickViewProduct.id, 
      activeQuickViewProduct.name, 
      activeQuickViewProduct.price || "₹300", 
      activeQuickViewProduct.image, 
      activeQuickViewProduct.category,
      qty,
      true // open cart drawer
    );
    
    // Add success animation
    gsap.fromTo(qvAddToCartBtn, 
      { scale: 0.95 }, 
      { scale: 1, duration: 0.3, ease: 'back.out(2)' }
    );
    
    // Auto-close modal after adding to cart
    setTimeout(closeQuickViewModal, 400);
  });
}

// Action button: Buy Now / Express Checkout from Quick View
const qvBuyNowBtn = document.getElementById('qvBuyNowBtn');
if (qvBuyNowBtn) {
  qvBuyNowBtn.addEventListener('click', () => {
    if (!activeQuickViewProduct) return;
    const qty = parseInt(qvQtyInput.value) || 1;
    addToCart(
      activeQuickViewProduct.id, 
      activeQuickViewProduct.name, 
      activeQuickViewProduct.price || "₹300", 
      activeQuickViewProduct.image, 
      activeQuickViewProduct.category,
      qty,
      false // do NOT open cart drawer (we're navigating straight to checkout)
    );
    
    // Add success animation and redirect
    gsap.fromTo(qvBuyNowBtn, 
      { scale: 0.95 }, 
      { scale: 1, duration: 0.3, ease: 'back.out(2)' }
    );
    
    setTimeout(() => {
      closeQuickViewModal();
      window.location.href = 'checkout.html';
    }, 300);
  });
}


