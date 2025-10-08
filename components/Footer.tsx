"use client";
import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-indigo-900 text-white py-10 mt-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Company Info */}
        <div>
          <h2 className="text-2xl font-bold text-yellow-400">Mighty Share</h2>
          <p className="mt-4 text-gray-300">
            Join our Team for Food Security today.
          </p>
          <div className="flex space-x-4 mt-6">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">
              <Facebook className="w-6 h-6" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-xl font-semibold text-yellow-400">Quick Links</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="/" className="hover:text-yellow-300">Home</a></li>
            <li><a href="/about" className="hover:text-yellow-300">About</a></li>
            <li><a href="/services" className="hover:text-yellow-300">Services</a></li>
            <li><a href="/contact" className="hover:text-yellow-300">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-xl font-semibold text-yellow-400">Contact</h3>
          <p className="mt-4 text-gray-300">Email: support@mightyshare.com</p>
          <p className="text-gray-300">Phone: 08104208361, 09137623758</p>
          <p className="text-gray-300">Location: Lagos, Nigeria</p>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-xl font-semibold text-yellow-400">Stay Updated</h3>
          <p className="mt-4 text-gray-300">
            Subscribe to our newsletter for updates.
          </p>
          <form className="mt-4 flex">
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-3 py-2 rounded-l-lg focus:outline-none text-gray-900"
            />
            <button
              type="submit"
              className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 px-4 py-2 rounded-r-lg font-semibold"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <div className="mt-10 text-center text-gray-400 text-sm border-t border-gray-700 pt-6">
        © {new Date().getFullYear()} Mighty Share. All Rights Reserved.  
      </div>
    </footer>
  );
}

