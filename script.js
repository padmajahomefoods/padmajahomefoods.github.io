// ============================================
// PADMAJA HOME FOODS — CLEAN, TRUST-FOCUSED JS
// REFACTORED: Products now loaded from products.json
// No fake data. Only real business info.
// ============================================

let cart = [];
let PRODUCTS = []; // Loaded dynamically from products.json

// ============================================
// PRODUCT DATA LOADER
// Fetches products.json and populates PRODUCTS array.
// This enables the Admin Panel to manage products
// without editing JavaScript files.
// ============================================
async function loadProducts() {
    try {
        const response = await fetch('products.json?v=' + Date.now());
        if (!response.ok) throw new Error('Failed to load products');
        const data = await response.json();
        PRODUCTS = data;
        return true;
    } catch (error) {
        console.error('Error loading products:', error);
        showToast('Failed to load products. Please refresh.', 'error');
        return false;
    }
}

// ============================================
// PRICE HELPERS (for backward compatibility)
// Converts per-weight prices to base price for existing logic.
// The admin panel stores individual prices per weight (price250,
// price500, price1000). These helpers bridge to the existing
// cart/price calculation system.
// ============================================
function getBasePrice(product) {
    // Return per-kg price (price1000) for backward compatibility
    return product.price1000 || 0;
}

function getPriceForWeight(product, weightStr) {
    // Direct price lookup by weight string
    const w = weightStr.toLowerCase().replace('kg', 'Kg');
    if (w === '100g' && product.price100g) return product.price100g;
    if (w === '250g' && product.price250) return product.price250;
    if (w === '500g' && product.price500) return product.price500;
    if ((w === '1kg' || w === '1Kg') && product.price1000) return product.price1000;
    // Fallback: calculate from base price
    const grams = parseWeight(weightStr);
    const base = getBasePrice(product);
    return Math.round((base * grams) / 1000);
}


// ============================================
// LOCALSTORAGE
// ============================================
function saveCart() {
    localStorage.setItem('padmaja_cart', JSON.stringify({ version: 2, items: cart }));
}

function loadCart() {
    const saved = localStorage.getItem('padmaja_cart');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            cart = (data.version === 2 ? data.items : data.version === 1 ? data.items : []) || [];
        } catch (e) {
            cart = [];
        }
    }
}

function clearSavedCart() {
    localStorage.removeItem('padmaja_cart');
}

// ============================================
// NAVBAR
// ============================================
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
    }
});

function openMobileMenu() {
    const overlay = document.getElementById('mobileOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeMobileMenu() {
    const overlay = document.getElementById('mobileOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// CART SIDEBAR
// ============================================
function toggleCart(forceOpen = null) {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if (!sidebar || !overlay) return;

    const isOpen = sidebar.classList.contains('active');
    if (forceOpen === true || !isOpen) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// CART FUNCTIONALITY
// ============================================
function addToCart(btn, productName, basePrice) {
    const card = btn.closest('.product-card');
    const activeBtn = card.querySelector('.weight-btn.active');
    const weight = activeBtn ? activeBtn.textContent : getDefaultWeight(productName);

    const product = PRODUCTS.find(p => p.name === productName);
    const finalPrice = product ? getPriceForWeight(product, weight) : Math.round((basePrice * parseWeight(weight)) / 1000);
    const weightInGrams = parseWeight(weight);

    const existingItem = cart.find(item => item.name === productName && item.weight === weight);

    if (existingItem) {
        if (existingItem.quantity >= 10) {
            showToast('Maximum 10 items per product', 'error');
            return;
        }
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: productName,
            weight: weight,
            weightInGrams: weightInGrams,
            price: finalPrice,
            basePrice: basePrice,
            quantity: 1
        });
    }

    updateCartUI();
    saveCart();
    playTickSound();

    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
    btn.classList.add('added');

    const cartIcon = document.querySelector('.nav-cart');
    if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 500);
    }

    showToast(`${productName} (${weight}) added to cart`, 'success');

    setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
        btn.classList.remove('added');
    }, 1200);
}

