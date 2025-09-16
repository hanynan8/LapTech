//lib/paypal
import paypal from "@paypal/checkout-server-sdk";

function getPayPalClient() {
  const environment =
    process.env.PAYPAL_ENVIRONMENT === "sandbox"
      ? new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET
        )
      : new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID,
          process.env.PAYPAL_CLIENT_SECRET
        );

  return new paypal.core.PayPalHttpClient(environment);
}

export default getPayPalClient;
