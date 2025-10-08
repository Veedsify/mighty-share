export default function Testimonials() {
  const testimonials = [
    { name: "John Doe", text: "Mighty-Share transformed our business!" },
    { name: "Jane Smith", text: "Professional and reliable team." },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Clients Say</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {testimonials.map((t, i) => (
            <div key={i} className="p-6 border rounded-xl shadow hover:shadow-lg transition">
              <p className="italic mb-4">“{t.text}”</p>
              <h4 className="font-bold">{t.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
