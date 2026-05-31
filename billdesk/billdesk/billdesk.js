// Product Data
const PRODUCTS = {
    "Masala & Karam": [
        {name: "Kura Karam", price: 549, weights: [100, 250, 500, 1000]},
        {name: "Garam Masala", price: 799, weights: [100, 250, 500, 1000]},
        {name: "Sambar Powder", price: 499, weights: [100, 250, 500, 1000]},
        {name: "Turmeric Powder", price: 499, weights: [100, 250, 500, 1000]},
        {name: "Pachi Karam", price: 599, weights: [100, 250, 500, 1000]},
        {name: "Munagaku Karam", price: 639, weights: [100, 250, 500, 1000]},
        {name: "Karivepaku Karam", price: 599, weights: [100, 250, 500, 1000]},
        {name: "Nalla Karam", price: 599, weights: [100, 250, 500, 1000]},
    ],
    "Veg Pickles": [
        {name: "Tomato Pickle", price: 499, weights: [250, 500, 1000]},
        {name: "Usirikay Pickle", price: 499, weights: [250, 500, 1000]},
        {name: "Gongura Pickle", price: 499, weights: [250, 500, 1000]},
        {name: "Avakaya Pickle", price: 499, weights: [250, 500, 1000]},
        {name: "Usirikay Thokku", price: 499, weights: [250, 500, 1000]},
    ],
    "Non-Veg Pickles": [
        {name: "Chicken Bone Pickle", price: 1199, weights: [250, 500, 1000]},
        {name: "Chicken Boneless Pickle", price: 1399, weights: [250, 500, 1000]},
        {name: "Prawns Pickle", price: 1999, weights: [250, 500, 1000]},
    ],
    "Sweets": [
        {name: "Sunnundalu Sugar", price: 799, weights: [250, 500, 1000]},
        {name: "Nuvvula Laddu", price: 599, weights: [250, 500, 1000]},
        {name: "Ravva Laddu", price: 599, weights: [250, 500, 1000]},
    ]
};

const CATEGORY_ICONS = {
    "Masala & Karam": "fa-mortar-pestle",
    "Veg Pickles": "fa-carrot",
    "Non-Veg Pickles": "fa-drumstick-bite",
    "Sweets": "fa-cookie"
};

const CATEGORY_EMOJIS = {
    "Masala & Karam": "🌶️",
    "Veg Pickles": "🥒",
    "Non-Veg Pickles": "🍗",
    "Sweets": "🍬"
};

let billItems = [];

// Initialize
function init() {
    renderProducts();
    updateCartSummary();
}

// Render Products
function renderProducts() {
    const container = document.getElementById('productsContainer');
    let html = '';

    for (const [category, items] of Object.entries(PRODUCTS)) {
        html += `
            <div class="category-section">
                <div class="category-header">
                    <i class="fas ${CATEGORY_ICONS[category]}"></i>
                    ${category}
                </div>
                <div class="product-list">
        `;

        items.forEach((product, index) => {
            const productId = `${category}-${index}`;
            html += `
                <div class="product-item" data-product="${productId}">
                    <div class="product-name">${product.name}</div>
                    <select class="weight-select" id="weight-${productId}">
                        ${product.weights.map(w => {
                            const price = Math.round((product.price * w) / 1000);
                            const label = w >= 1000 ? '1Kg' : w + 'g';
                            return `<option value="${w}" data-price="${price}">${label} - ₹${price}</option>`;
                        }).join('')}
                    </select>
                    <input type="number" class="qty-input" id="qty-${productId}" value="1" min="1" max="10">
                    <button class="add-btn" onclick="addToBill('${productId}', '${product.name}', ${product.price})">
                        <i class="fas fa-plus"></i> Add
                    </button>
                </div>
            `;
        });

        html += '</div></div>';
    }

    container.innerHTML = html;
}

// Calculate Price for Weight
function getPrice(productId, basePrice) {
    const weightSelect = document.getElementById(`weight-${productId}`);
    const weight = parseInt(weightSelect.value);
    return Math.round((basePrice * weight) / 1000);
}

// Get Weight Label
function getWeightLabel(productId) {
    const weightSelect = document.getElementById(`weight-${productId}`);
    const weight = parseInt(weightSelect.value);
    return weight >= 1000 ? '1Kg' : weight + 'g';
}

