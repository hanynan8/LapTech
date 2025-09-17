export const runtime = "nodejs";
// webhook/route.js

import { NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongoAuth";
import Payment from "../../../../models/payment";

function cleanObject(obj) {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object' && !Array.isArray(value)) {
        const nestedClean = cleanObject(value);
        if (nestedClean && Object.keys(nestedClean).length > 0) {
          cleaned[key] = nestedClean;
        }
      } else {
        cleaned[key] = value;
      }
    }
  }
  return Object.keys(cleaned).length > 0 ? cleaned : null;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const eventType = body.event_type;
    const resource = body.resource;

    // التحقق من وجود البيانات المطلوبة
    if (!resource?.id) {
      console.error('❌ Webhook: No resource ID provided');
      return NextResponse.json(
        { error: "No resource ID found" },
        { status: 400 }
      );
    }

    console.log('📩 Webhook Event:', eventType, 'Resource ID:', resource.id);

    await connectMongoDB();

    // تحديد البيانات المراد تحديثها حسب نوع الحدث
    let updateData = {
      rawResponse: body,
      updatedAt: new Date()
    };

    // حاول استخراج ايميل دافع الدفع من الـ resource (PayPal)
    const payerEmailFromWebhook =
      resource?.payer?.email_address ??
      resource?.payer?.email ??
      resource?.payer?.payer_email ??
      null;

    if (payerEmailFromWebhook) {
      updateData.payerEmail = payerEmailFromWebhook;
      // أيضا: حافظ على payer.email داخل الـ payer subdocument لو موجود
      updateData['payer.email'] = payerEmailFromWebhook;
    }

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED":
        updateData.status = "COMPLETED";
        console.log('✅ Payment completed:', resource.id);
        break;

      case "PAYMENT.CAPTURE.DENIED":
        updateData.status = "DENIED";
        console.log('❌ Payment denied:', resource.id);
        break;

      case "PAYMENT.CAPTURE.REFUNDED":
        updateData.status = "REFUNDED";
        updateData.isRefunded = true;
        updateData.refundId = resource.id;

        if (resource.amount) {
          updateData.refundAmount = {
            currency: resource.amount.currency_code,
            value: resource.amount.value
          };
        }

        console.log('💰 Payment refunded:', resource.id);
        break;

      case "PAYMENT.CAPTURE.PENDING":
        updateData.status = "PENDING";
        console.log('⏳ Payment pending:', resource.id);
        break;

      case "PAYMENT.CAPTURE.CANCELLED":
        updateData.status = "CANCELLED";
        console.log('🚫 Payment cancelled:', resource.id);
        break;

      default:
        console.log('⚠️ Unhandled webhook event:', eventType);
        return NextResponse.json({
          received: true,
          message: `Event ${eventType} received but not processed`
        }, { status: 200 });
    }

    // العثور على السجل وتحديثه حسب captureId
    const updatedPayment = await Payment.findOneAndUpdate(
      { captureId: resource.id },
      { $set: updateData },
      {
        new: true,
        runValidators: true,
        projection: { // إرجاع الحقول المهمة فقط
          _id: 1,
          orderId: 1,
          status: 1,
          'payer.email': 1,
          payerEmail: 1,
          sessionEmail: 1,
          amount: 1,
          isRefunded: 1,
          updatedAt: 1
        }
      }
    );

    if (!updatedPayment) {
      console.warn('⚠️ Payment record not found for captureId:', resource.id);
      return NextResponse.json({
        received: true,
        warning: `Payment record not found for captureId: ${resource.id}`
      }, { status: 200 });
    }

    console.log('💾 Payment updated successfully:', {
      id: updatedPayment._id,
      orderId: updatedPayment.orderId,
      status: updatedPayment.status,
      payerEmail: updatedPayment.payer?.email ?? updatedPayment.payerEmail,
      sessionEmail: updatedPayment.sessionEmail,
      isRefunded: updatedPayment.isRefunded
    });

    // تنظيف البيانات قبل الإرجاع
    const cleanedPayment = cleanObject({
      paymentId: updatedPayment._id,
      orderId: updatedPayment.orderId,
      status: updatedPayment.status,
      payerEmail: updatedPayment.payer?.email ?? updatedPayment.payerEmail,
      sessionEmail: updatedPayment.sessionEmail,
      amount: updatedPayment.amount,
      isRefunded: updatedPayment.isRefunded,
      updatedAt: updatedPayment.updatedAt
    });

    return NextResponse.json({
      received: true,
      updated: true,
      ...cleanedPayment
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);

    // تنظيف خطأ إذا كان هناك تفاصيل
    const cleanedError = cleanObject({
      error: "Webhook processing failed",
      details: error?.message ?? String(error),
      received: true // مهم: نخبر PayPal إننا استلمنا الـ webhook حتى لو فشل المعالجة
    });

    return NextResponse.json(cleanedError, { status: 500 });
  }
}
