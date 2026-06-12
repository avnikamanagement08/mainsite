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

  // 2. Hero Timeline
  const tl = gsap.timeline();

  tl.to('.hero-badge', { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' })
    .to('.gsap-split-text .char', {
      y: '0%',
      duration: 0.8,
      stagger: 0.02,
      ease: 'power4.out'
    }, '-=0.4')
    .to('.hero-desc', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .to('.hero-actions', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .to('.hero-stats', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
    .to('.hero-image-frame', { opacity: 1, x: 0, duration: 1.2, ease: 'power3.out' }, '-=1.2')
    .to('.hero-floating-card', { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.2, ease: 'back.out(1.7)' }, '-=0.8')
    .to('.hero-scroll-indicator', { opacity: 1, y: 0, duration: 0.6 }, '-=0.4');

  // 3. ScrollTrigger Reveals (Section Headers)
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

  // 4. Collections Cards Reveal
  gsap.fromTo('.collection-card', 
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      stagger: 0.2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.collections-grid',
        start: 'top 75%'
      }
    }
  );

  // 5. Featured Product Cards Reveal
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

  // 6. Atelier Canvas Bento Grid Stagger Reveal
  gsap.fromTo('.bento-card', 
    { opacity: 0, y: 60 },
    {
      opacity: 1,
      y: 0,
      duration: 0.9,
      stagger: 0.15,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: '.bento-grid',
        start: 'top 75%'
      }
    }
  );

  // 7. Sketch SVG Path Drawing on Scroll
  const sketchWrapper = document.querySelector('.sketch-wrapper');
  const paths = document.querySelectorAll('.sketch-path');
  
  if (sketchWrapper && paths.length > 0) {
    paths.forEach(path => {
      // Prevent crash if element is a polygon/other non-path SVG tag
      if (typeof path.getTotalLength === 'function') {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;
      }
    });

    ScrollTrigger.create({
      trigger: '.sketch-panel',
      start: 'top 65%',
      end: 'bottom 40%',
      scrub: 0.5,
      onUpdate: self => {
        const progress = self.progress;
        
        // Update progress bar fill
        const progressFill = document.querySelector('.sketch-progress-fill');
        if (progressFill) progressFill.style.width = `${progress * 100}%`;

        // Update path drawing offsets
        paths.forEach(path => {
          const length = parseFloat(path.style.strokeDasharray);
          path.style.strokeDashoffset = length * (1 - progress);
        });

        // If path is completely drawn, swap sketch to real ring
        if (progress >= 0.98) {
          sketchWrapper.classList.add('completed');
        } else {
          sketchWrapper.classList.remove('completed');
        }
      }
    });
  }

  // 8. Clarity Cut Selector Stats Gauge Trigger
  const gaugeFill = document.querySelector('.gauge-fill');
  if (gaugeFill) {
    ScrollTrigger.create({
      trigger: '.clarity-panel',
      start: 'top 70%',
      onEnter: () => {
        updateClarityGauge(98); // Initial Brilliant Cut Score
      }
    });
  }
  
  // 9. Curved Marquee Animation
  initCurvedMarquee();

  // 10. Hero Slider Carousel
  initHeroSlider();

  // 11. Categories Scroll Drag
  initCategoriesDrag();
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
    const email = document.getElementById('emailInput').value.trim();

    if (!name || !email) return;

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
function addToCart(id, name, price, image, category) {
  // Clean price value from symbols and commas
  const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
  
  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: numericPrice,
      rawPriceString: price, // For clean presentation
      image: image,
      category: category,
      quantity: 1
    });
  }
  
  saveCartToStorage();
  updateCartUI();
  openCart();
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

// Bind product listing "Add to Cart" actions
document.querySelectorAll('.product-card').forEach(card => {
  const addBtn = card.querySelector('.add-to-cart');
  if (addBtn) {
    addBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      
      const id = card.id;
      const name = card.querySelector('.product-name').textContent.trim();
      const price = card.querySelector('.product-price').textContent.trim();
      const image = card.querySelector('.product-img').src;
      const category = card.querySelector('.product-category').textContent.trim();
      
      // Perform bounce on Add to Cart button
      gsap.fromTo(this, 
        { scale: 0.9 }, 
        { scale: 1, duration: 0.4, ease: 'back.out(2)' }
      );
      
      // Add the item to cart
      addToCart(id, name, price, image, category);
    });
  }
  
  // Clicking quick view or wishlist button shouldn't trigger product card click navigation
  const qvBtn = card.querySelector('.quick-view');
  if (qvBtn) {
    qvBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      alert('Quick View feature is coming soon!');
    });
  }
});

// Bind search and wishlist button alerts in navbar
const searchBtn = document.getElementById('searchBtn');
if (searchBtn) {
  searchBtn.addEventListener('click', () => {
    alert('Search functionality coming soon!');
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