// Get Category for Product
function getCategory(productName) {
    for (const [category, items] of Object.entries(PRODUCTS)) {
        if (items.some(p => p.name === productName)) {
            return category;
        }
    }
    return "Products";
}

// Add to Bill
function addToBill(productId, productName, basePrice) {
    const qtyInput = document.getElementById(`qty-${productId}`);
    const qty = parseInt(qtyInput.value) || 1;
    const weightLabel = getWeightLabel(productId);
    const price = getPrice(productId, basePrice);
    const total = price * qty;

    // Check if same product with same weight already exists
    const existingIndex = billItems.findIndex(item => 
        item.name === productName && item.weight === weightLabel
    );

    if (existingIndex >= 0) {
        billItems[existingIndex].qty += qty;
        billItems[existingIndex].total = billItems[existingIndex].price * billItems[existingIndex].qty;
    } else {
        billItems.push({
            name: productName,
            weight: weightLabel,
            price: price,
            qty: qty,
            total: total
        });
    }

    updateCartSummary();

    // Visual feedback
    const btn = document.querySelector(`[data-product="${productId}"] .add-btn`);
    const originalHTML = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-check"></i> Added';
    btn.style.background = '#1DA851';
    setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.style.background = '';
    }, 800);
}

// Remove from Bill
function removeFromBill(index) {
    billItems.splice(index, 1);
    updateCartSummary();
}

// Update Quantity in Sheet
function updateSheetQty(index, change) {
    billItems[index].qty += change;
    if (billItems[index].qty <= 0) {
        billItems.splice(index, 1);
    } else {
        billItems[index].total = billItems[index].price * billItems[index].qty;
    }
    updateCartSummary();
}

