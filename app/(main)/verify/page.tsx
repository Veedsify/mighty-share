
// app/verify/page.js
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Verify() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard after a brief confirmation
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-lime-400 to-white">
      <motion.div
        className="bg-white/80 backdrop-blur-md p-8 rounded-lg shadow-lg max-w-md text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-teal-600 mb-4">Welcome to Mighty Share!</h2>
        <p className="text-gray-600">Your account is ready. Redirecting to your dashboard...</p>
      </motion.div>
    </div>
  );
}