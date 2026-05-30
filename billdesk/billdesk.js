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

// Update Cart Summary
function updateCartSummary() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const showBillBtn = document.getElementById('showBillBtn');
    const itemCount = document.getElementById('itemCount');

    if (billItems.length === 0) {
        cartItems.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">No items added yet</p>';
        cartTotal.textContent = '₹0';
        showBillBtn.disabled = true;
        itemCount.textContent = '0';
        return;
    }

    let total = 0;
    cartItems.innerHTML = billItems.map((item, index) => {
        total += item.total;
        return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-details">${item.weight} × ${item.qty}</div>
                </div>
                <div class="cart-item-price">₹${item.total}</div>
                <button class="cart-item-remove" onclick="removeFromBill(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }).join('');

    cartTotal.textContent = '₹' + total;
    showBillBtn.disabled = false;
    itemCount.textContent = billItems.length;
}

// Show Bill Modal
function showBill() {
    const customerName = document.getElementById('customerName').value.trim() || 'Customer';
    const billModal = document.getElementById('billModal');
    const billCustomer = document.getElementById('billCustomer');
    const billItemsContainer = document.getElementById('billItems');
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
    let total = 0;
    billItemsContainer.innerHTML = billItems.map(item => {
        total += item.total;
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

    billTotalAmount.textContent = '₹' + total;

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
    const total = document.getElementById('billTotalAmount').textContent;
    const now = new Date().toLocaleDateString('en-IN');

    let message = `*Padmaja Home Foods* 🌶️\n`;
    message += `Date: ${now}\n`;
    message += `Customer: ${customerName}\n\n`;
    message += `*Bill Details:*\n`;

    billItems.forEach((item, index) => {
        const emoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'][index] || `${index + 1}.`;
        message += `${emoji} ${item.name} - ${item.weight} × ${item.qty} = ₹${item.total}\n`;
    });

    message += `\n*Total: ${total}*\n\n`;
    message += `Thank you for choosing Padmaja Home Foods! 🙏`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
}

// Close modal on outside click
document.addEventListener('click', function(e) {
    const modal = document.getElementById('billModal');
    if (e.target === modal) {
        closeBill();
    }
});

// Initialize on load
window.onload = init;
