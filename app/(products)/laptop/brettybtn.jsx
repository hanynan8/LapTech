"use client";
import { useRouter } from 'next/navigation';
import React from 'react';

export default function RetryButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.refresh()}
      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full"
    >
      إعادة المحاولة
    </button>
  );
}
