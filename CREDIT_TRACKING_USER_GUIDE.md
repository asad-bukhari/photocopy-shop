# Customer Credit Tracking System - Quick Reference Guide

## For Shop Owners

### Viewing Customer Credit History

#### From Customers Page
1. Navigate to **Customers** page
2. Find a customer with outstanding credit (shows "Credit" badge)
3. Click **"View Credit History"** button below customer details
4. Review aging analysis and transaction timeline

#### From Sales Page
1. During sale creation, select a customer with credit
2. Click **"View credit history →"** link (appears below customer info)
3. Review credit details before proceeding with sale

### Understanding Aging Analysis

The credit history modal shows three aging buckets:

- **🟢 0-30 Days (Current)** - Recent credit, no action needed
- **🟡 31-60 Days (Overdue)** - Follow up recommended
- **🔴 60+ Days (Critical)** - Urgent action required

Each bucket shows:
- Total amount in that age range
- Number of bills

### Recording Payments

#### Quick Payment (From Customer Card)
1. On Customers page, find customer
2. Click **"Record Payment"** button
3. Enter amount and payment method
4. Click **"Record Payment"**

#### Detailed Payment (From Credit Modal)
1. Open customer's credit history
2. Click **"Record Payment"** button (pre-fills outstanding amount)
3. Adjust amount if needed
4. Select payment method (Cash/Online/Bank Transfer)
5. Click **"Record Payment"**
6. Modal automatically refreshes with updated data

### Understanding Transaction Timeline

The transaction history table shows:

| Column | Description |
|--------|-------------|
| **Date** | When transaction occurred |
| **Type** | Credit Given (red) or Payment Received (green) |
| **Reference** | Bill number or which bills payment was applied to |
| **Age** | How many days old (for credit bills) |
| **Amount** | + for credit, - for payments |
| **Balance** | Running credit balance after this transaction |

### FIFO Payment Allocation

When you record a payment, the system automatically:
1. Allocates to **oldest unpaid bills first**
2. Creates payment records for each bill
3. Marks bills as "paid" when fully cleared
4. Updates customer credit balance

**Example:**
- Customer has 3 unpaid bills:
  - Bill #1: ₹2,000 (65 days old)
  - Bill #2: ₹1,500 (45 days old)
  - Bill #3: ₹1,000 (15 days old)
- You record payment of ₹3,000
- System allocates:
  - ₹2,000 to Bill #1 (fully paid, marked as "paid")
  - ₹1,000 to Bill #2 (partially paid, still shows as "credit")
  - Bill #3: unpaid

### Identifying Problem Customers

#### Critical Credit Alert
Customers with 60+ day overdue credit show:
- 🔴 warning badge on customer card
- "Has outstanding credit" message
- Large amount in Critical bucket

#### Recommended Actions
1. **0-30 Days** - No action needed
2. **31-60 Days** - Send reminder, follow up
3. **60+ Days** - Urgent: Call customer, consider credit hold

### Tips for Shop Owners

✅ **Best Practices:**
- Check aging analysis weekly
- Follow up on overdue credits before they become critical
- Use "View Credit History" before extending more credit
- Print transaction history for disputed payments

⚠️ **Warning Signs:**
- Customer consistently in 60+ day bucket
- Multiple unpaid bills approaching 60 days
- Rapid increase in credit balance

📊 **Cash Flow Management:**
- Total Credit Balance shown on Customers page
- Filter customers by credit status
- Prioritize collection from Critical bucket

## For Developers

### API Endpoints

#### Get Customer with Credit Details
```http
GET /api/photocopy/customers/:id
```

Response includes:
```json
{
  "customer": {
    "agingSummary": {
      "current": { "amount": 5000, "count": 2 },
      "overdue": { "amount": 3000, "count": 1 },
      "critical": { "amount": 2000, "count": 1 }
    },
    "creditTransactions": [...]
  }
}
```

#### Record Payment (FIFO)
```http
POST /api/photocopy/customers/:id/payments
Content-Type: application/json

{
  "amount": 5000,
  "paymentMethod": "cash",
  "notes": "Payment for outstanding bills"
}
```

Response includes allocation details:
```json
{
  "payment": {
    "amount": 5000,
    "paymentMethod": "cash",
    "allocatedTo": ["BILL-001", "BILL-002"],
    "allocatedCount": 2,
    "allocations": [
      { "billId": 1, "billNumber": "BILL-001", "amount": 2000 },
      { "billId": 2, "billNumber": "BILL-002", "amount": 3000 }
    ]
  }
}
```

### Component Usage

```jsx
import CustomerCreditModal from './components/customers/CustomerCreditModal';

function MyComponent() {
  const [showCreditModal, setShowCreditModal] = useState(null);

  return (
    <>
      <button onClick={() => setShowCreditModal(customerId)}>
        View Credit History
      </button>

      {showCreditModal && (
        <CustomerCreditModal
          customerId={showCreditModal}
          onClose={() => setShowCreditModal(null)}
        />
      )}
    </>
  );
}
```

### Helper Functions

#### calculateAgingBuckets(bills)
Groups unpaid bills by age into current/overdue/critical buckets.

#### buildTransactionTimeline(bills, payments)
Creates unified transaction timeline with running balance.

---

**Need Help?** Check the implementation document: `CREDIT_TRACKING_IMPLEMENTATION.md`
