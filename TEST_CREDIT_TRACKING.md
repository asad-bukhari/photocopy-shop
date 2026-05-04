# How to Test the Credit Tracking System

## Prerequisites
- Backend server running on http://localhost:8069
- Frontend server running on http://localhost:5174

## Test Data Already Created

✅ Customer "Test Customer - Credit Demo" (ID: 6) has been created with:
- **3 credit bills** totaling ₹4,500
- Bill #1: ₹2,000 (65 days old) → **Critical (60+)**
- Bill #2: ₹1,500 (45 days old) → **Overdue (31-60)**
- Bill #3: ₹1,000 (15 days old) → **Current (0-30)**

## Step-by-Step Testing

### 1. View Customer List
1. Open browser: http://localhost:5174
2. Login to your account
3. Navigate to **Customers** page
4. You should see "Test Customer - Credit Demo" in the list

### 2. Check Credit Indicators
On the customer card, you should see:
- ✅ Credit Balance: ₹4,500 (red color)
- ✅ Unpaid Bills: 3
- ✅ Warning badge: "Has outstanding credit"
- ✅ **"View Credit History"** button
- ✅ **"Record Payment"** button

### 3. Open Credit History Modal
1. Click **"View Credit History"** button
2. Modal should open with loading spinner
3. Check browser console for debug logs:
   ```
   🔍 Opening credit modal for customer: Test Customer - Credit Demo (ID: 6)
   📊 Customer Credit Data: { name, creditBalance, agingSummary, transactionCount }
   📝 Sample transactions: [...]
   ```

### 4. Verify Aging Summary
In the modal, you should see **3 colored cards**:

| Bucket | Amount | Bills | Color |
|--------|--------|-------|-------|
| 0-30 Days | ₹1,000 | 1 | 🟢 Green |
| 31-60 Days | ₹1,500 | 1 | 🟡 Yellow |
| 60+ Days | ₹2,000 | 1 | 🔴 Red |

### 5. Verify Transaction Timeline
Scroll down to **Transaction History** table. You should see **3 rows**:

| Date | Type | Reference | Age | Amount | Balance |
|------|------|-----------|-----|--------|---------|
| (15 days ago) | Credit Given | BILL-CURRENT-003 | 15 days (Current) | +₹1,000 | ₹4,500 |
| (45 days ago) | Credit Given | BILL-OVERDUE-002 | 45 days (Overdue) | +₹1,500 | ₹3,500 |
| (65 days ago) | Credit Given | BILL-OLD-001 | 65 days (Critical) | +₹2,000 | ₹2,000 |

### 6. Test FIFO Payment Allocation
1. In the credit modal, click **"Record Payment"** button
2. Amount should pre-fill with ₹4,500 (outstanding balance)
3. Change amount to **₹3,000**
4. Select payment method: **Cash**
5. Click **"Record Payment"**
6. Success notification should appear
7. Modal should refresh with updated data

**Expected FIFO Allocation:**
- ₹2,000 allocated to BILL-OLD-001 (fully paid ✅)
- ₹1,000 allocated to BILL-OVERDUE-002 (partially paid)
- ₹0 allocated to BILL-CURRENT-003 (unchanged)

**Updated balances after payment:**
- Credit Balance: ₹1,500
- Unpaid Bills: 2
- BILL-CURRENT-003: ₹1,000 (still credit)
- BILL-OVERDUE-002: ₹500 remaining (still credit)

### 7. Verify Updated Timeline
After payment, Transaction History should show:
- 3 credit given transactions
- 1 payment received transaction
- Running balance updated to ₹1,500

## Expected Console Logs

Open browser DevTools (F12) → Console tab. You should see:

```
🔍 Opening credit modal for customer: Test Customer - Credit Demo (ID: 6)
📊 Customer Credit Data: {
  name: "Test Customer - Credit Demo",
  creditBalance: 4500,
  agingSummary: {
    current: { amount: 1000, count: 1 },
    overdue: { amount: 1500, count: 1 },
    critical: { amount: 2000, count: 1 }
  },
  transactionCount: 3
}
📝 Sample transactions: [
  {
    id: "bill_3",
    type: "CREDIT_GIVEN",
    date: "2026-04-19T04:52:00.000Z",
    amount: 1000,
    age: 15,
    runningBalance: 4500
  },
  ...
]
```

## Troubleshooting

### Issue: "View Credit History" button not visible
**Solution:** Make sure customer has `creditBalance > 0`

### Issue: Modal opens but shows "No credit transactions"
**Solution:** Check browser console for errors. Verify backend is returning:
- `agingSummary` object
- `creditTransactions` array

### Issue: API returns "No token provided"
**Solution:** Make sure you're logged in to the frontend

### Issue: Aging summary shows all zeros
**Solution:** Check if bills have `paymentStatus: 'credit'` in database

## Verification Checklist

- [ ] Customer card shows credit balance
- [ ] Warning badge appears for customers with credit
- [ ] "View Credit History" button is visible
- [ ] Clicking button opens modal
- [ ] Modal shows customer name and credit balance
- [ ] Aging summary cards show correct amounts
- [ ] Transaction history table shows all 3 credit bills
- [ ] Age badges show correct color (Green/Yellow/Red)
- [ ] Running balance is calculated correctly
- [ ] Payment form pre-fills with outstanding amount
- [ ] Recording payment updates the modal data
- [ ] FIFO allocation works correctly

## Database Verification (Optional)

To verify data in database:

```bash
cd backend
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.customer.findFirst({ where: { phone: '03001234567' }, include: { bills: true }});
  console.log('Customer:', c.name);
  console.log('Bills:', c.bills.length);
  c.bills.forEach(b => console.log('- ' + b.billNumber + ': ₹' + b.total + ' (' + b.paymentStatus + ')'));
  prisma.\$disconnect();
}
check();
"
```

---

## What's Working

✅ Backend API enhanced with aging and timeline
✅ FIFO payment allocation implemented
✅ CustomerCreditModal component created
✅ Integrated into Customers page
✅ Integrated into Sales page
✅ Test data created for demonstration

## Next Steps

1. Open http://localhost:5174 in your browser
2. Login and navigate to Customers page
3. Find "Test Customer - Credit Demo"
4. Click "View Credit History"
5. Verify all features are working
6. Test payment recording with FIFO allocation

If everything works, you're ready to use the credit tracking system! 🎉
