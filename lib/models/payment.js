// models/payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    status: { type: String, default: 'PENDING' },
    payer: {
      id: String,
      email: String,
      name: {
        given_name: String,
        surname: String,
      },
    },
    amount: {
      currency: String,
      value: String,
    },
    captureId: String,
    paymentMethod: { type: String, default: 'PayPal' },
    productName: String,
    isRefunded: { type: Boolean, default: false },
    refundId: { type: String, default: null },
    userId: { type: String, default: null },
    shipping: {
      name: String,
      address_line_1: String,
      address_line_2: String,
      admin_area_2: String,
      admin_area_1: String,
      postal_code: String,
      country_code: String,
    },
    invoiceId: String,
    referenceId: String,
    orderType: { type: String, default: 'cart_purchase' },
    paymentDate: { type: Date, default: Date.now },
    rawResponse: { type: mongoose.Schema.Types.Mixed },
  },
  { strict: false, timestamps: true }
);

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema, 'payments');