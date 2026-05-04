import jsPDF from 'jspdf';
import { formatCurrency } from './currency';
import { formatDateTime } from './date';

/**
 * Generate PDF for Daily Report
 */
export const generateDailyReportPDF = (reportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const margin = 20;
  let yPosition = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Photocopy Shop', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Daily Sales Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 5;

  doc.setFontSize(10);
  doc.text(`Date: ${reportData.date}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary Section
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - (margin * 2), 25, 'F');
  yPosition += 5;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary', margin + 5, yPosition);
  yPosition += 8;

  const summary = reportData.summary;
  const summaryData = [
    { label: 'Total Sales:', value: formatCurrency(Number(summary.totalSales)) },
    { label: 'Cash Sales:', value: formatCurrency(Number(summary.cashSales)) },
    { label: 'Online Sales:', value: formatCurrency(Number(summary.onlineSales)) },
    { label: 'Credit Sales:', value: formatCurrency(Number(summary.creditSales)) },
    { label: 'Total Bills:', value: summary.billCount.toString() },
    { label: 'Guest Bills:', value: summary.guestBills.toString() },
    { label: 'Customer Bills:', value: summary.customerBills.toString() }
  ];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  summaryData.forEach((item, index) => {
    const x = index % 2 === 0 ? margin + 5 : pageWidth / 2 + 5;
    const y = yPosition + (index % 2 === 0 ? 0 : 6);
    if (index % 2 === 0 && index > 0) yPosition += 6;
    doc.text(item.label, x, y);
    doc.text(item.value, x + 60, y);
  });

  yPosition += 25;

  // Sales by Category
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Sales by Category', margin, yPosition);
  yPosition += 8;

  const categories = Object.entries(reportData.salesByCategory);
  categories.forEach(([category, data]) => {
    if (yPosition > 260) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 12, 'F');
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(category, margin + 5, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.quantity} items - ${formatCurrency(data.amount)}`, pageWidth - margin - 5, yPosition, { align: 'right' });
    yPosition += 12;
  });

  yPosition += 10;

  // Bills List
  if (yPosition > 240) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Transaction Details', margin, yPosition);
  yPosition += 8;

  // Table header
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - (margin * 2), 7, 'F');
  yPosition += 4;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('#', margin + 3, yPosition + 3);
  doc.text('Bill No', margin + 15, yPosition + 3);
  doc.text('Customer', margin + 50, yPosition + 3);
  doc.text('Amount', pageWidth - margin - 40, yPosition + 3);
  doc.text('Status', pageWidth - margin - 5, yPosition + 3);
  yPosition += 7;

  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 3;

  // Bills
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  reportData.bills.slice(0, 20).forEach((bill, index) => {
    if (yPosition > 280) {
      doc.addPage();
      yPosition = margin;
      // Re-add header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Transaction Details (continued)', margin, yPosition);
      yPosition += 8;
    }

    const customerName = bill.isGuest ? 'Guest' : (bill.customer?.name || 'N/A');

    doc.text(`${index + 1}.`, margin + 3, yPosition);
    doc.text(bill.billNumber, margin + 15, yPosition);
    doc.text(customerName, margin + 50, yPosition);
    doc.text(formatCurrency(Number(bill.total)), pageWidth - margin - 40, yPosition);

    const statusColor = bill.paymentStatus === 'paid' ? [0, 150, 0] : [200, 100, 0];
    doc.setTextColor(...statusColor);
    doc.text(bill.paymentMethod || bill.paymentStatus, pageWidth - margin - 5, yPosition, { align: 'right' });
    doc.setTextColor(0);
    yPosition += 6;
  });

  // Footer
  yPosition = 280;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated on: ${formatDateTime(new Date())}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 4;

  doc.text('Photocopy Shop Management System', pageWidth / 2, yPosition, { align: 'center' });

  // Save
  doc.save(`Daily-Report-${reportData.date}.pdf`);
};

/**
 * Generate PDF for Sales Report
 */
