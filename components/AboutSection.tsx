export default function AboutSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto grid md:grid-cols-2 gap-10 px-6 items-center">
        <img src="/about.jpg" alt="About" className="rounded-2xl shadow-lg" />
        <div>
          <h2 className="text-3xl font-bold text-blue-900 mb-6">About Us</h2>
          <p className="text-gray-700 mb-4">
            At Noble Merry, we are driven by a passion for innovation and a
            commitment to excellence. We deliver world-class solutions that
            empower organizations to grow, adapt, and thrive.
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Proven expertise in business and technology</li>
            <li>Dedicated team of skilled professionals</li>
            <li>Client-centered approach with 24/7 support</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
