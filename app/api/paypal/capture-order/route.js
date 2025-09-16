import paypal from '@paypal/checkout-server-sdk';
import getPayPalClient from '@/lib/paypal';
import { connectMongoDB } from '@/lib/mongoAuth';
import Payment from '@/models/payment';
import { NextResponse } from 'next/server';

function cleanObject(obj) {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== 'object') return obj;
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== null && value !== undefined && value !== '') {
      if (typeof value === 'object') {
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
    const client = getPayPalClient();
    const body = await req.json().catch(() => ({}));

    // قبول orderID أو orderId من الbody
    const incomingOrderId = body.orderID ?? body.orderId;
    const productName = body.productName ?? 'طلب من السلة';
    const originalAmount = body.amount ?? '0';
    const originalCurrency = body.currency ?? 'USD';
    const email = body.email ?? null; // استلام البريد الإلكتروني من الطلب كحقل منفصل 'email'
    
    if (!incomingOrderId) {
      console.error('No orderID provided in request body');
      return NextResponse.json(
        { error: 'orderID is required' },
        { status: 400 }
      );
    }

    console.log('معالجة طلب الدفع:', { 
      orderId: incomingOrderId, 
      productName, 
      amount: originalAmount,
      currency: originalCurrency,
      email // تسجيل البريد الإلكتروني
    });

    const request = new paypal.orders.OrdersCaptureRequest(incomingOrderId);
    request.requestBody({});

    const capture = await client.execute(request);
    const result = capture.result;

    console.log('PayPal capture result:', result.status);

    // بيانات العميل (payer)
    const payer = {
      id: result.payer?.payer_id ?? null,
      email: email ?? result.payer?.email_address ?? null, // إعطاء الأولوية للبريد المرسل كحقل منفصل 'email'
      name: {
        given_name: result.payer?.name?.given_name ?? null,
        surname: result.payer?.name?.surname ?? null,
      },
    };

    // تفاصيل الـ purchase / capture
    const purchase = result.purchase_units?.[0] ?? {};
    const captureInfo = purchase?.payments?.captures?.[0] ?? {};

    // shipping (لو متوفر)
    const shipping = {
      name: purchase?.shipping?.name?.full_name ?? null,
      address_line_1: purchase?.shipping?.address?.address_line_1 ?? null,
      address_line_2: purchase?.shipping?.address?.address_line_2 ?? null,
      admin_area_2: purchase?.shipping?.address?.admin_area_2 ?? null,
      admin_area_1: purchase?.shipping?.address?.admin_area_1 ?? null,
      postal_code: purchase?.shipping?.address?.postal_code ?? null,
      country_code: purchase?.shipping?.address?.country_code ?? null,
    };

    // جهز الداتا للحفظ
    const paymentData = {
      orderId: result.id ?? incomingOrderId,
      status: result.status === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
      payer,
      amount: {
        currency: captureInfo?.amount?.currency_code ?? originalCurrency,
        value: captureInfo?.amount?.value ?? originalAmount,
      },
      captureId: captureInfo?.id ?? null,
      paymentMethod: 'PayPal',
      productName: productName,
      isRefunded: false,
      refundId: null,
      userId: body.userId ?? null,
      shipping,
      invoiceId: captureInfo?.invoice_id ?? null,
      referenceId: purchase?.reference_id ?? null,
      orderType: 'cart_purchase',
      paymentDate: new Date(),
      rawResponse: result,
    };

    // احفظ في MongoDB
    try {
      await connectMongoDB();
      const saved = await Payment.create(paymentData);
      
      console.log('✅ Payment saved:', saved._id, 'Amount:', saved.amount.value, saved.amount.currency, 'User Email:', saved.payer.email);
      
      // تنظيف البيانات قبل الإرجاع
      const cleanedPayment = cleanObject({
        id: saved._id,
        orderId: saved.orderId,
        amount: saved.amount,
        status: saved.status,
        productName: saved.productName,
        email: saved.payer.email
      });
      
      const cleanedCapture = cleanObject(result);
      
      const responseData = cleanObject({
        success: true, 
        message: 'تم الدفع بنجاح',
        payment: cleanedPayment,
        capture: cleanedCapture
      });
      
      return NextResponse.json(responseData, { status: 201 });
      
    } catch (dbErr) {
      console.error('❌ DB Save Error:', dbErr);
      // لو الحفظ فشل، نرجع رسالة واضحة ونعيد نتيجة الكابتشر من PayPal
      const cleanedCapture = cleanObject(result);
      
      const responseData = cleanObject({
        success: true, // الدفع نجح حتى لو فشل الحفظ
        warning: 'Payment captured but not saved in DB',
        capture: cleanedCapture,
        dbError: dbErr.message,
      });
      
      return NextResponse.json(responseData, { status: 200 });
    }
  } catch (err) {
    console.error('❌ PayPal Capture Error:', err);
    
    const responseData = cleanObject({
      success: false,
      error: 'Failed to capture order', 
      details: err.message 
    });
    
    return NextResponse.json(responseData, { status: 500 });
  }
}