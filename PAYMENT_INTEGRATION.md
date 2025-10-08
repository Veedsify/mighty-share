# Payment Integration Guide

## Overview

This application now supports **dual payment providers** for registration fees:

- **Paystack** (Primary/Backup)
- **ALATPay** (WEMA Bank)

If one provider fails, users can easily switch to the alternate provider.

---

## Environment Variables

### Required Configuration

Update your `.env.local` file with the following:

```env
# ──────────────────────────────────────────────
# 💳 ALATPAY PRODUCTION CONFIGURATION
# ──────────────────────────────────────────────
NEXT_PUBLIC_ALATPAY_PUBLIC_KEY=27bdec6acd674abcb7362e76f81ac547
NEXT_PUBLIC_ALATPAY_SECRET_KEY=5142534b4dd54a36bcccb45f44704879
NEXT_PUBLIC_WEBHOOK_SECRET_KEY=c90cc05df4713d7fbb6b72e724231894
ALATPAY_MERCHANT_ID=27a4ed9c-e6db-490e-1495-08ddfceabbff
ALATPAY_BASE_URL=https://apibox.alatpay.ng
NEXT_PUBLIC_ALATPAY_INLINE_SRC=/alatpay-inline.js

# ──────────────────────────────────────────────
# 💳 PAYSTACK CONFIGURATION (Backup Payment Method)
# ──────────────────────────────────────────────
# Get these from: https://dashboard.paystack.com/#/settings/developer
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key_here

# ──────────────────────────────────────────────
# 🌍 APP URL (Important for callbacks)
# ──────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Paystack Keys

1. Visit [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)
2. Sign up or log in
3. Navigate to Settings > API Keys & Webhooks
4. Copy your **Public Key** and **Secret Key**
5. Replace the placeholder values in `.env.local`

**⚠️ Important:**

- Use **test keys** (`pk_test_...` and `sk_test_...`) for development
- Use **live keys** (`pk_live_...` and `sk_live_...`) for production

---

## API Endpoints

### Paystack Integration

#### 1. Initialize Payment

**Endpoint:** `POST /api/paystack/initialize`

**Request Body:**

```json
{
  "amount": 2500,
  "currency": "NGN",
  "description": "MightyShare Registration Fee"
}
```

**Response:**

```json
{
  "paystackData": {
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "...",
    "reference": "PS-..."
  },
  "paymentUrl": "https://checkout.paystack.com/...",
  "reference": "PS-..."
}
```

#### 2. Verify Payment

**Endpoint:** `POST /api/paystack/verify`

**Request Body:**

```json
{
  "reference": "PS-..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "amount": 2500,
  "reference": "PS-..."
}
```

#### 3. Payment Callback

**Endpoint:** `GET /api/paystack/callback?reference=PS-...`

Automatically redirects to:

```
/register-payment?reference=PS-...&provider=paystack
```

---

### ALATPay Integration

#### 1. Initialize Payment

**Endpoint:** `POST /api/alatpay/initialize`

**Request Body:**

```json
{
  "amount": 2500,
  "currency": "NGN",
  "description": "MightyShare Registration Fee"
}
```

**Response:**

```json
{
  "alatPayData": {
    "status": "success",
    "data": {
      "paymentUrl": "...",
      "accountNumber": "...",
      "bankName": "WEMA Bank"
    }
  },
  "paymentUrl": "...",
  "reference": "ORD..."
}
```

#### 2. Verify Payment

**Endpoint:** `POST /api/alatpay/verify`

**Request Body:**

```json
{
  "reference": "ORD...",
  "orderId": "ORD..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "amount": 2500,
  "reference": "ORD..."
}
```

#### 3. Payment Callback

**Endpoint:** `GET /api/alatpay/callback?orderId=ORD...&status=success`

Automatically redirects to:

```
/register-payment?reference=ORD...&provider=alatpay&status=success
```

---

## Payment Flow

### User Journey

1. **User lands on `/register-payment`**

   - Sees two payment buttons: "Pay with Paystack" and "Pay with ALATPay"

2. **User selects payment provider**

   - Click triggers initialization API call
   - User redirected to payment gateway

3. **User completes payment**

   - Payment gateway redirects to callback URL
   - Callback redirects back to `/register-payment` with reference

4. **Automatic verification**

   - Page detects reference in URL
   - Calls verification API
   - Shows "Verifying payment..." message

5. **Success handling**

   - Payment status updated to "SUCCESSFUL"
   - User's `registrationPaid` set to `true`
   - User redirected to dashboard

6. **Failure handling**
   - Error message displayed
   - User can try alternate payment provider

---

## Database Schema

### Payment Model

```prisma
model Payment {
  id                Int           @id @default(autoincrement())
  userId            Int
  businessId        String
  amount            Int
  currency          String
  orderId           String        @unique
  description       String
  customerEmail     String
  customerPhone     String
  customerFirstName String
  customerLastName  String
  customerMetadata  String?
  status            PaymentStatus @default(PENDING)
  User              User          @relation(fields: [userId], references: [id])
  createdAt         DateTime      @default(now())
}

