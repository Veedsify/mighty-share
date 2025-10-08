export default function About() {
  return (
    <main className="py-20 px-6 bg-gray-50">
      <div className="container mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-6">About Us</h1>
        <p className="text-lg text-gray-700 mb-8">
          At <span className="font-semibold">Noble Merry</span>, we are driven by
          a passion for innovation and a commitment to excellence. Since our
          founding, we’ve been dedicated to delivering world-class business and
          technology solutions that empower organizations to grow, adapt, and
          thrive in the modern world.
        </p>

        <div className="grid md:grid-cols-2 gap-8 text-left">
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold text-blue-800 mb-3">
              Our Mission
            </h2>
            <p>
              To provide cutting-edge solutions that drive transformation and
              create sustainable value for businesses worldwide.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold text-blue-800 mb-3">
              Our Vision
            </h2>
            <p>
              To become a global leader in technology and innovation, known for
              excellence, reliability, and customer-first values.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-blue-800 mb-4">
            Why Choose Us?
          </h2>
          <ul className="list-disc list-inside text-left mx-auto max-w-2xl text-gray-700 space-y-2">
            <li>Proven expertise in business and technology solutions</li>
            <li>Dedicated team of skilled professionals</li>
            <li>Client-centered approach with 24/7 support</li>
            <li>Innovative strategies for long-term growth</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