// Update Cart Summary (Sticky Bar + Sheet)
function updateCartSummary() {
    const deliveryCharge = parseInt(document.getElementById('deliveryCharge').value) || 0;
    const totalQty = billItems.reduce((sum, item) => sum + item.qty, 0);
    const productsTotal = billItems.reduce((sum, item) => sum + item.total, 0);
    const grandTotal = productsTotal + deliveryCharge;

    // Update Sticky Bar
    const stickyBar = document.getElementById('stickyCartBar');
    const stickyBadge = document.getElementById('stickyCartBadge');
    const stickyItems = document.getElementById('stickyCartItems');
    const stickyTotal = document.getElementById('stickyCartTotal');

    if (totalQty > 0) {
        stickyBar.classList.add('active');
        stickyBadge.textContent = totalQty;
        stickyItems.textContent = totalQty === 1 ? '1 item' : `${totalQty} items`;
        stickyTotal.textContent = '₹' + grandTotal;
    } else {
        stickyBar.classList.remove('active');
    }

    // Update Sheet
    const sheetItems = document.getElementById('cartSheetItems');
    const sheetEmpty = document.getElementById('cartSheetEmpty');
    const sheetProductsTotal = document.getElementById('sheetProductsTotal');
    const sheetDeliveryCharge = document.getElementById('sheetDeliveryCharge');
    const sheetGrandTotal = document.getElementById('sheetGrandTotal');
    const sheetShowBillBtn = document.getElementById('sheetShowBillBtn');

    sheetProductsTotal.textContent = '₹' + productsTotal;
    sheetDeliveryCharge.textContent = '₹' + deliveryCharge;
    sheetGrandTotal.textContent = '₹' + grandTotal;

    if (billItems.length === 0) {
        sheetItems.style.display = 'none';
        sheetEmpty.classList.add('active');
        sheetShowBillBtn.disabled = true;
    } else {
        sheetItems.style.display = 'block';
        sheetEmpty.classList.remove('active');
        sheetShowBillBtn.disabled = false;

        sheetItems.innerHTML = billItems.map((item, index) => {
            const category = getCategory(item.name);
            const emoji = CATEGORY_EMOJIS[category] || '📦';
            return `
                <div class="sheet-item">
                    <div class="sheet-item-image">${emoji}</div>
                    <div class="sheet-item-details">
                        <div class="sheet-item-name">${item.name}</div>
                        <div class="sheet-item-meta">${item.weight} @ ₹${item.price}</div>
                    </div>
                    <div class="sheet-item-qty-control">
                        <button onclick="updateSheetQty(${index}, -1)" aria-label="Decrease quantity">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.qty}</span>
                        <button onclick="updateSheetQty(${index}, 1)" aria-label="Increase quantity">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="sheet-item-price">₹${item.total}</div>
                    <button class="sheet-item-remove" onclick="removeFromBill(${index})" aria-label="Remove item">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        }).join('');
    }
}

// Cart Sheet Controls
function openCartSheet() {
    document.getElementById('cartSheetOverlay').classList.add('active');
    document.getElementById('cartSheet').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeCartSheet() {
    document.getElementById('cartSheetOverlay').classList.remove('active');
    document.getElementById('cartSheet').classList.remove('active');
    document.body.style.overflow = '';
}

// Show Bill Modal
function showBill() {
    closeCartSheet();
    const customerName = document.getElementById('customerName').value.trim() || 'Customer';
    const deliveryCharge = parseInt(document.getElementById('deliveryCharge').value) || 0;
    const billModal = document.getElementById('billModal');
    const billCustomer = document.getElementById('billCustomer');
    const billItemsContainer = document.getElementById('billItems');
    const billProductsTotal = document.getElementById('billProductsTotal');
    const billDeliveryCharge = document.getElementById('billDeliveryCharge');
    const billTotalAmount = document.getElementById('billTotalAmount');
    const billDate = document.getElementById('billDate');

    // Set date
    const now = new Date();
    billDate.textContent = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Set customer
    billCustomer.innerHTML = `<p>Customer: <span>${customerName}</span></p>`;

    // Render bill items
    let productsTotal = 0;
    billItemsContainer.innerHTML = billItems.map(item => {
        productsTotal += item.total;
        return `
            <div class="bill-item">
                <div class="bill-item-name">
                    <strong>${item.name}</strong>
                    <span>${item.weight} × ${item.qty} @ ₹${item.price}</span>
                </div>
                <div class="bill-item-price">₹${item.total}</div>
            </div>
        `;
    }).join('');

    const grandTotal = productsTotal + deliveryCharge;
    billProductsTotal.textContent = '₹' + productsTotal;
    billDeliveryCharge.textContent = '₹' + deliveryCharge;
    billTotalAmount.textContent = '₹' + grandTotal;

    billModal.classList.add('active');
}

// Close Bill Modal
function closeBill() {
    document.getElementById('billModal').classList.remove('active');
}

// Print Bill
function printBill() {
    window.print();
}

// Share Bill via WhatsApp
function shareBill() {
    const customerName = document.getElementById('customerName').value.trim() || 'Customer';
    const deliveryCharge = parseInt(document.getElementById('deliveryCharge').value) || 0;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    let productsTotal = 0;
    billItems.forEach(function(item) {
        productsTotal += item.total;
    });
    const grandTotal = productsTotal + deliveryCharge;

    let message = 'PADMAJA HOME FOODS\n';
    message += '==================\n\n';
    message += 'Date: ' + dateStr + '\n';
    message += 'Customer: ' + customerName + '\n\n';
    message += 'BILL DETAILS\n';
    message += '------------\n';

    billItems.forEach(function(item, index) {
        const num = (index + 1) + '.';
        message += num + ' ' + item.name + ' (' + item.weight + ') x' + item.qty + ' = Rs.' + item.total + '\n';
    });

    message += '\n------------\n';
    message += 'Products Total: Rs.' + productsTotal + '\n';
    message += 'Delivery Charge: Rs.' + deliveryCharge + '\n';
    message += 'Grand Total: Rs.' + grandTotal + '\n';
    message += '==================\n\n';
    message += 'Thank you for choosing Padmaja Home Foods.\n\n';
    message += 'Phone: +91 93813 11511\n';
    message += 'Email: contactpadmajahomefoods@gmail.com';

    const encodedMessage = encodeURIComponent(message);
    window.open('https://wa.me/919381311511?text=' + encodedMessage, '_blank');
}

// Initialize on load
document.addEventListener('DOMContentLoaded', function() {
    init();
    const deliveryInput = document.getElementById('deliveryCharge');
    if (deliveryInput) {
        deliveryInput.addEventListener('input', updateCartSummary);
    }
});