export const generateSalesReportPDF = (reportData) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 15;
  let yPosition = margin;

  // Header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Photocopy Shop - Sales Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Period: ${reportData.startDate} to ${reportData.endDate}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 12;

  // Summary
  const totalSales = reportData.salesByPeriod.reduce((sum, period) => sum + Number(period.totalSales), 0);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Sales: ${formatCurrency(totalSales)}`, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');

  const col1 = margin + 5;
  const col2 = 80;
  const col3 = 140;
  const col4 = 190;
  const col5 = 250;

  doc.text('Date', col1, yPosition);
  doc.text('Bills', col2, yPosition);
  doc.text('Cash Sales', col3, yPosition);
  doc.text('Credit Sales', col4, yPosition);
  doc.text('Total Sales', col5, yPosition);
  yPosition += 7;

  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 4;

  doc.setFont('helvetica', 'normal');
  reportData.salesByPeriod.forEach((period) => {
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }

    doc.text(period.date, col1, yPosition);
    doc.text(period.billCount.toString(), col2, yPosition);
    doc.text(formatCurrency(Number(period.cashSales)), col3, yPosition);
    doc.text(formatCurrency(Number(period.creditSales)), col4, yPosition);
    doc.text(formatCurrency(Number(period.totalSales)), col5, yPosition);
    yPosition += 6;
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated: ${formatDateTime(new Date())}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

  doc.save(`Sales-Report-${reportData.startDate}-to-${reportData.endDate}.pdf`);
};

/**
 * Generate PDF for Inventory Report
 */
export const generateInventoryReportPDF = (reportData) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    'format': 'a4'
  });

  const pageWidth = 210;
  const margin = 20;
  let yPosition = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Photocopy Shop', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Inventory Status Report', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 15;

  // Summary
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPosition, pageWidth - (margin * 2), 30, 'F');
  yPosition += 5;

  const summary = reportData.summary;
  const summaryData = [
    { label: 'Total Products:', value: summary.totalProducts.toString() },
    { label: 'Inventory Value:', value: formatCurrency(Number(summary.totalValue)) },
    { label: 'Low Stock Items:', value: summary.lowStockCount.toString() },
    { label: 'Out of Stock Items:', value: summary.outOfStockCount.toString() }
  ];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  summaryData.forEach((item, index) => {
    const x = index % 2 === 0 ? margin + 5 : pageWidth / 2 + 5;
    const y = yPosition + (index % 2 === 0 ? 0 : 6);
    if (index % 2 === 0 && index > 0) yPosition += 6;
    doc.text(item.label, x, y);
    doc.text(item.value, x + 70, y);
  });

  yPosition += 25;

  // Low Stock Items
  if (reportData.lowStockItems.length > 0) {
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Low Stock Items', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    reportData.lowStockItems.forEach((item) => {
      if (yPosition > 260) {
        doc.addPage();
        yPosition = margin;
      }

      doc.text(`${item.name} (${item.category})`, margin + 5, yPosition);
      doc.text(`Stock: ${item.stock} | Threshold: ${item.lowStockThreshold}`, pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += 6;
    });

    yPosition += 10;
  }

  // Category Breakdown
  if (yPosition > 240) {
    doc.addPage();
    yPosition = margin;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Inventory by Category', margin, yPosition);
  yPosition += 8;

  const categories = Object.entries(reportData.byCategory);
  categories.forEach(([category, data]) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 18, 'F');
    yPosition += 4;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(category, margin + 5, yPosition);
    yPosition += 6;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Items: ${data.itemCount} | Total Stock: ${data.totalStock} | Value: ${formatCurrency(data.totalValue)}`, margin + 5, yPosition);
    yPosition += 18;
  });

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text(`Generated: ${formatDateTime(new Date())}`, pageWidth / 2, 280, { align: 'center' });

  doc.save(`Inventory-Report-${new Date().toISOString().split('T')[0]}.pdf`);
};
