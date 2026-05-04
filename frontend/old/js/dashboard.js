// ============================================
// Dashboard Functionality
// ============================================

document.addEventListener('DOMContentLoaded', async function() {
    // Load dashboard data
    await loadDashboard();

    // Refresh every 30 seconds
    setInterval(loadDashboard, 30000);
});

async function loadDashboard() {
    try {
        const data = await apiCall('/api/photocopy/dashboard');

        // Update statistics
        document.getElementById('todaySales').textContent = formatCurrency(data.today_sales);
        document.getElementById('todayCredit').textContent = formatCurrency(data.today_credit);
        document.getElementById('lowStockCount').textContent = data.low_stock_count;
        document.getElementById('pendingBills').textContent = data.pending_bills_count;

        // Update low stock items list
        const lowStockItems = document.getElementById('lowStockItems');
        if (data.low_stock_items && data.low_stock_items.length > 0) {
            lowStockItems.innerHTML = data.low_stock_items
                .map(item => `<div>${item.name}: ${item.stock} left</div>`)
                .join('');
        } else {
            lowStockItems.innerHTML = '<small>All stocks good!</small>';
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
        showNotification('Failed to load dashboard data', 'error');
    }
}
