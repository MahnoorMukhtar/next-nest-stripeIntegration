# Course Checkout — Next.js + NestJS + Stripe + Redux Toolkit + MongoDB

A full-stack course checkout flow demonstrating secure payment processing with Stripe, server-verified webhooks, persistent order records in MongoDB, and global cart state managed with Redux Toolkit.

## Tech Stack

**Frontend**
- Next.js (App Router)
- Redux Toolkit + React Redux
- Tailwind CSS
- Axios

**Backend**
- NestJS
- MongoDB + Mongoose
- Stripe API (Checkout Sessions + Webhooks)
- `@nestjs/config` for environment management

## Architecture Overview

```
User adds course to cart (Redux Toolkit, client-side state)
        ↓
User clicks "Proceed to Payment"
        ↓
Next.js → POST /api/stripe/create-checkout-session → NestJS
        ↓
NestJS creates a Stripe Checkout Session (metadata: courseId, userId)
        ↓
User redirected to Stripe-hosted checkout page
        ↓
User completes payment with test card
        ↓
Stripe fires webhook → POST /api/stripe/webhook → NestJS
        ↓
NestJS verifies the webhook signature (raw body)
        ↓
NestJS retrieves the PaymentIntent to read metadata
        ↓
NestJS saves a Payment record to MongoDB
        ↓
User's browser redirected to /success or /cancel
```

The checkout redirect (`success_url`) is used purely for UI feedback. The **webhook is the actual source of truth** for confirming payment — this avoids trusting the client browser alone, which could be closed, interrupted, or manipulated before redirect completes.

## Key Implementation Details

- **Raw body parsing**: the `/api/stripe/webhook` route uses a dedicated raw-body Express middleware (registered before the global JSON parser) since Stripe requires the unparsed buffer to verify webhook signatures.
- **Metadata via PaymentIntent**: metadata set on `payment_intent_data` is read back from the retrieved `PaymentIntent` object during the `checkout.session.completed` event, not directly from the session object.
- **Async Mongoose config**: `MongooseModule.forRootAsync` with `ConfigService` injection ensures the database URI is read only after environment variables are fully loaded.
- **Redux Toolkit cart**: `createSlice` manages cart items client-side; checkout is only enabled once a course is added to cart, mirroring real e-commerce UX.

## Project Structure

```
nestNextStripe/
├── client/                          # Next.js frontend
│   ├── app/
│   │   ├── payment/page.tsx
│   │   ├── success/page.tsx
│   │   ├── cancel/page.tsx
│   │   ├── providers.tsx            # Redux Provider wrapper
│   │   └── layout.tsx
│   ├── components/
│   │   └── StripePaymentCard.tsx
│   └── store/
│       ├── store.ts
│       └── features/
│           └── cartSlice.ts
│
└── server/                          # NestJS backend
    └── src/
        ├── stripe/
        │   ├── stripe.module.ts
        │   ├── stripe.service.ts
        │   └── stripe.controller.ts
        ├── payments/
        │   ├── payments.module.ts
        │   ├── payments.service.ts
        │   └── schemas/
        │       └── payment.schema.ts
        ├── app.module.ts
        └── main.ts
```

## Setup & Run Locally

### 1. Clone and install

```bash
git clone https://github.com/MahnoorMukhtar/next-nest-stripeIntegration.git
cd nestNextStripe

cd client && npm install
cd ../server && npm install
```

### 2. Environment variables

Create `server/.env`:

```
STRIPE_KEY=sk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
MONGODB_URI=mongodb://localhost:27017/courseSubscription
```

### 3. Start MongoDB locally

```bash
sudo systemctl start mongod
```

### 4. Run the backend

```bash
cd server
npm run start:dev
```

### 5. Forward Stripe webhooks (in a separate terminal)

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Copy the `whsec_...` value it prints into `server/.env` as `STRIPE_WEBHOOK_SECRET`.

### 6. Run the frontend

```bash
cd client
npm run dev
```

### 7. Test the flow

Visit `http://localhost:3000/payment`, add the course to cart, proceed to checkout, and use Stripe's test card:

```
Card number: 4242 4242 4242 4242
Expiry: any future date
CVC: any 3 digits
```

## API Endpoints

| Method | Route | Description |
|---|---|---|
| POST | `/api/stripe/create-checkout-session` | Creates a Stripe Checkout Session for a given course/user |
| POST | `/api/stripe/webhook` | Receives and verifies Stripe webhook events; persists completed payments |

## Possible Next Steps

- Fetch course price from a `Course` collection instead of hardcoding it server-side
- Add idempotency checks using `event.id` to safely handle Stripe's webhook retries
- Add JWT authentication so `userId` comes from an authenticated session rather than the client payload
- Handle `payment_intent.payment_failed` and refund events
- Deploy backend (Render) and frontend (Vercel), and switch the Stripe webhook endpoint to the deployed URL

## Author

Mahnoor Mukhtar
