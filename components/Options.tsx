export default function Options() {
  return (
    <section id="options" className="py-16 bg-gray-100 text-center">
      <h2 className="text-3xl font-bold mb-10 text-primary">How We Operate</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
        
        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-secondary mb-4">Option A (Weekly)</h3>
          <p>Contribute ₦2,400 weekly for 30 weeks.</p>
          <p className="font-semibold mt-2">Get ₦120,000 + foodstuff worth ₦25,000</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-secondary mb-4">Option B (Monthly)</h3>
          <p>Contribute ₦10,000 monthly for 7 months.</p>
          <p className="font-semibold mt-2">Get ₦120,000 + foodstuff worth ₦30,000</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition">
          <h3 className="text-xl font-bold text-secondary mb-4">Option C (Fast Track)</h3>
          <p>Contribute ₦70,000 once.</p>
          <p className="font-semibold mt-2">Get ₦120,000 + foodstuff worth ₦30,000 in 6 months</p>
        </div>
      </div>

      <p className="mt-10 text-lg">
        To become a <span className="font-bold text-secondary">Member</span>, pay a registration fee of only <span className="text-accent font-bold">₦2,500</span>.
      </p>
    </section>
  );
}
