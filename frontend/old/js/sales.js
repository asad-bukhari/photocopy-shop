// ============================================
// Sales Page Functionality
// ============================================

let currentBill = {
    is_guest: true,
    customer_id: null,
    items: [],
};

let products = [];
let customers = [];

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    await loadProducts();
    await loadCustomers();
    setupEventListeners();
});

// ============================================
// Load Data
// ============================================

async function loadProducts() {
    try {
        const data = await apiCall('/api/photocopy/products');
        products = data.products;
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Failed to load products', 'error');
    }
}

async function loadCustomers() {
    try {
        const data = await apiCall('/api/photocopy/customers');
        customers = data.customers;
        renderCustomerList();
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

// ============================================
// Render Functions
// ============================================

function renderProducts(category = 'all') {
    const grid = document.getElementById('productGrid');
    const filtered = category === 'all' ? products : products.filter(p => p.category.includes(category));

    grid.innerHTML = filtered.map(product => `
        <div class="product-item" onclick="addToBill(${product.id})">
            <div class="product-name">${product.name}</div>
            <div class="product-price">${formatCurrency(product.price)}</div>
        </div>
    `).join('');
}

function renderCustomerList(search = '') {
    const list = document.getElementById('customerList');
    const filtered = search
        ? customers.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
        : customers.slice(0, 10);

    list.innerHTML = filtered.map(customer => `
        <div class="customer-item" onclick="selectCustomer(${customer.id}, '${customer.name}')">
            <div>${customer.name}</div>
            ${customer.credit_balance > 0 ? `<small>Credit: ${formatCurrency(customer.credit_balance)}</small>` : ''}
        </div>
    `).join('');
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Customer type selection
    document.getElementById('guestCustomerBtn').addEventListener('click', function() {
        currentBill.is_guest = true;
        currentBill.customer_id = null;
        this.classList.add('active');
        document.getElementById('namedCustomerBtn').classList.remove('active');
        document.getElementById('namedCustomerSection').style.display = 'none';
        document.getElementById('selectedCustomerDisplay').style.display = 'none';
    });

    document.getElementById('namedCustomerBtn').addEventListener('click', function() {
        currentBill.is_guest = false;
        this.classList.add('active');
        document.getElementById('guestCustomerBtn').classList.remove('active');
        document.getElementById('namedCustomerSection').style.display = 'block';
    });

    // Customer search
    document.getElementById('customerSearch').addEventListener('input', function(e) {
        renderCustomerList(e.target.value);
    });

    // Category tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderProducts(this.dataset.category);
        });
    });

    // Payment buttons
    document.getElementById('paidCashBtn').addEventListener('click', () => createBill('paid', 'cash'));
    document.getElementById('paidOnlineBtn').addEventListener('click', () => createBill('paid', 'online'));
    document.getElementById('creditBtn').addEventListener('click', () => createBill('credit', null));

    // Add customer modal
    document.getElementById('addNewCustomerBtn').addEventListener('click', function() {
        document.getElementById('addCustomerModal').style.display = 'flex';
    });

    document.querySelector('#addCustomerModal .close').addEventListener('click', function() {
        document.getElementById('addCustomerModal').style.display = 'none';
    });

    document.getElementById('addCustomerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = document.getElementById('customerName').value;
        const phone = document.getElementById('customerPhone').value;

        try {
            const result = await apiCall('/api/photocopy/customers', 'POST', { name, phone });
            showNotification('Customer added successfully');
            document.getElementById('addCustomerModal').style.display = 'none';
            await loadCustomers();
            selectCustomer(result.customer.id, result.customer.name);
        } catch (error) {
            showNotification('Failed to add customer', 'error');
        }
    });
}

// ============================================
// Bill Functions
// ============================================

function selectCustomer(customerId, customerName) {
    currentBill.customer_id = customerId;
    currentBill.is_guest = false;

    document.getElementById('selectedCustomerDisplay').style.display = 'block';
    document.getElementById('selectedCustomerName').textContent = customerName;
}

function addToBill(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = currentBill.items.find(item => item.product_id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentBill.items.push({
            product_id: product.id,
            product_name: product.name,
            category: product.category,
            quantity: 1,
            unit_price: product.price,
            is_service: product.is_service,
        });
    }

    renderBill();
}

