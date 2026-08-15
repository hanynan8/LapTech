// lib/paypal.js
// Builds a configured @paypal/checkout-server-sdk client.
//
// Required env vars:
//   PAYPAL_CLIENT_ID
//   PAYPAL_CLIENT_SECRET
// Optional:
//   PAYPAL_MODE = "sandbox" | "live"  (defaults to "sandbox" outside production)

import paypal from '@paypal/checkout-server-sdk';

function getEnvironment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'PayPal is not configured — set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your environment.'
    );
  }

  const mode = process.env.PAYPAL_MODE || (process.env.NODE_ENV === 'production' ? 'live' : 'sandbox');

  return mode === 'live'
    ? new paypal.core.LiveEnvironment(clientId, clientSecret)
    : new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

let client = null;

export default function getPayPalClient() {
  if (!client) {
    client = new paypal.core.PayPalHttpClient(getEnvironment());
  }
  return client;
}