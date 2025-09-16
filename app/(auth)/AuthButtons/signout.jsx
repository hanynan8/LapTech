'use client';
import React from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function SignOut() {
  return (
    <>
      <button
        className="bg-red-500 text-white px-6 py-2 rounded"
        onClick={() => signOut({ callbackUrl: '/' })}
      >
        sign Out
      </button>
    </>
  );
}
