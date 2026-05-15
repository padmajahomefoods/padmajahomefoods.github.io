// Cart State
let cart = [];

// ==================== LOCALSTORAGE FUNCTIONS ====================

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('padmaja_cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCart() {
    const saved = localStorage.getItem('padmaja_cart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
    }
}

// Clear cart from localStorage
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

// Universal navigation function
function navigateTo(targetId) {
    // If inside a product section, close it first
    const allProducts = document.querySelectorAll('.products-section');
    const isInProductSection = Array.from(allProducts).some(section => {
        return section.classList.contains('active');
    });

    if (isInProductSection && (targetId === 'home' || targetId === 'categories')) {
        // Hide all product sections
        allProducts.forEach(section => {
            section.classList.remove('active');
        });
        // Show categories
        document.getElementById('categories').style.display = 'block';
    }

    // Scroll to target
    const target = document.getElementById(targetId);
    if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    return false;
}

// Show category products
function showCategory(categoryId) {
    document.getElementById('categories').style.display = 'none';

    const allProducts = document.querySelectorAll('.products-section');
    allProducts.forEach(section => {
        section.classList.remove('active');
    });

    const selected = document.getElementById(categoryId);
    if (selected) {
        selected.classList.add('active');
        selected.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Show categories again
function showCategories() {
    const allProducts = document.querySelectorAll('.products-section');
    allProducts.forEach(section => {
        section.classList.remove('active');
    });

    document.getElementById('categories').style.display = 'block';
    document.getElementById('categories').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Mobile menu
function openMobileMenu() {
    document.getElementById('mobileOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    document.getElementById('mobileOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

// WEIGHT SELECTION FUNCTION
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

// ORDER FUNCTION WITH WEIGHT
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

// ==================== CART FUNCTIONALITY ====================

// Add to Cart
function addToCart(btn, productName, basePrice) {
    const card = btn.closest('.product-card');
    const activeBtn = card.querySelector('.weight-btn.active');
    const weight = activeBtn ? activeBtn.textContent : '1Kg';

    let weightInGrams = 1000;
    if (weight === '100g') weightInGrams = 100;
    else if (weight === '250g') weightInGrams = 250;
    else if (weight === '500g') weightInGrams = 500;

    const finalPrice = Math.round((basePrice * weightInGrams) / 1000);

    // Check if item already exists in cart
    const existingItem = cart.find(item => item.name === productName && item.weight === weight);

    if (existingItem) {
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
    saveCart(); // Save to localStorage

    // Play tick sound
    const tickSound = document.getElementById('tickSound');
    if (tickSound) {
        tickSound.currentTime = 0;
        tickSound.volume = 0.4;
        const playPromise = tickSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Auto-play was prevented, try again after user interaction
                console.log('Sound play prevented:', error);
            });
        }
    }

    // Show added animation - green glow on button
    const originalText = btn.innerHTML;
    const originalBg = btn.style.background;
    btn.innerHTML = '<i class="fas fa-check"></i> Added!';
    btn.classList.add('added-glow');

    // Bounce cart icon
    const cartIcon = document.querySelector('.cart-icon');
    if (cartIcon) {
        cartIcon.classList.add('cart-bounce');
        setTimeout(() => {
            cartIcon.classList.remove('cart-bounce');
        }, 600);
    }

    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('added-glow');
    }, 1000);
}

// Update Cart UI
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartBadge = document.getElementById('cartBadge');
    const cartTotal = document.getElementById('cartTotal');
    const stickyCartCount = document.getElementById('stickyCartCount');
    const stickyCartTotal = document.getElementById('stickyCartTotal');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update badges
    cartBadge.textContent = totalItems;
    stickyCartCount.textContent = totalItems;
    cartTotal.textContent = `₹${totalPrice}`;
    stickyCartTotal.textContent = `₹${totalPrice}`;

    // Show/hide sticky cart button
    const stickyCartBtn = document.getElementById('stickyCartBtn');
    if (totalItems > 0) {
        stickyCartBtn.classList.add('active');
    } else {
        stickyCartBtn.classList.remove('active');
    }

    // Render cart items
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

// Update Quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCartUI();
    saveCart(); // Save to localStorage
}

// Remove from Cart
function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartUI();
    saveCart(); // Save to localStorage
}

// Toggle Cart
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

// Place Order on WhatsApp
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

    // Clear cart after order
    cart = [];
    updateCartUI();
    clearSavedCart(); // Clear from localStorage
    toggleCart();
}

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.category-card').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.6s ease ${index * 0.1}s`;
    observer.observe(el);
});

// DELIVERY NOTICE - Hide when reaching Follow Us section
const deliveryNotice = document.querySelector('.delivery-notice');
const followUsSection = document.querySelector('.social-section');
const footerSection = document.querySelector('footer');

if (deliveryNotice && followUsSection) {
    window.addEventListener('scroll', function() {
        const followUsTop = followUsSection.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        // Hide notice when Follow Us section is visible (within 100px from bottom)
        if (followUsTop < windowHeight - 100) {
            deliveryNotice.style.opacity = '0';
            deliveryNotice.style.pointerEvents = 'none';
        } else {
            deliveryNotice.style.opacity = '1';
            deliveryNotice.style.pointerEvents = 'auto';
        }
    });
}

// ==================== SEARCH FUNCTIONALITY ====================

// Product database for search
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
    { name: 'Ravva Laddu', category: 'Sweets', price: 599, weights: ['250g', '500g', '1Kg'] }
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
    // Clear search
    clearSearch();

    // Navigate to category
    showCategory(categoryId);

    // Scroll to product after a short delay
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
    }, 600);
}

// Load cart from localStorage on page load
loadCart();
updateCartUI();