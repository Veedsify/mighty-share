"use client";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-20 bg-indigo-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-center mb-12"
        >
          Get in <span className="text-yellow-400">Touch</span>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.form
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-8 text-indigo-900"
          >
            <h3 className="text-2xl font-semibold mb-6">Send us a Message</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                placeholder="Write your message here..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-400"
              ></textarea>
            </div>
            <button className="w-full bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-semibold py-3 rounded-lg transition">
              Send Message
            </button>
          </motion.form>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-400 text-indigo-900 p-3 rounded-full">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Email</p>
                <p>support@mightyshare.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-400 text-indigo-900 p-3 rounded-full">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Phone</p>
                <p>08104208361</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-400 text-indigo-900 p-3 rounded-full">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold">Location</p>
                <p>Lagos, Nigeria</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