function updateQuantity(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartUI();
    saveCart();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    saveCart();
    showToast('Item removed from cart', 'info');
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotal = document.getElementById('cartTotal');
    const stickyCount = document.getElementById('stickyCartCount');
    const stickyTotal = document.getElementById('stickyCartTotal');
    const stickyBtn = document.getElementById('stickyCartBtn');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartBadge) cartBadge.textContent = totalItems;
    if (stickyCount) stickyCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = '₹' + totalPrice.toLocaleString('en-IN');
    if (stickyTotal) stickyTotal.textContent = '₹' + totalPrice.toLocaleString('en-IN');
    if (stickyBtn) stickyBtn.classList.toggle('active', totalItems > 0);

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🌶️</div>
                <h4>Your spice box is empty</h4>
                <p>Add authentic Guntur flavors to get started</p>
            </div>
        `;
        return;
    }

    cartItems.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <span class="cart-item-weight">${item.weight}</span>
                <span class="cart-item-price">₹${item.price} each</span>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button onclick="updateQuantity(${index}, -1)" aria-label="Decrease quantity"><i class="fas fa-minus"></i></button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)" aria-label="Increase quantity"><i class="fas fa-plus"></i></button>
                </div>
                <div class="cart-item-total">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})" aria-label="Remove item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function placeOrder() {
    if (cart.length === 0) {
        showToast('Your cart is empty! Add some items first.', 'error');
        return;
    }

    let message = 'Hello Padmaja Home Foods 👋\n\nI want to order:\n\n';

    cart.forEach((item, index) => {
        const emoji = ['1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟'][index] || `${index + 1}.`;
        message += `${emoji} ${item.name} - ${item.weight} × ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\n*Total: ₹${totalPrice}*\n\nPlease share your delivery details:\nName:\nAddress:\nPincode:\nPhone:`;

    window.open(`https://wa.me/919381311511?text=${encodeURIComponent(message)}`, '_blank');

    cart = [];
    updateCartUI();
    clearSavedCart();
    toggleCart();
    showToast('Redirecting to WhatsApp...', 'success');
}

// ============================================
// QUICK ORDER (Single Product)
// ============================================
function quickOrder(btn, productName, basePrice) {
    const card = btn.closest('.product-card');
    const activeBtn = card.querySelector('.weight-btn.active');
    const weight = activeBtn ? activeBtn.textContent : getDefaultWeight(productName);

    const product = PRODUCTS.find(p => p.name === productName);
    const finalPrice = product ? getPriceForWeight(product, weight) : Math.round((basePrice * parseWeight(weight)) / 1000);
    const weightInGrams = parseWeight(weight);

    const message = `Hi! I want to order *${productName}* - ${weight} (₹${finalPrice})\n\nPlease share delivery details:\nName:\nAddress:\nPincode:`;

    window.open(`https://wa.me/919381311511?text=${encodeURIComponent(message)}`, '_blank');

    showToast(`Opening WhatsApp for ${productName}...`, 'success');
    return false;
}

