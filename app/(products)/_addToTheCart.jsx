'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ShoppingCart, Loader } from 'lucide-react';

export default function AddToCartButton({ product, className = '', children }) {
  const { data: session } = useSession();
  const [adding, setAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Default classes for the button
  const defaultClasses =
    'w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2.5 sm:py-3 rounded-xl sm:rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 font-bold text-base sm:text-lg flex items-center justify-center gap-2';

  const btnClasses = `${defaultClasses} ${className}`.trim();

  // Optimistic UI update for adding to cart
  const optimisticAdd = () => {
    try {
      window.dispatchEvent(
        new CustomEvent('productAddedToCart', { detail: { quantity: 1 } })
      );
    } catch (e) {
      console.warn('optimisticAdd dispatch failed', e);
    }
  };

  // Optimistic UI rollback
  const optimisticRemove = () => {
    try {
      window.dispatchEvent(
        new CustomEvent('productRemovedFromCart', { detail: { quantity: 1 } })
      );
    } catch (e) {
      console.warn('optimisticRemove dispatch failed', e);
    }
  };

  // Notify cart update
  const notifyCartUpdated = () => {
    try {
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    } catch (e) {
      console.warn('cartUpdated dispatch failed', e);
    }
  };

  // Handle adding to local storage cart
  const addToLocalCart = (item) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const idx = cart.findIndex((p) => String(p.productId) === String(item.productId));
    if (idx !== -1) {
      cart[idx].quantity = (cart[idx].quantity || 0) + item.quantity;
    } else {
      cart.push(item);
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    return cart;
  };

  // Handle add to cart action
  const handleAddToCart = async () => {
    if (adding) return;
    setAdding(true);
    setShowSuccess(true); // Show success message immediately

    const item = {
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency || 'ج.م',
      image: product.image,
      quantity: 1,
    };

    optimisticAdd();

    if (session) {
      try {
        const response = await fetch(
          'https://restaurant-back-end.vercel.app/api/data?collection=carts',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...item,
              email: session.user.email,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('تم إضافة المنتج للكارت:', result);
        notifyCartUpdated();
      } catch (error) {
        console.error('خطأ عند إضافة المنتج:', error);
        optimisticRemove();
        alert('حدث خطأ، حاول مرة أخرى.');
        setShowSuccess(false); // Hide success message on error
      } finally {
        setAdding(false);
      }
    } else {
      try {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingIndex = cart.findIndex((p) => p.productId === item.productId);

        if (existingIndex !== -1) {
          cart[existingIndex].quantity += 1;
        } else {
          cart.push(item);
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        notifyCartUpdated();
      } catch (err) {
        console.error('خطأ في localStorage:', err);
        optimisticRemove();
        alert('حدث خطأ، حاول مرة أخرى.');
        setShowSuccess(false); // Hide success message on error
      } finally {
        setAdding(false);
      }
    }
  };

  // Hide success message after 3 seconds
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  return (
    <div className="relative">
      {showSuccess && (
        <div className="absolute -top-10 left-0 right-0 flex justify-center">
          <span className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold animate-fade-in">
            تمت الإضافة بنجاح!
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={adding}
        aria-disabled={adding}
        className={btnClasses + (adding ? ' opacity-70 pointer-events-none' : '')}
      >
          <>
            <span>{children ?? 'اطلب الآن'}</span>
            <ShoppingCart className="w-4 sm:w-5 h-4 sm:h-5 inline mr-2" />
          </>
      </button>
    </div>
  );
}