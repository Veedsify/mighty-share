export default function ContactPage() {
  return (
    <div className="container mx-auto py-16 px-6">
      <h1 className="text-4xl font-bold text-blue-800 text-center">
        Contact Us
      </h1>
      <p className="text-gray-600 text-center mt-4">
        Have questions? We’d love to hear from you.
      </p>

      <form className="max-w-lg mx-auto mt-10 bg-white shadow-lg rounded-lg p-8 space-y-4">
        <div>
          <label className="block text-left text-gray-700">Name</label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="block text-left text-gray-700">Email</label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-left text-gray-700">Message</label>
          <textarea
            rows={4}
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-500"
            placeholder="Write your message here..."
          ></textarea>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-800"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