// ============================================
// WEIGHT SELECTION
// ============================================
function selectWeight(btn, weight) {
    const card = btn.closest('.product-card');
    const allBtns = card.querySelectorAll('.weight-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const productName = card.getAttribute('data-product');
    const product = PRODUCTS.find(p => p.name === productName);
    const priceDisplay = card.querySelector('.product-price');
    const calculatedPrice = product ? getPriceForWeight(product, weight >= 1000 ? '1Kg' : weight + 'g') : 0;
    const weightText = weight >= 1000 ? '1Kg' : weight + 'g';

    if (priceDisplay) priceDisplay.innerHTML = `₹${calculatedPrice} <span>/ ${weightText}</span>`;
}

function getDefaultWeight(productName) {
    const product = PRODUCTS.find(p => p.name === productName);
    if (!product) return '250g';
    return product.weights[0];
}

function parseWeight(weightStr) {
    if (weightStr === '1Kg') return 1000;
    return parseInt(weightStr.replace('g', '')) || 250;
}

// ============================================
// CATEGORY FILTER
// ============================================
function filterCategory(category) {
    const allSections = document.querySelectorAll('.products-section');
    const allBtns = document.querySelectorAll('.filter-btn');

    allBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (category === 'all') {
        allSections.forEach(section => section.classList.add('active'));
    } else {
        allSections.forEach(section => {
            section.classList.toggle('active', section.getAttribute('data-category') === category);
        });
    }

    const firstActive = document.querySelector('.products-section.active');
    if (firstActive) {
        const controls = document.querySelector('.shop-controls');
        const offset = controls ? controls.offsetHeight + 80 : 100;
        const top = firstActive.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
    }
}

// ============================================
// SEARCH
// ============================================
function searchProducts() {
    const input = document.getElementById('productSearch');
    const results = document.getElementById('searchResults');
    const clearBtn = document.getElementById('searchClear');
    const query = input.value.trim().toLowerCase();

    if (query.length === 0) {
        results.innerHTML = '';
        results.classList.remove('active');
        clearBtn.classList.remove('active');
        return;
    }

    clearBtn.classList.add('active');

    const matches = PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        results.innerHTML = '<div class="search-no-results">No products found</div>';
        results.classList.add('active');
        return;
    }

    results.innerHTML = matches.map(p => `
        <div class="search-result-item" onclick="goToProduct('${p.catId}', '${p.id}')">
            <img src="${p.image}" alt="${p.name}" class="search-result-img" onerror="this.style.display='none';this.parentElement.querySelector('.search-fallback').style.display='flex'">
            <div class="search-fallback" style="display:none;width:40px;height:40px;background:var(--gray-100);border-radius:var(--radius-sm);align-items:center;justify-content:center;color:var(--gray-400);font-size:0.7rem;">IMG</div>
            <div>
                <div class="search-result-name">${p.name}</div>
                <div class="search-result-category">${p.category}</div>
            </div>
        </div>
    `).join('');

    results.classList.add('active');
}

function clearSearch() {
    const input = document.getElementById('productSearch');
    const results = document.getElementById('searchResults');
    const clearBtn = document.getElementById('searchClear');

    input.value = '';
    results.innerHTML = '';
    results.classList.remove('active');
    clearBtn.classList.remove('active');
    input.focus();
}

function goToProduct(categoryId, productId) {
    clearSearch();

    document.querySelectorAll('.products-section').forEach(s => s.classList.add('active'));

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        const btnText = btn.textContent.toLowerCase();
        if (categoryId === 'masala' && btnText.includes('masala')) btn.classList.add('active');
        else if (categoryId === 'vegpickles' && btnText.includes('veg')) btn.classList.add('active');
        else if (categoryId === 'nonvegpickles' && btnText.includes('non-veg')) btn.classList.add('active');
        else if (categoryId === 'sweets' && btnText.includes('sweets')) btn.classList.add('active');
        else if (btnText.includes('all')) btn.classList.add('active');
    });

    setTimeout(() => {
        const card = document.getElementById(productId);
        if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            card.style.animation = 'highlightProduct 1.5s ease';
            setTimeout(() => { card.style.animation = ''; }, 1500);
        }
    }, 200);
}

// ============================================
// SHARE PRODUCT
// ============================================
function shareProduct(btn) {
    const card = btn.closest('.product-card');
    if (!card) return;

    const productName = card.getAttribute('data-product');
    const productId = card.id;
    const activeBtn = card.querySelector('.weight-btn.active');
    const weight = activeBtn ? activeBtn.textContent : getDefaultWeight(productName);

    const priceEl = card.querySelector('.product-price');
    const priceText = priceEl ? priceEl.textContent.trim() : '';

    const shareUrl = window.location.origin + '/product.html?id=' + productId;
    const shareText = `Check out ${productName} (${weight}) from Padmaja Home Foods — ${priceText}\n\n${shareUrl}`;

    if (navigator.share) {
        navigator.share({
            title: `${productName} | Padmaja Home Foods`,
            text: shareText
        }).catch(() => {});
    } else {
        copyToClipboard(shareText);
        showToast(`Link copied for ${productName}!`, 'success');
    }
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : 
                 type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// SOUND EFFECTS
// ============================================
function playTickSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 900;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.08);
    } catch (e) {}
}

// ============================================
// SCROLL ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
};

const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            scrollObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

