// Cart State
let cart = [];

// ==================== LOCALSTORAGE FUNCTIONS ====================
function saveCart() {
    const data = { version: 1, items: cart };
    localStorage.setItem('padmaja_cart', JSON.stringify(data));
}

function loadCart() {
    const saved = localStorage.getItem('padmaja_cart');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            if (data.version === 1) {
                cart = data.items || [];
            } else {
                cart = [];
            }
        } catch (e) {
            cart = [];
        }
    }
}

function clearSavedCart() {
    localStorage.removeItem('padmaja_cart');
}

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const navbar = document.getElementById('navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu
function openMobileMenu() {
    document.getElementById('mobileOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    document.getElementById('mobileOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// ==================== CART SIDEBAR ====================
function toggleCart(forceOpen = null) {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');

    const isOpen = cartSidebar.classList.contains('active');

    if (forceOpen === true || !isOpen) {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ==================== CART FUNCTIONALITY ====================
function addToCart(btn, productName, basePrice) {
    const card = btn.closest('.product-card');
    const activeBtn = card.querySelector('.weight-btn.active');
    const weight = activeBtn ? activeBtn.textContent : '1Kg';

    let weightInGrams = 1000;
    if (weight === '100g') weightInGrams = 100;
    else if (weight === '250g') weightInGrams = 250;
    else if (weight === '500g') weightInGrams = 500;

    const finalPrice = Math.round((basePrice * weightInGrams) / 1000);

    // Check if item already exists
    const existingItem = cart.find(item => item.name === productName && item.weight === weight);

    if (existingItem) {
        if (existingItem.quantity >= 10) {
            alert('Maximum 10 items allowed per product');
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

    // Play tick sound using Web Audio API
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) {}

    // Show added animation
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
    btn.classList.add('added-glow');

    // Bounce cart icon and re-trigger badge animation
    const cartIcon = document.querySelector('.cart-icon');
    const badge = document.getElementById('cartBadge');
    if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => cartIcon.classList.remove('cart-bounce'), 600);
    }
    if (badge) {
        badge.style.animation = 'none';
        badge.offsetHeight; // trigger reflow
        badge.style.animation = 'bounce 0.5s ease';
    }

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('added-glow');
    }, 1000);
}

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotal = document.getElementById('cartTotal');
    const stickyCartCount = document.getElementById('stickyCartCount');
    const stickyCartTotal = document.getElementById('stickyCartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cartBadge) cartBadge.textContent = totalItems;
    if (stickyCartCount) stickyCartCount.textContent = totalItems;
    if (cartTotal) cartTotal.textContent = '₹' + totalPrice;
    if (stickyCartTotal) stickyCartTotal.textContent = '₹' + totalPrice;

    const stickyCartBtn = document.getElementById('stickyCartBtn');
    if (stickyCartBtn) {
        if (totalItems > 0) {
            stickyCartBtn.classList.add('active');
        } else {
            stickyCartBtn.classList.remove('active');
        }
    }

    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty-icon">🌶️</div>
                <h4>Your spice box is empty</h4>
                <p>Add authentic Guntur flavors</p>
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
                    <button onclick="updateQuantity(${index}, -1)"><i class="fas fa-minus"></i></button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${index}, 1)"><i class="fas fa-plus"></i></button>
                </div>
                <div class="cart-item-total">₹${item.price * item.quantity}</div>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
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
}

function placeOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty! Add some items first.');
        return;
    }

    let message = 'Hello Padmaja Home Foods 👋\n\nI want to order:\n\n';

    cart.forEach((item, index) => {
        const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index] || `${index + 1}.`;
        message += `${emoji} ${item.name} - ${item.weight} × ${item.quantity} = ₹${item.price * item.quantity}\n`;
    });

    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `\nTotal: ₹${totalPrice}\n\nName:\nAddress:\nPincode:`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/919381311511?text=${encodedMessage}`, '_blank');

    cart = [];
    updateCartUI();
    clearSavedCart();
    toggleCart();
}

// ==================== WEIGHT SELECTION ====================
function selectWeight(btn, weight) {
    const card = btn.closest('.product-card');

    const allBtns = card.querySelectorAll('.weight-btn');
    allBtns.forEach(b => b.classList.remove('active'));

    btn.classList.add('active');

    const basePrice = parseInt(card.getAttribute('data-base-price'));
    const priceDisplay = card.querySelector('.product-price');
    const calculatedPrice = Math.round((basePrice * weight) / 1000);

    let weightText = weight >= 1000 ? '1Kg' : weight + 'g';
    priceDisplay.innerHTML = `₹${calculatedPrice} <span>/ ${weightText}</span>`;
}

// ==================== ORDER FUNCTION ====================
function orderProduct(btn, productName, basePrice) {
    const card = btn.closest('.product-card');
    const activeBtn = card.querySelector('.weight-btn.active');
    const weight = activeBtn ? activeBtn.textContent : '1Kg';

    let weightInGrams = 1000;
    if (weight === '100g') weightInGrams = 100;
    else if (weight === '250g') weightInGrams = 250;
    else if (weight === '500g') weightInGrams = 500;

    const finalPrice = Math.round((basePrice * weightInGrams) / 1000);

    const message = `Hi! I want to order ${productName} - ${weight} (₹${finalPrice})`;
    const encodedMessage = encodeURIComponent(message);

    window.open(`https://wa.me/919381311511?text=${encodedMessage}`, '_blank');

    return false;
}

