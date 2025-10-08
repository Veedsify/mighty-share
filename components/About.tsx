"use client";
import { motion } from "framer-motion";

export default function About() {
  return (
    <section id="about" className="py-20 bg-white text-indigo-900">
      <div className="max-w-6xl mx-auto px-6 text-center">
        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          About <span className="text-yellow-500">Mighty Share</span>
        </motion.h2>

        {/* Text */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
        >
          At Mighty Share, we are committed to creating{" "}
          <span className="font-semibold text-indigo-700">
            powerful digital tools
          </span>{" "}
          that help businesses and individuals thrive in today’s fast-moving
          world. Our solutions are{" "}
          <span className="font-semibold text-yellow-500">tailored</span> to
          meet your unique needs, ensuring{" "}
          <span className="font-semibold text-indigo-700">growth</span>,{" "}
          <span className="font-semibold text-indigo-700">scalability</span>, and{" "}
          <span className="font-semibold text-indigo-700">efficiency</span>{" "}
          every step of the way.
        </motion.p>
      </div>
    </section>
  );
}

