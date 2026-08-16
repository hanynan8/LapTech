// app/api/cart-count/route.js
//
// WHY THIS ROUTE EXISTS:
// Every product page's client component used to do
//   fetch('/api/data?collection=carts')
// which downloads EVERY user's cart items, then filtered them down to the
// current user's email in the browser. That means every page load (and a
// 10s poll while logged in, on every single category page) was pulling the
// entire carts collection over the network just to compute one number.
//
// This route asks Mongo for just this user's cart, and only the `quantity`
// field, and returns a single number. Email comes from the authenticated
// session (never trusted from the client), so a user can only ever see
// their own cart count.

import { auth } from '@/app/api/auth/[...nextauth]/auth';
import { connectToMongo, getModelForCollection } from '@/lib/serverData';

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      // Not logged in - client already falls back to localStorage in this case.
      return jsonResponse({ count: 0 }, 200);
    }

    await connectToMongo();
    const CartModel = getModelForCollection('carts');

    const items = await CartModel.find(
      { email: session.user.email },
      { quantity: 1, _id: 0 } // projection: only pull what we need
    ).lean();

    const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

    return jsonResponse({ count }, 200);
  } catch (err) {
    console.error('cart-count error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
}