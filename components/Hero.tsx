"use client";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 text-white min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-[url('/hero-bg.png')] bg-cover bg-center opacity-10"></div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
        >
          Welcome to <span className="text-yellow-400">Mighty Share</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-200 mb-8"
        >
          Innovative solutions for your digital world.  
          We craft tools that empower businesses and individuals to thrive.
        </motion.p>

        {/* Call to Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="flex justify-center space-x-4"
        >
          <Link
            href="/services"
            className="bg-yellow-400 text-indigo-900 font-semibold px-6 py-3 rounded-lg shadow-lg hover:bg-yellow-300 transition"
          >
            Get Started
          </Link>
          <Link
            href="/about"
            className="border border-yellow-400 text-yellow-400 font-semibold px-6 py-3 rounded-lg hover:bg-yellow-400 hover:text-indigo-900 transition"
          >
            Learn More
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

