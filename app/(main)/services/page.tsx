export default function ServicesPage() {
  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold text-blue-800 text-center">
        Our Services
      </h1>
      <div className="grid md:grid-cols-3 gap-8 mt-10">
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-blue-700">Business Consulting</h3>
          <p className="mt-3 text-gray-600">
            Strategic advice to help you streamline operations and maximize
            growth potential.
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-blue-700">Technology Solutions</h3>
          <p className="mt-3 text-gray-600">
            Web and mobile applications, automation, and modern software to
            power your business.
          </p>
        </div>
        <div className="bg-white shadow-lg rounded-lg p-6 hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-blue-700">Training & Support</h3>
          <p className="mt-3 text-gray-600">
            Hands-on training and reliable support to keep your systems running
            smoothly.
          </p>
        </div>
      </div>
    </div>
  );
}
