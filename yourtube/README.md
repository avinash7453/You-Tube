This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/pages/api-reference/create-next-app).

## Subscription payments

The `/plans` page uses Razorpay test checkout. Configure these server environment
variables before enabling payments:

```env
RAZORPAY_KEY_ID=your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM=YourTube <billing@example.com>
TRANSLATION_API_URL=https://api.mymemory.translated.net/get
# Optional for LibreTranslate-compatible providers:
TRANSLATION_API_KEY=your_translation_api_key
```

SMTP variables are optional; when omitted, payment succeeds but no confirmation
email is sent. Payment signatures are verified on the server before the user's
plan is updated. Plans are `free`, `bronze`, `silver`, and `gold`.

The same SMTP settings are used for new-device login OTP verification. The
browser supplies a generated device ID and timezone-based region; the first
device is trusted, and a new device or region requires a six-digit OTP sent to
the user's registered email.

Comment translation is proxied through the backend at
`POST /comment/translate`. The local configuration uses MyMemory's no-key
development endpoint. For production, use a provider with an API key and set
`TRANSLATION_API_URL` and, when required, `TRANSLATION_API_KEY` on the server.
Restart the backend after changing these values.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/pages/building-your-application/routing/api-routes) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/pages/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
