// ============================================
// Reports Functionality
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = today;
    document.getElementById('reportDate').max = today;

    // Load report when date changes
    document.getElementById('reportDate').addEventListener('change', loadReport);

    // Initial load
    loadReport();

    // Print button
    document.getElementById('printReportBtn').addEventListener('click', function() {
        window.print();
    });

    // Close day button
    document.getElementById('closeDayBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to close the day? This will finalize the daily report.')) {
            showNotification('Day closed successfully');
            // In production, this would call an API to close the day
        }
    });
});

async function loadReport() {
    const date = document.getElementById('reportDate').value;

    // For demo purposes, show mock data
    // In production, this would call the API with the date parameter

    document.getElementById('reportTotalSales').textContent = formatCurrency(15000);
    document.getElementById('reportCash').textContent = formatCurrency(10000);
    document.getElementById('reportOnline').textContent = formatCurrency(5000);
    document.getElementById('reportCredit').textContent = formatCurrency(2000);
    document.getElementById('reportCreditPayments').textContent = formatCurrency(1000);
    document.getElementById('reportBillsCount').textContent = '45';

    // Real implementation would be:
    /*
    try {
        const data = await apiCall(`/api/photocopy/reports/daily?date=${date}`);
        document.getElementById('reportTotalSales').textContent = formatCurrency(data.total_sales);
        document.getElementById('reportCash').textContent = formatCurrency(data.cash);
        document.getElementById('reportOnline').textContent = formatCurrency(data.online);
        document.getElementById('reportCredit').textContent = formatCurrency(data.credit);
        document.getElementById('reportCreditPayments').textContent = formatCurrency(data.credit_payments);
        document.getElementById('reportBillsCount').textContent = data.bills_count;
    } catch (error) {
        console.error('Error loading report:', error);
        showNotification('Failed to load report', 'error');
    }
    */
}