function removeFromBill(index) {
    currentBill.items.splice(index, 1);
    renderBill();
}

function changeQuantity(index, delta) {
    const item = currentBill.items[index];
    const newQuantity = item.quantity + delta;
    if (newQuantity > 0) {
        item.quantity = newQuantity;
        renderBill();
    }
}

function updateQuantity(index, quantity) {
    const newQuantity = parseFloat(quantity);
    if (newQuantity > 0) {
        currentBill.items[index].quantity = newQuantity;
        renderBill();
    }
}

function renderBill() {
    const container = document.getElementById('billItems');

    if (currentBill.items.length === 0) {
        container.innerHTML = '<p class="text-center text-gray">No items added yet</p>';
        updateTotals();
        return;
    }

    container.innerHTML = currentBill.items.map((item, index) => `
        <div class="bill-item">
            <div>
                <strong>${item.product_name}</strong><br>
                <small>${formatCurrency(item.unit_price)} ×</small>
                <div style="display: inline-flex; align-items: center; margin: 5px 0;">
                    <button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index}, -1)">−</button>
                    <input type="number"
                           value="${item.quantity}"
                           min="1"
                           style="width: 60px; padding: 2px 5px; margin: 0 5px; text-align: center;"
                           onchange="updateQuantity(${index}, this.value)">
                    <button class="btn btn-sm btn-secondary" onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </div>
            <div>
                <strong>${formatCurrency(item.quantity * item.unit_price)}</strong><br>
                <button class="btn btn-sm btn-danger" onclick="removeFromBill(${index})">Remove</button>
            </div>
        </div>
    `).join('');

    updateTotals();
}

function updateTotals() {
    const subtotal = currentBill.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    const tax = 0; // No tax for now
    const total = subtotal + tax;

    document.getElementById('subtotal').textContent = formatCurrency(subtotal);
    document.getElementById('tax').textContent = formatCurrency(tax);
    document.getElementById('total').textContent = formatCurrency(total);
}

async function createBill(paymentStatus, paymentMethod) {
    if (currentBill.items.length === 0) {
        showNotification('Please add items to the bill', 'error');
        return;
    }

    if (!currentBill.is_guest && !currentBill.customer_id && paymentStatus === 'credit') {
        showNotification('Please select a customer for credit sales', 'error');
        return;
    }

    try {
        const billData = {
            is_guest: currentBill.is_guest,
            customer_id: currentBill.customer_id,
            payment_status: paymentStatus,
            payment_method: paymentMethod,
            items: currentBill.items,
        };

        const result = await apiCall('/api/photocopy/bills', 'POST', billData);

        showNotification(`Bill created: ${result.bill.bill_number}`);

        // Reset bill
        currentBill = {
            is_guest: true,
            customer_id: null,
            items: [],
        };
        renderBill();

        // Print bill if checkbox is checked
        if (document.getElementById('printBill').checked) {
            printBill(result.bill.id);
        }

    } catch (error) {
        console.error('Error creating bill:', error);
        showNotification('Failed to create bill', 'error');
    }
}

async function printBill(billId) {
    try {
        // Fetch bill details from API
        const bill = await apiCall(`/api/photocopy/bills/${billId}`);

        // Prepare bill data for template
        const billData = {
            bill_number: bill.bill_number,
            date: formatDate(new Date(bill.bill_date)),
            customer: bill.customer_name || 'Guest',
            items: bill.items.map(item => ({
                name: item.product_name,
                qty: item.quantity,
                price: item.unit_price,
                total: item.subtotal
            })),
            subtotal: bill.subtotal,
            tax: bill.tax,
            total: bill.total,
            payment_status: bill.payment_status,
            payment_method: bill.payment_method
        };

        // Encode data and open print window
        const encodedData = encodeURIComponent(JSON.stringify(billData));
        const printWindow = window.open(
            `/templates/bill_a5.html?data=${encodedData}`,
            '_blank',
            'width=800,height=600'
        );

        if (printWindow) {
            printWindow.onload = function() {
                setTimeout(() => {
                    printWindow.print();
                }, 500);
            };
        } else {
            showNotification('Please allow popups to print bills', 'error');
        }

    } catch (error) {
        console.error('Error printing bill:', error);
        showNotification('Failed to print bill', 'error');
    }
}
