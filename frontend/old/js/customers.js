// ============================================
// Customer Management
// ============================================

let customers = [];

// ============================================
// Initialize
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    await loadCustomers();
    setupEventListeners();
});

// ============================================
// Load Data
// ============================================

async function loadCustomers() {
    try {
        const data = await apiCall('/api/photocopy/customers');
        customers = data.customers;
        renderCustomers();
    } catch (error) {
        console.error('Error loading customers:', error);
        showNotification('Failed to load customers', 'error');
    }
}

// ============================================
// Render Functions
// ============================================

function renderCustomers(search = '') {
    const list = document.getElementById('customerList');
    const filtered = search
        ? customers.filter(c =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            (c.phone && c.phone.includes(search))
          )
        : customers;

    if (filtered.length === 0) {
        list.innerHTML = '<p class="text-center text-gray">No customers found</p>';
        return;
    }

    list.innerHTML = filtered.map(customer => `
        <div class="customer-card">
            <div class="customer-card-header">
                <h3>${customer.name}</h3>
                <p>${customer.phone || 'No phone number'}</p>
                ${customer.unpaid_bills > 0 ? `<p>${customer.unpaid_bills} unpaid bills</p>` : ''}
            </div>
            <div class="customer-balance">
                <div class="balance-label">Balance</div>
                <div class="balance-value ${customer.credit_balance > 0 ? 'balance-negative' : 'balance-positive'}">
                    ${formatCurrency(customer.credit_balance)}
                </div>
            </div>
            <div class="customer-actions">
                <button class="btn btn-sm btn-success" onclick="recordPayment(${customer.id}, '${customer.name}', ${customer.credit_balance})">
                    Record Payment
                </button>
                <button class="btn btn-sm btn-secondary" onclick="viewBills(${customer.id}, '${customer.name}')">
                    View Bills
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// Event Listeners
// ============================================

function setupEventListeners() {
    // Customer search
    document.getElementById('customerSearch').addEventListener('input', function(e) {
        renderCustomers(e.target.value);
    });

    // Add customer button
    document.getElementById('addCustomerBtn').addEventListener('click', function() {
        document.getElementById('addCustomerModal').style.display = 'flex';
    });

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });

    // Add customer form
    document.getElementById('addCustomerForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('customerName').value;
        const phone = document.getElementById('customerPhone').value;

        try {
            const result = await apiCall('/api/photocopy/customers', 'POST', { name, phone });
            showNotification('Customer added successfully');
            document.getElementById('addCustomerModal').style.display = 'none';
            document.getElementById('addCustomerForm').reset();
            await loadCustomers();
        } catch (error) {
            console.error('Error adding customer:', error);
            showNotification('Failed to add customer', 'error');
        }
    });

    // Payment form
    document.getElementById('paymentForm').addEventListener('submit', async function(e) {
        e.preventDefault();

        const customerId = parseInt(document.getElementById('paymentCustomerId').value);
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const method = document.getElementById('paymentMethod').value;

        try {
            await apiCall('/api/photocopy/payments', 'POST', {
                customer_id: customerId,
                amount: amount,
                payment_method: method,
            });

            showNotification('Payment recorded successfully');
            document.getElementById('paymentModal').style.display = 'none';
            await loadCustomers();
        } catch (error) {
            console.error('Error recording payment:', error);
            showNotification('Failed to record payment', 'error');
        }
    });
}

// ============================================
// Actions
// ============================================

function recordPayment(customerId, customerName, balance) {
    document.getElementById('paymentCustomerId').value = customerId;
    document.getElementById('paymentCustomerName').textContent = customerName;
    document.getElementById('paymentCustomerBalance').textContent = formatCurrency(balance);
    document.getElementById('paymentAmount').value = balance;
    document.getElementById('paymentModal').style.display = 'flex';
}

function viewBills(customerId, customerName) {
    // This would show a list of bills for the customer
    // For now, just show a notification
    showNotification(`Viewing bills for ${customerName}`);
}