function initScrollAnimations() {
    document.querySelectorAll('.product-card, .trust-badge, .home-feature').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`;
        scrollObserver.observe(el);
    });
}

// ============================================
// PRODUCT DETAIL PAGE (PDP)
// ============================================
function initProductPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = 'index.html';
        return;
    }

    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('pdpTitle').textContent = product.name;
    document.getElementById('pdpSubtitle').textContent = product.desc;
    document.getElementById('pdpImage').src = product.image;
    document.getElementById('pdpImage').alt = product.name;
    document.getElementById('pdpBreadcrumbName').textContent = product.name;
    document.getElementById('pdpBreadcrumbCategory').textContent = product.category;
    document.getElementById('pdpBreadcrumbCategory').href = `index.html#${product.catId}`;
    document.getElementById('pdpDescription').textContent = product.desc;

    // Badges
    const badgesContainer = document.getElementById('pdpBadges');
    badgesContainer.innerHTML = '';
    if (product.badge) {
        const badgeClass = product.badge === 'bestseller' ? 'badge-bestseller' :
                          product.badge === 'popular' ? 'badge-popular' :
                          product.badge === 'new' ? 'badge-new' : 'badge-premium';
        const badgeText = product.badge === 'bestseller' ? 'Best Seller' :
                         product.badge === 'popular' ? 'Popular' :
                         product.badge === 'new' ? 'New' : 'Premium';
        badgesContainer.innerHTML = `<span class="badge ${badgeClass}">${badgeText}</span>`;
    }

    // Weight options
    const weightContainer = document.getElementById('pdpWeightOptions');
    weightContainer.innerHTML = product.weights.map((w, i) => {
        const price = getPriceForWeight(product, w);
        const isActive = i === 0 ? 'active' : '';
        return `
            <button class="pdp-weight-btn ${isActive}" onclick="selectPDPWeight(this, '${w}', ${price})" data-weight="${w}">
                ${w}
                <span class="w-price">₹${price}</span>
            </button>
        `;
    }).join('');

    // Set initial price
    const initialWeight = product.weights[0];
    const initialPrice = getPriceForWeight(product, initialWeight);

    document.getElementById('pdpPrice').textContent = '₹' + initialPrice;

    updatePDPButtons(product, product.weights[0], initialPrice);

    // Related products
    const related = PRODUCTS.filter(p => p.catId === product.catId && p.id !== product.id).slice(0, 4);
    const relatedContainer = document.getElementById('pdpRelated');
    if (related.length > 0 && relatedContainer) {
        relatedContainer.innerHTML = related.map(p => createProductCard(p)).join('');
    }

    document.title = `${product.name} | Padmaja Home Foods — Authentic Guntur Spices & Pickles`;

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = `${product.desc} Order ${product.name} online from Padmaja Home Foods. Homemade, 100% natural, delivered across India.`;
}

function selectPDPWeight(btn, weight, price) {
    const allBtns = document.querySelectorAll('.pdp-weight-btn');
    allBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.getElementById('pdpPrice').textContent = '₹' + price;

    const product = PRODUCTS.find(p => p.id === new URLSearchParams(window.location.search).get('id'));
    if (product) {
        updatePDPButtons(product, weight, price);
    }
}

function updatePDPButtons(product, weight, price) {
    const orderBtn = document.getElementById('pdpOrderBtn');
    const cartBtn = document.getElementById('pdpCartBtn');

    if (orderBtn) {
        orderBtn.onclick = function() {
            const message = `Hi! I want to order *${product.name}* - ${weight} (₹${price})\n\nPlease share delivery details:\nName:\nAddress:\nPincode:`;
            window.open(`https://wa.me/919381311511?text=${encodeURIComponent(message)}`, '_blank');
            showToast('Opening WhatsApp...', 'success');
        };
    }

    if (cartBtn) {
        cartBtn.onclick = function() {
            const weightInGrams = parseWeight(weight);
            const existingItem = cart.find(item => item.name === product.name && item.weight === weight);

            if (existingItem) {
                if (existingItem.quantity >= 10) {
                    showToast('Maximum 10 items per product', 'error');
                    return;
                }
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: product.name,
                    weight: weight,
                    weightInGrams: weightInGrams,
                    price: price,
                    basePrice: getBasePrice(product),
                    quantity: 1
                });
            }

            updateCartUI();
            saveCart();
            playTickSound();
            showToast(`${product.name} (${weight}) added to cart`, 'success');

            cartBtn.innerHTML = '<i class="fas fa-check"></i> Added!';
            cartBtn.classList.add('added');
            setTimeout(() => {
                cartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Add to Cart';
                cartBtn.classList.remove('added');
            }, 1200);
        };
    }
}

