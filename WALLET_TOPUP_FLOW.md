# Wallet Top-Up Flow with Paystack Integration

## Overview

This document explains the complete wallet top-up payment flow using Paystack integration.

## Flow Diagram

```
User clicks "Top Up Wallet"
    ↓
TopUpModal opens (user enters amount)
    ↓
POST /api/wallet/topup (Initialize Paystack)
    ↓
Creates pending Transaction in DB
    ↓
Returns Paystack checkout URL
    ↓
User redirected to Paystack
    ↓
User completes payment
    ↓
Paystack redirects to /api/wallet/callback
    ↓
Verify payment with Paystack API
    ↓
Update Transaction status to "successful"
    ↓
Credit wallet balance
    ↓
Deduct registration fee if first payment
    ↓
Redirect to /dashboard with success message
```

## Components & Files

### 1. **TopUpModal.tsx** (`/components/TopUpModal.tsx`)

- User-facing modal for entering top-up amount
- Calls `/api/wallet/topup` to initialize payment
- Redirects user to Paystack checkout URL

**Key changes:**

- Removed direct wallet crediting
- Added Paystack payment initialization
- Shows "Redirecting to payment..." message

---

### 2. **Wallet Top-Up Initialization** (`/app/api/wallet/topup/route.ts`)

**Endpoint:** `POST /api/wallet/topup`

**Process:**

1. Authenticates user via JWT token
2. Validates amount (must be > 0)
3. Checks if registration fee (₦2,500) needs to be included
4. Generates unique transaction reference (`TOPUP-{uuid}`)
5. Creates **pending Transaction** record in database
6. Initializes Paystack payment
7. Returns Paystack checkout URL

**Database records created:**

- `Transaction` (status: "pending", type: "topup")

**Response:**

```json
{
  "success": true,
  "paymentUrl": "https://checkout.paystack.com/...",
  "reference": "TOPUP-abc123...",
  "amount": 5000
}
```

---

### 3. **Paystack Callback** (`/app/api/wallet/callback/route.ts`)

**Endpoint:** `GET /api/wallet/callback?reference={ref}`

**Process:**

1. Receives payment reference from Paystack
2. Verifies payment with Paystack API
3. Checks payment status (success/failed)
4. Retrieves transaction and user from database
5. **If payment successful:**
   - Calculates credit amount (deducts ₦2,500 reg fee if needed)
   - Updates Account balance
   - Marks Transaction as "successful"
   - Marks User.registrationPaid = true (if first payment)
   - Adds notification to user
6. Redirects to `/dashboard` with success/failure message

**Database updates (on success):**

- `Account.balance` += credit amount
- `Transaction.status` = "successful"
- `User.registrationPaid` = true (if applicable)
- `User.notifications` += success message

**Redirect URLs:**

- Success: `/dashboard?topup=success&amount={amount}&reg_fee={fee}`
- Failure: `/dashboard?topup=failed&error={reason}`

---

### 4. **Dashboard Page** (`/app/(dashboard)/dashboard/page.tsx`)

**Updates:**

- Checks URL parameters for payment status
- Displays success/error message banner
- Auto-reloads user data after successful payment
- Shows animated notification with payment details

**Success message examples:**

- First payment: "✅ Payment successful! Wallet credited with ₦2,500. Registration fee of ₦2,500 has been deducted."
- Subsequent: "✅ Payment successful! Wallet credited with ₦5,000."

---

## Database Schema

### Transaction Model

```prisma
model Transaction {
  id                           Int      @id @default(autoincrement())
  reference                    String   @unique
  amount                       Int
  type                         String   // "topup"
  status                       String   // "pending" → "successful" / "failed"
  paymentMethod                String   // "paystack"
  description                  String
  platformTransactionReference String?  // Paystack reference
  createdAt                    DateTime
  updatedAt                    DateTime
  accountId                    Int
  account                      Account  @relation(...)
}
```

### User Model

- `registrationPaid: Boolean` - Tracks if ₦2,500 fee is paid
- `notifications: String[]` - Stores payment notifications

### Account Model

- `balance: Int` - Wallet balance (in kobo/cents)

---

## Registration Fee Logic

**First Top-Up:**

- If `User.registrationPaid = false`
- Minimum amount: ₦2,500
- ₦2,500 deducted automatically
- Remaining amount credited to wallet

**Example:**

- User tops up ₦5,000
- ₦2,500 → Registration fee
- ₦2,500 → Wallet balance

**Subsequent Top-Ups:**

- Full amount credited to wallet
- No deductions

---

## Security Considerations

1. **JWT Authentication** - All endpoints verify user session
2. **Paystack Verification** - Payment is verified with Paystack API before crediting
3. **Idempotency** - Duplicate transactions are prevented by checking status
4. **Transaction Records** - Every payment is logged in the database
5. **Environment Variables** - `PAYSTACK_SECRET_KEY` required

---

## Environment Variables

Required in `.env`:

```bash
PAYSTACK_SECRET_KEY=sk_test_...
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgresql://...
NEXT_PUBLIC_APP_URL=http://localhost:3000  # or production URL
```

---

## Testing

### Test Flow:

1. Login to dashboard
2. Click "Top Up Wallet"
3. Enter amount (e.g., ₦5,000)
4. Click "Confirm Top-Up"
5. Complete payment on Paystack (use test card: 4084084084084081)
6. Verify redirect to dashboard
7. Check success message
8. Verify wallet balance updated
9. Check transaction record in database

### Test Cards (Paystack Test Mode):

- Success: `4084084084084081` (CVV: 408, PIN: 0000)
- Decline: `4084084084084081` (CVV: 408, PIN: 1111)

---

## Error Handling

**Possible Errors:**

- `Invalid amount` - Amount <= 0
- `Minimum ₦2,500 required` - First top-up too low
- `Not authenticated` - Missing/invalid JWT token
- `User not found` - Invalid user ID
- `Account not found` - User has no account
- `Payment initialization failed` - Paystack API error
- `Verification failed` - Paystack verification error
- `Transaction not found` - Invalid reference

---

## Future Enhancements

1. **Webhook Support** - Add `/api/wallet/webhook` for Paystack webhooks
2. **Email Notifications** - Send receipt emails after successful payment
3. **Transaction History** - Display all transactions on dashboard
4. **Refund Support** - Handle refunded payments
5. **Multiple Payment Methods** - Add bank transfer, USSD, etc.

---

## Support

For issues or questions, check:

- Paystack Dashboard: https://dashboard.paystack.com
- Transaction logs in database
- Browser console for client-side errors
- Server logs for API errors