// ==================== CATEGORY FILTER (Shop Page) ====================
function filterCategory(category) {
    const allSections = document.querySelectorAll('.products-section');
    const allBtns = document.querySelectorAll('.filter-btn');

    allBtns.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (category === 'all') {
        allSections.forEach(section => {
            section.classList.add('active');
        });
    } else {
        allSections.forEach(section => {
            if (section.getAttribute('data-category') === category) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        });
    }
}

// ==================== SEARCH FUNCTIONALITY ====================
const allProducts = [
    { name: 'Kura Karam', category: 'Masala & Karam', price: 549, weights: ['100g', '250g', '500g', '1Kg'] },
    { name: 'Garam Masala', category: 'Masala & Karam', price: 799, weights: ['100g', '250g', '500g', '1Kg'] },
    { name: 'Sambar Powder', category: 'Masala & Karam', price: 499, weights: ['100g', '250g', '500g', '1Kg'] },
    { name: 'Turmeric Powder', category: 'Masala & Karam', price: 499, weights: ['100g', '250g', '500g', '1Kg'] },
    { name: 'Pachi Karam', category: 'Masala & Karam', price: 599, weights: ['100g', '250g', '500g', '1Kg'] },
    { name: 'Munagaku Karam', category: 'Masala & Karam', price: 639, weights: ['100g', '250g', '500g', '1Kg'] },
    { name: 'Karivepaku Karam', category: 'Masala & Karam', price: 599, weights: ['100g', '250g', '500g', '1Kg'] },
    { name: 'Tomato Pickle', category: 'Veg Pickles', price: 499, weights: ['250g', '500g', '1Kg'] },
    { name: 'Usirikay Pickle', category: 'Veg Pickles', price: 499, weights: ['250g', '500g', '1Kg'] },
    { name: 'Gongura Pickle', category: 'Veg Pickles', price: 499, weights: ['250g', '500g', '1Kg'] },
    { name: 'Avakaya Pickle', category: 'Veg Pickles', price: 499, weights: ['250g', '500g', '1Kg'] },
    { name: 'Usirikay Thokku', category: 'Veg Pickles', price: 499, weights: ['250g', '500g', '1Kg'] },
    { name: 'Chicken Bone Pickle', category: 'Non-Veg Pickles', price: 1199, weights: ['250g', '500g', '1Kg'] },
    { name: 'Chicken Boneless Pickle', category: 'Non-Veg Pickles', price: 1399, weights: ['250g', '500g', '1Kg'] },
    { name: 'Prawns Pickle', category: 'Non-Veg Pickles', price: 1999, weights: ['250g', '500g', '1Kg'] },
    { name: 'Sunnundalu Sugar', category: 'Sweets', price: 799, weights: ['250g', '500g', '1Kg'] },
    { name: 'Nuvvula Laddu', category: 'Sweets', price: 599, weights: ['250g', '500g', '1Kg'] },
    { name: 'Ravva Laddu', category: 'Sweets', price: 599, weights: ['250g', '500g', '1Kg'] },
    { name: 'Nalla Karam', category: 'Masala & Karam', price: 599, weights: ['100g', '250g', '500g', '1Kg'] }
];

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

    const matches = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );

    if (matches.length === 0) {
        results.innerHTML = '<div class="search-no-results">No products found 😔</div>';
        results.classList.add('active');
        return;
    }

    results.innerHTML = matches.map(p => {
        const categoryMap = {
            'Masala & Karam': 'masala',
            'Veg Pickles': 'vegpickles',
            'Non-Veg Pickles': 'nonvegpickles',
            'Sweets': 'sweets'
        };
        const catId = categoryMap[p.category];
        return `
            <div class="search-result-item" onclick="goToProduct('${catId}', '${p.name}')">
                <div class="search-result-name">${p.name}</div>
                <div class="search-result-category">${p.category}</div>
            </div>
        `;
    }).join('');

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

