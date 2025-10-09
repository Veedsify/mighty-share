"use client";

import { useEffect, useState } from "react";
import { CheckCircle, Clock, LucideLoader, TrendingUp } from "lucide-react";
import axios from "axios";

interface ThriftPackage {
  id: number;
  name: string;
  price: number;
  duration: number;
  profitPercentage: number;
  description: string;
  terms: string;
  isActive: boolean;
  features: string[];
}

export default function ThriftPage() {
  const [packages, setPackages] = useState<ThriftPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const { data } = await axios.get("/api/thrift/packages", {
          withCredentials: true,
        });

        if (data.packages) {
          setPackages(data.packages);
        }
      } catch (error) {
        console.error("Error fetching thrift packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleSubscribe = (packageId: number, packageName: string) => {
    // TODO: Implement subscription logic
    alert(`Subscribing to ${packageName} package...`);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A2B88] mb-2">
          Thrift Packages
        </h1>
        <p className="text-gray-600">
          Choose a savings plan that works best for you. Grow your wealth with
          our flexible thrift packages.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <LucideLoader
            className="inline-block animate-spin  text-[#1A2B88]"
            size={32}
          />
          <p className="mt-4 text-gray-600">Loading packages...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 overflow-hidden border border-gray-200"
            >
              {/* Package Header */}
              <div className="bg-[#1A2B88] p-6 text-white">
                <h2 className="text-2xl font-bold mb-2">{pkg.name}</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    ₦{pkg.price.toLocaleString()}
                  </span>
                </div>
                <p className="text-sm mt-2 opacity-90">Starting investment</p>
              </div>

              {/* Package Details */}
              <div className="p-6">
                {/* Profit Badge */}
                <div className="mb-4 flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-bold text-lg">
                    {pkg.profitPercentage}% Profit
                  </span>
                </div>

                {/* Duration */}
                <div className="mb-4 flex items-center gap-2 text-gray-700">
                  <Clock className="w-5 h-5 text-[#1A2B88]" />
                  <span className="font-semibold">
                    {pkg.duration} weeks duration
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {pkg.description}
                </p>

                {/* Features */}
                <div className="space-y-2 mb-6">
                  {pkg.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#00C4B4] mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Terms */}
                <p className="text-xs text-gray-500 italic mb-4">{pkg.terms}</p>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleSubscribe(pkg.id, pkg.name)}
                    className="w-full bg-[#00C4B4] text-white py-3 rounded-lg font-semibold hover:bg-[#00a89c] transition-colors"
                  >
                    Subscribe Now
                  </button>
                  <button className="w-full border border-[#1A2B88] text-[#1A2B88] py-2 rounded-lg font-semibold hover:bg-[#1A2B88] hover:text-white transition-colors">
                    Read More
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Additional Info Section */}
      <div className="mt-12 bg-blue-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-[#1A2B88] mb-3">
          Why Choose Our Thrift Packages?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold text-[#1A2B88] mb-2">
              Secure Investment
            </h4>
            <p className="text-sm text-gray-600">
              Your savings are protected with bank-level security and insurance
              coverage.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#1A2B88] mb-2">
              Flexible Terms
            </h4>
            <p className="text-sm text-gray-600">
              Choose from various durations and contribution frequencies that
              suit your lifestyle.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-[#1A2B88] mb-2">High Returns</h4>
            <p className="text-sm text-gray-600">
              Enjoy competitive profit percentages that help you achieve your
              financial goals faster.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
