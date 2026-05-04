import React from 'react';
import jsPDF from 'jspdf';
import { formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/date';
import { useShop } from '../../context/ShopContext';

const BillPrint = ({ bill, onClose }) => {
  const { shop } = useShop();

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 20;
    let yPosition = margin;

    // Header section
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(shop.name || 'Photocopy Shop', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Shop Management System', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Professional Printing & Photocopying Services', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Draw header border
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Bill details
    doc.setTextColor(0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`BILL: ${bill.billNumber}`, margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${formatDateTime(bill.billDate)}`, margin, yPosition);
    yPosition += 6;

    const customerInfo = bill.isGuest
      ? 'Customer: Guest Customer'
      : `Customer: ${bill.customer?.name || 'N/A'}${bill.customer?.phone ? ` (${bill.customer.phone})` : ''}`;
    doc.text(customerInfo, margin, yPosition);
    yPosition += 6;

    if (bill.payments && bill.payments.length > 0) {
      doc.text(`Payment Method: ${bill.paymentMethod?.toUpperCase() || 'CASH'}`, margin, yPosition);
      yPosition += 6;

      // Payment breakdown
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      bill.payments.forEach((payment, index) => {
        const paymentText = `  - ${payment.paymentMethod.toUpperCase()}: ${formatCurrency(Number(payment.amount))}`;
        doc.text(paymentText, margin, yPosition);
        yPosition += 5;
      });
      yPosition += 4;
    } else {
      doc.text(`Payment Method: ${bill.paymentMethod?.toUpperCase() || 'CASH'}`, margin, yPosition);
      yPosition += 10;
    }

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, pageWidth - (margin * 2), 8, 'F');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0);

    const col1 = margin + 5;
    const col2 = 120;
    const col3 = 150;
    const col4 = 175;

    doc.text('#', col1, yPosition + 6);
    doc.text('Item Description', col1 + 10, yPosition + 6);
    doc.text('Qty', col2, yPosition + 6);
    doc.text('Price', col3, yPosition + 6);
    doc.text('Total', col4, yPosition + 6);

    yPosition += 8;

    // Table border line
    doc.setDrawColor(0);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 3;

    // Items
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);

    bill.items.forEach((item, index) => {
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
      }

      const itemNum = index + 1;
      const itemName = item.productName;
      const quantity = item.quantity;
      const price = formatCurrency(Number(item.unitPrice));
      const subtotal = formatCurrency(Number(item.subtotal));

      doc.text(`${itemNum}.`, col1, yPosition);

      // Handle long item names
      const maxWidth = col2 - col1 - 15;
      const splitText = doc.splitTextToSize(itemName, maxWidth);
      doc.text(splitText[0], col1 + 12, yPosition);

      doc.text(`${quantity}`, col2, yPosition);
      doc.text(price, col3, yPosition);
      doc.text(subtotal, col4, yPosition);

      yPosition += 7;
    });

    yPosition += 5;

    // Table bottom border
    doc.setDrawColor(0);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Totals section
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const totalLabel = 'Subtotal:';
    const taxLabel = 'Tax:';
    const grandLabel = 'GRAND TOTAL:';

    doc.text(totalLabel, margin, yPosition);
    doc.text(formatCurrency(Number(bill.subtotal)), pageWidth - margin - 5, yPosition, { align: 'right' });
    yPosition += 7;

    if (Number(bill.tax) > 0) {
      doc.text(taxLabel, margin, yPosition);
      doc.text(formatCurrency(Number(bill.tax)), pageWidth - margin - 5, yPosition, { align: 'right' });
      yPosition += 7;
    }

    // Grand total box
    const totalBoxY = yPosition - 3;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.rect(margin, totalBoxY, pageWidth - (margin * 2), 15);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(grandLabel, margin + 5, yPosition + 5);
    doc.text(formatCurrency(Number(bill.total)), pageWidth - margin - 5, yPosition + 5, { align: 'right' });

    yPosition += 25;

    // Payment status
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    let statusText, statusColor;
    if (bill.paymentStatus === 'paid') {
      statusText = 'PAID';
      statusColor = [0, 150, 0];
    } else if (bill.paymentStatus === 'partial') {
      statusText = 'PARTIAL';
      statusColor = [255, 150, 0];
    } else {
      statusText = 'CREDIT';
      statusColor = [200, 100, 0];
    }

    doc.setTextColor(...statusColor);
    doc.setFont('helvetica', 'bold');
    doc.text(`Payment Status: ${statusText}`, margin, yPosition);

    yPosition += 20;

    // Footer section
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    doc.setTextColor(80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    doc.text('Thank you for your business!', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;

    doc.text('We appreciate your patronage', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 8;

    doc.setFontSize(9);
    doc.text('For any queries or assistance, contact us:', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;

    if (shop.phone) {
      doc.text(`Phone: ${shop.phone}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
    }

    if (shop.email) {
      doc.text(`Email: ${shop.email}`, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 5;
    }
    yPosition += 5;

    // Terms
    doc.setFontSize(8);
    doc.setTextColor(150);
    const terms = [
      '* Goods once sold will not be taken back',
      '* Please check your items before leaving',
      '* For credit payments, please clear within 30 days'
    ];

    terms.forEach((term) => {
      doc.text(term, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 4;
    });

    // Save PDF
    doc.save(`${bill.billNumber}.pdf`);

    // Call onClose after generating PDF
    onClose();
  };

  return (
    <div className="space-y-4">
      {/* Preview Bill - A4 Size */}
      <div className="bg-white border-2 border-gray-400 mx-auto" style={{ width: '210mm', minHeight: '297mm', padding: '20mm' }}>
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            {shop.logoUrl && (
              <img
                src={`${import.meta.env.VITE_API_URL || 'http://localhost:8069'}${shop.logoUrl}`}
                alt="Shop Logo"
                className="h-12 w-12 object-contain"
              />
            )}
            <h2 className="text-2xl font-bold">{shop.name || 'Photocopy Shop'}</h2>
          </div>
          <p className="text-sm text-gray-600">Shop Management System</p>
          <p className="text-xs text-gray-400 mt-1">Professional Printing & Photocopying Services</p>
        </div>

        {/* Divider */}
        <div className="border-b-2 border-gray-300 pb-4 mb-4"></div>

        {/* Bill Details */}
        <div className="mb-4">
          <p className="text-lg font-bold">BILL: {bill.billNumber}</p>
          <p className="text-sm text-gray-600 mt-1">Date: {formatDateTime(bill.billDate)}</p>
          <p className="text-sm text-gray-600">
            Customer: {bill.isGuest ? 'Guest Customer' : `${bill.customer?.name}${bill.customer?.phone ? ` (${bill.customer.phone})` : ''}`}
          </p>
          <p className="text-sm text-gray-600">Payment Method: {bill.paymentMethod?.toUpperCase() || 'CASH'}</p>
          {bill.payments && bill.payments.length > 0 && (
            <div className="mt-2 p-3 bg-gray-50 rounded">
              <p className="text-xs font-semibold mb-2">Payment Details:</p>
              {bill.payments.map((payment, index) => (
                <div key={index} className="text-xs flex justify-between">
                  <span>{payment.paymentMethod.toUpperCase()}</span>
                  <span>{formatCurrency(Number(payment.amount))}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <div className="bg-gray-100 -mx-4 px-4 py-2 mb-2">
            <div className="grid grid-cols-12 text-xs font-bold text-gray-700">
              <div className="col-span-1">#</div>
              <div className="col-span-5">Item Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
          </div>

          {bill.items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 text-xs py-2 border-b border-gray-200">
              <div className="col-span-1">{index + 1}.</div>
              <div className="col-span-5">{item.productName}</div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-right">{formatCurrency(Number(item.unitPrice))}</div>
              <div className="col-span-2 text-right">{formatCurrency(Number(item.subtotal))}</div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-2 border-gray-800 rounded p-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Subtotal:</span>
            <span>{formatCurrency(Number(bill.subtotal))}</span>
          </div>
          {Number(bill.tax) > 0 && (
            <div className="flex justify-between text-sm mb-1">
              <span>Tax:</span>
              <span>{formatCurrency(Number(bill.tax))}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold mt-2 pt-2 border-t">
            <span>GRAND TOTAL:</span>
            <span>{formatCurrency(Number(bill.total))}</span>
          </div>
        </div>

        {/* Payment Status */}
        <div className="mt-4 text-center">
          <span className={`inline-block px-4 py-1 rounded font-bold text-sm ${
            bill.paymentStatus === 'paid'
              ? 'bg-green-100 text-green-800'
              : bill.paymentStatus === 'partial'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-red-100 text-red-800'
          }`}>
            Payment Status: {bill.paymentStatus === 'paid' ? 'PAID' : bill.paymentStatus === 'partial' ? 'PARTIAL' : 'CREDIT'}
          </span>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-600">
          <p className="font-medium text-gray-800">Thank you for your business!</p>
          <p className="text-xs mt-2">We appreciate your patronage</p>
          <div className="mt-3 text-xs space-y-1">
            <p>For any queries or assistance, contact us:</p>
            {(shop.phone || shop.email) && (
              <p>
                {shop.phone && `Phone: ${shop.phone}`}
                {shop.phone && shop.email && ' | '}
                {shop.email && `Email: ${shop.email}`}
              </p>
            )}
          </div>
          <div className="mt-4 pt-3 border-t text-xs text-gray-400">
            <p>* Goods once sold will not be taken back</p>
            <p>* Please check your items before leaving</p>
            <p>* For credit payments, please clear within 30 days</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button
          onClick={generatePDF}
          className="btn btn-success px-8 py-3 text-lg"
        >
          📄 Download PDF Bill (A4)
        </button>
        <button
          onClick={onClose}
          className="btn btn-secondary px-8 py-3"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default BillPrint;
