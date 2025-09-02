// components/WhatsAppButton.jsx
'use client'; // Mark this as a Client Component

import React from 'react';

function goToWatssap(product = null, phoneNumber = '2001201061216') {
  let message = 'السلام عليكم ورحمة الله وبركاته\n';

  if (product && product.name) {
    message += `أريد الاستفسار عن هذا المنتج:\n\n`;
    message += `🔧 *${product.name}*\n\n`;

    if (product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0) {
      message += `📋 *المواصفات:*\n`;
      Object.entries(product.specs).forEach(([key, value]) => {
        if (value) message += `• ${key}: ${value}\n`;
      });
      message += `\n`;
    }

    if (product.price) {
      message += `💰 *السعر:* ${
        typeof product.price === 'number'
          ? product.price.toLocaleString()
          : product.price
      } ${product.currency || 'ج.م'}`;

      if (product.originalPrice && product.discount) {
        message += `\n🔥 *خصم ${product.discount}%* من ${
          typeof product.originalPrice === 'number'
            ? product.originalPrice.toLocaleString()
            : product.originalPrice
        } ${product.currency || 'ج.م'}`;
      }
      message += `\n`;
    }

    if (product.rating) {
      message += `⭐ *التقييم:* ${product.rating}/5\n`;
    }

    if (product.image) {
      message += `🖼️ *صورة المنتج:*\n${product.image}\n`;
    }

    message += `\n🛒 أرغب في الحصول على مزيد من التفاصيل والطلب\n`;
    message += `📞 يرجى التواصل معي في أقرب وقت ممكن`;
  } else {
    message += 'أريد الاستفسار عن منتجات الكمبيوتر\n';
    message += 'يرجى التواصل معي للمساعدة في اختيار المنتجات المناسبة';
  }

  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
}

export default function WhatsAppButton({ product, className, children }) {
  return (
    <button
      onClick={() => goToWatssap(product)}
      className={className}
    >
      {children}
    </button>
  );
}