function goToProduct(categoryId, productName) {
    clearSearch();

    // Hide all sections first
    document.querySelectorAll('.products-section').forEach(s => s.classList.remove('active'));

    // Show target section
    const targetSection = document.getElementById(categoryId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase().includes(categoryId.replace('vegpickles', 'veg').replace('nonvegpickles', 'non-veg'))) {
            btn.classList.add('active');
        }
    });

    // Scroll to product
    setTimeout(() => {
        const cards = document.querySelectorAll(`#${categoryId} .product-card`);
        cards.forEach(card => {
            if (card.getAttribute('data-product') === productName) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.style.animation = 'highlightProduct 1s ease';
                setTimeout(() => {
                    card.style.animation = '';
                }, 1000);
            }
        });
    }, 300);
}

// ==================== SCROLL ANIMATIONS ====================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.category-card, .offer-card, .review-card, .feature').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(el);
});

// ==================== DELIVERY NOTICE HIDE ====================
const deliveryNotice = document.querySelector('.delivery-notice');
const socialSection = document.querySelector('.social-section');

if (deliveryNotice && socialSection) {
    window.addEventListener('scroll', function() {
        const socialTop = socialSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (socialTop < windowHeight - 100) {
            deliveryNotice.style.opacity = '0';
            deliveryNotice.style.pointerEvents = 'none';
        } else {
            deliveryNotice.style.opacity = '1';
            deliveryNotice.style.pointerEvents = 'auto';
        }
    });
}

// ==================== INIT ====================
loadCart();
updateCartUI();

// On shop page load, show all product sections by default
// (since "All" filter is the default)
if (document.querySelector('.category-filter')) {
    document.querySelectorAll('.products-section').forEach(section => {
        section.classList.add('active');
    });
}

// Check for URL hash on shop page
if (window.location.hash) {
    const hash = window.location.hash.substring(1);

    // First check if it's a product ID
    const productCard = document.getElementById(hash);
    if (productCard && productCard.classList.contains('product-card')) {
        setTimeout(() => {
            scrollToProduct(hash);
        }, 500);
    } else {
        // Fallback: check if it's a category section
        const section = document.getElementById(hash);
        if (section) {
            setTimeout(() => {
                section.classList.add('active');
                section.scrollIntoView({ behavior: 'smooth' });
            }, 500);
        }
    }
}

// ==================== SHARE PRODUCT ====================
function shareProduct(btn) {
    const card = btn.closest('.product-card');
    if (!card) return;

    const productName = card.getAttribute('data-product');
    const productId = card.id;
    const activeBtn = card.querySelector('.weight-btn.active');
    const weight = activeBtn ? activeBtn.textContent : '250g';

    const priceEl = card.querySelector('.product-price');
    const priceText = priceEl ? priceEl.textContent.trim() : '';

    const shareUrl = window.location.href.split('#')[0] + '#' + productId;
    const shareText = `Check out ${productName} (${weight}) from Padmaja Home Foods — ${priceText}\n\n${shareUrl}`;

    // Auto-scroll to the product with highlight animation
    scrollToProduct(productId);

    // Try native Web Share API first (mobile + supported desktop)
    if (navigator.share) {
        navigator.share({
            title: `${productName} | Padmaja Home Foods`,
            text: shareText
            // Note: no separate 'url' field — URL is already inside shareText
            // This prevents duplicate links in WhatsApp and other apps
        }).catch(() => {
            // User cancelled or error — silent fail
        });
    } else {
        // Fallback: copy to clipboard + show toast
        copyToClipboard(shareText);
        showShareToast(`Link copied for ${productName}!`);
    }
}

function scrollToProduct(productId) {
    const card = document.getElementById(productId);
    if (!card) return;

    // Show the parent section if hidden by filter
    const section = card.closest('.products-section');
    if (section) {
        document.querySelectorAll('.products-section').forEach(s => s.classList.add('active'));
        document.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.textContent.trim() === 'All') btn.classList.add('active');
            else btn.classList.remove('active');
        });
    }

    // Scroll to the card
    setTimeout(() => {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.animation = 'highlightProduct 1.5s ease';
        setTimeout(() => { card.style.animation = ''; }, 1500);
    }, 100);
}

function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
    } else {
        // Fallback for older browsers
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

function showShareToast(message) {
    let toast = document.querySelector('.share-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.innerHTML = '<i class="fas fa-check-circle"></i> <span class="toast-msg"></span>';
        document.body.appendChild(toast);
    }
    toast.querySelector('.toast-msg').textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