// ============================================
// PRODUCT CARD GENERATOR — CLEAN, NO FAKE DATA
// ============================================
function createProductCard(product) {
    const defaultWeight = product.weights[0];
    const defaultPrice = getPriceForWeight(product, defaultWeight);

    const badgeHtml = product.badge ? 
        `<span class="badge badge-${product.badge}">${product.badge === 'bestseller' ? 'Best Seller' : product.badge === 'popular' ? 'Popular' : product.badge === 'new' ? 'New' : 'Premium'}</span>` : '';

    const weightButtons = product.weights.map((w, i) => {
        const grams = parseWeight(w);
        const active = i === 0 ? 'active' : '';
        return `<button class="weight-btn ${active}" onclick="selectWeight(this, ${grams})">${w}</button>`;
    }).join('');

    // Use a reliable fallback image path
    const imgPath = product.image;

    return `
        <div class="product-card" id="${product.id}" data-product="${product.name}" data-base-price="${product.price}">
            <a href="product.html?id=${product.id}" class="product-card-link">
                <div class="product-image">
                    <img src="${imgPath}" alt="${product.name}" loading="lazy" 
                        onerror="this.onerror=null;this.src='logo.png';this.style.objectFit='contain';this.style.padding='20px'">
                    <div class="product-badges">${badgeHtml}</div>
                </div>
            </a>
            <button class="product-share-btn" onclick="shareProduct(this)" title="Share" aria-label="Share product">
                <i class="fas fa-share-alt"></i>
            </button>
            <div class="product-info">
                <a href="product.html?id=${product.id}" class="product-card-link">
                    <h4 class="product-name">${product.name}</h4>
                    <p class="product-desc">${product.desc}</p>
                    <div class="product-price-row">
                        <div class="product-price">₹${defaultPrice} <span>/ ${defaultWeight}</span></div>
                    </div>
                </a>
                <div class="weight-options">${weightButtons}</div>
                <div class="product-actions">
                    <button class="btn-whatsapp" onclick="quickOrder(this, '${product.name}', ${product.price})">
                        <i class="fab fa-whatsapp"></i> Order on WhatsApp
                    </button>
                    <button class="btn-cart" onclick="addToCart(this, '${product.name}', ${product.price})">
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                </div>
                <a href="product.html?id=${product.id}" class="quick-view-link">View Details →</a>
            </div>
        </div>
    `;
}

// ============================================
// RENDER SHOP PAGE
// ============================================
function renderShopPage() {
    const categories = ['masala', 'vegpickles', 'nonvegpickles', 'sweets'];

    categories.forEach(catId => {
        const section = document.getElementById(catId);
        if (!section) return;

        const catProducts = PRODUCTS.filter(p => p.catId === catId && p.available !== false);
        const grid = section.querySelector('.products-grid');
        const countEl = section.querySelector('.section-count');

        if (grid) {
            grid.innerHTML = catProducts.map(p => createProductCard(p)).join('');
        }
        if (countEl) {
            countEl.textContent = `${catProducts.length} items`;
        }
    });

    initScrollAnimations();
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async function() {
    loadCart();
    updateCartUI();

    // Load products from JSON before rendering any product-related UI
    const loaded = await loadProducts();
    if (!loaded) return;

    const path = window.location.pathname;

    if (path.includes('product.html')) {
        initProductPage();
    } else if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        renderShopPage();
    }

    // Close search on outside click
    document.addEventListener('click', function(e) {
        const searchContainer = document.querySelector('.search-container');
        const results = document.getElementById('searchResults');
        if (searchContainer && results && !searchContainer.contains(e.target)) {
            results.classList.remove('active');
        }
    });
});

// ============================================
// HIGHLIGHT ANIMATION
// ============================================
const highlightStyle = document.createElement('style');
highlightStyle.textContent = `
    @keyframes highlightProduct {
        0% { transform: scale(1); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        25% { transform: scale(1.02); box-shadow: 0 8px 24px rgba(244, 196, 48, 0.4); }
        50% { transform: scale(1.02); box-shadow: 0 8px 24px rgba(244, 196, 48, 0.4); }
        100% { transform: scale(1); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    }
`;
document.head.appendChild(highlightStyle);
