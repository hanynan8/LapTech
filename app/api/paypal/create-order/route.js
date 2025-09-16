// app/api/paypal/create-order/route.js
import { NextResponse } from "next/server";
import paypal from "@paypal/checkout-server-sdk";
import getPayPalClient from "@/lib/paypal";

export async function POST(req) {
  try {
    const client = getPayPalClient();
        
    // قراءة البيانات من الطلب
    const body = await req.json().catch(() => ({}));
    
    const amount = body.price ?? body.amount ?? "0.00";
    const currency = body.currency ?? "USD";
    const productName = body.productName ?? "منتج من السلة";
    
    // معلومات إضافية من البيانات
    const originalTotal = body.originalTotal;
    const originalCurrency = body.originalCurrency;
    const exchangeRate = body.exchangeRate;

    console.log('=== إنشاء طلب PayPal ===');
    console.log('المبلغ:', amount, currency);
    console.log('المبلغ الأصلي:', originalTotal, originalCurrency);

    // التحقق من صحة المبلغ
    const numericAmount = parseFloat(amount);
    if (!amount || numericAmount <= 0) {
      console.error('مبلغ غير صالح:', amount);
      return NextResponse.json(
        { error: "مبلغ غير صالح" }, 
        { status: 400 }
      );
    }

    const formattedAmount = numericAmount.toFixed(2);

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    
    // طلب PayPal مبسط بدون items لتجنب مشكلة item_total
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `cart_${Date.now()}`,
          description: originalTotal ? 
            `${productName} (${originalTotal} ${originalCurrency} = ${formattedAmount} ${currency})` : 
            productName,
          amount: {
            currency_code: currency,
            value: formattedAmount,
          },
          custom_id: `order_${Date.now()}`,
        },
      ],
      application_context: {
        brand_name: "متجرك الإلكتروني",
        landing_page: "BILLING", 
        user_action: "PAY_NOW",
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/cancel`,
      },
    });

    const order = await client.execute(request);
        
    console.log("تم إنشاء طلب PayPal:", order.result.id, "المبلغ:", formattedAmount, currency);
        
    return NextResponse.json({
      id: order.result.id,
      status: order.result.status
    }, { status: 201 });
    
  } catch (err) {
    console.error("خطأ في إنشاء طلب PayPal:", err);
    
    // طباعة تفاصيل أكثر عن الخطأ
    if (err.statusCode) {
      console.error("Status Code:", err.statusCode);
    }
    if (err.details) {
      console.error("PayPal Error Details:", JSON.stringify(err.details, null, 2));
    }
    
    return NextResponse.json(
      { 
        error: "فشل في إنشاء الطلب", 
        details: err.message || JSON.stringify(err),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}