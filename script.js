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