enum PaymentStatus {
  PENDING
  SUCCESSFUL
  FAILED
}
```

---

## Frontend Implementation

### Register Payment Page

**Location:** `/app/(main)/register-payment/page.tsx`

**Features:**

- Dual payment button interface
- Automatic payment verification on callback
- Loading states and error handling
- Fallback to alternate provider on failure

**Usage:**

```tsx
// Initialize Paystack payment
await axios.post("/api/paystack/initialize", {
  amount: 2500,
  currency: "NGN",
  description: "Registration Fee",
});

// Verify payment
await axios.post("/api/paystack/verify", {
  reference: "PS-...",
});
```

---

## Testing

### Test with Paystack (Development)

Use Paystack test cards:

**Successful Payment:**

- Card: `4084084084084081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

**Failed Payment:**

- Card: `5060666666666666666`
- CVV: Any
- Expiry: Any future date

### Test with ALATPay

Follow WEMA Bank's test procedures or use their sandbox environment.

---

## Error Handling

### Common Errors and Solutions

| Error                                   | Cause                       | Solution                                        |
| --------------------------------------- | --------------------------- | ----------------------------------------------- |
| "PAYSTACK_SECRET_KEY is not configured" | Missing env variable        | Add Paystack keys to `.env.local`               |
| "Payment reference is required"         | Missing reference parameter | Ensure callback includes reference              |
| "Payment record not found"              | Database mismatch           | Check payment was created during initialization |
| "Payment was not successful"            | Payment failed at gateway   | User should retry payment                       |

---

## Security Best Practices

1. **Never expose secret keys on frontend**

   - Only `NEXT_PUBLIC_*` variables are safe for client-side
   - Keep `PAYSTACK_SECRET_KEY` server-side only

2. **Always verify payments server-side**

   - Don't trust callback parameters alone
   - Make verification API call to payment provider

3. **Use HTTPS in production**

   - Required for PCI compliance
   - Protects payment data in transit

4. **Implement webhook validation**
   - Verify webhook signatures
   - Prevent fraudulent payment confirmations

---

## Webhook Setup (Optional but Recommended)

### Paystack Webhook

1. Go to [Paystack Dashboard > Settings > Webhooks](https://dashboard.paystack.com/#/settings/webhooks)
2. Add webhook URL: `https://yourdomain.com/api/paystack/webhook`
3. Select events: `charge.success`
4. Copy webhook secret and add to `.env.local`

### ALATPay Webhook

1. Contact WEMA Bank support for webhook configuration
2. Provide webhook URL: `https://yourdomain.com/api/alatpay/callback`
3. Add webhook secret to `.env.local`

---

## Deployment Checklist

- [ ] Update `.env.local` with production Paystack keys
- [ ] Update `.env.local` with production ALATPay keys
- [ ] Set `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure webhooks with payment providers
- [ ] Test payment flow in production
- [ ] Monitor payment logs and errors
- [ ] Set up payment reconciliation process

---

## Support

### Paystack Support

- Email: support@paystack.com
- Documentation: https://paystack.com/docs

### ALATPay Support

- Contact WEMA Bank support
- Documentation: As provided by WEMA

---

## Changelog

### Version 1.0.0 (Current)

- ✅ Dual payment provider support (Paystack + ALATPay)
- ✅ Automatic payment verification
- ✅ Fallback payment options
- ✅ Registration completion tracking
- ✅ Comprehensive error handling
