// models/payment.js

import mongoose from 'mongoose';

// Payment Model Schema
const PaymentSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true },
    status: { type: String, required: true },

    // معلومات الدافع كما وصلت من بوابة الدفع (PayPal)
    payer: {
      id: String,
      email: String, // البريد من PayPal (مطابق لـ payerEmail أيضاً)
      name: {
        given_name: String,
        surname: String,
      },
    },

    // حقل منفصل للايميل الذي دفعت منه PayPal (يسهل البحث)
    payerEmail: { type: String, index: true },

    // الايميل المرتبط بالجلسة / الاوردر (الذي أرسله العميل من الواجهة، مثلاً: session email أو البريد المسجل في حساب المستخدم أثناء الطلب)
    sessionEmail: { type: String, index: true },

    // حقل احتياطي/عام لتخزين ايميل المستخدم إن وُجد (قد يكون نسخة أو علاقة بـ userId)
    userEmail: { type: String },

    amount: {
      currency: String,
      value: String,
    },

    captureId: String,
    paymentMethod: { type: String, default: "PayPal" },
    productName: String,

    isRefunded: { type: Boolean, default: false },
    refundId: { type: String },
    refundAmount: {
      currency: String,
      value: String,
    },

    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

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
    orderType: String,
    paymentDate: Date,

    rawResponse: Object,
  },
  { timestamps: true }
);

// إنشاء النموذج
const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
export default Payment;
