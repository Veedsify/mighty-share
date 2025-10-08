// components/SignupModal.jsx
'use client';
import { X } from 'lucide-react';

export default function SignupModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-center text-accent mb-4">Sign Up</h2>
        <form className="space-y-4">
          <input type="text" placeholder="Full Name" className="w-full px-4 py-2 border rounded" />
          <input type="email" placeholder="Email Address" className="w-full px-4 py-2 border rounded" />
          <select className="w-full px-4 py-2 border rounded">
            <option>Select Membership Option</option>
            <option>Option A (Weekly)</option>
            <option>Option B (Monthly)</option>
            <option>Option C (Fast Track)</option>
          </select>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded hover:bg-blue-600">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
