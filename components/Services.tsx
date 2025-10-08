"use client";
import { motion } from "framer-motion";
import { Briefcase, Globe, Code, Headset } from "lucide-react";

const services = [
  {
    title: "Business Solutions",
    desc: "Helping your business scale efficiently.",
    icon: <Briefcase className="w-8 h-8 text-indigo-900" />,
  },
  {
    title: "Global Reach",
    desc: "Expand across borders with ease.",
    icon: <Globe className="w-8 h-8 text-indigo-900" />,
  },
  {
    title: "Tech Development",
    desc: "Custom software and app solutions.",
    icon: <Code className="w-8 h-8 text-indigo-900" />,
  },
  {
    title: "24/7 Support",
    desc: "Always here to help when you need it.",
    icon: <Headset className="w-8 h-8 text-indigo-900" />,
  },
];

export default function Services() {
  return (
    <section id="services" className="py-20 bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold text-indigo-900 mb-12"
        >
          Our <span className="text-yellow-500">Services</span>
        </motion.h2>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2, duration: 0.8 }}
              className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition group"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-6 group-hover:scale-110 transition">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-indigo-900 mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

