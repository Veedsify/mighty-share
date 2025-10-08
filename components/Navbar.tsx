"use client";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-indigo-900 text-white shadow-md fixed top-0 left-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-yellow-400">
          Mighty Share
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-8 font-medium">
          <Link href="/" className="hover:text-yellow-400 transition">Home</Link>
          <Link href="/about" className="hover:text-yellow-400 transition">About</Link>
          <Link href="/services" className="hover:text-yellow-400 transition">Services</Link>
          <Link href="/contact" className="hover:text-yellow-400 transition">Contact</Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-yellow-400"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-indigo-800 text-white px-6 py-4 space-y-4">
          <Link href="/" className="block hover:text-yellow-400" onClick={() => setIsOpen(false)}>Home</Link>
          <Link href="/about" className="block hover:text-yellow-400" onClick={() => setIsOpen(false)}>About</Link>
          <Link href="/services" className="block hover:text-yellow-400" onClick={() => setIsOpen(false)}>Services</Link>
          <Link href="/contact" className="block hover:text-yellow-400" onClick={() => setIsOpen(false)}>Contact</Link>
        </div>
      )}
    </nav>
  );
}

