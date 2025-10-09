"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  LucideLoader,
} from "lucide-react";

interface Subscription {
  id: number;
  packageName: string;
  amountInvested: number;
  startDate: string;
  endDate: string;
  status: string;
  expectedReturn: number;
  actualReturn?: number;
  duration: number;
  profitPercentage: number;
}

export default function ThriftSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const response = await fetch("/api/thrift/subscriptions");
        const data = await response.json();

        if (data.subscriptions) {
          setSubscriptions(data.subscriptions);
        }
      } catch (error) {
        console.error("Error fetching subscriptions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (filter === "all") return true;
    return sub.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Active
          </span>
        );
      case "completed":
        return (
          <span className="flex items-center gap-1 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
            <CheckCircle className="w-4 h-4" />
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
            <XCircle className="w-4 h-4" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressPercentage = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();

    if (now >= end) return 100;
    if (now <= start) return 0;

    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const totalInvested = subscriptions.reduce(
    (sum, sub) => sum + sub.amountInvested,
    0
  );
  const totalExpectedReturn = subscriptions.reduce(
    (sum, sub) => sum + sub.expectedReturn,
    0
  );
  const activeSubscriptions = subscriptions.filter(
    (sub) => sub.status === "active"
  ).length;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A2B88] mb-2">
          My Thrift Subscriptions
        </h1>
        <p className="text-gray-600">
          Track and manage your active and completed thrift package
          subscriptions
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Subscriptions</p>
          <p className="text-2xl font-bold text-[#1A2B88]">
            {subscriptions.length}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Active Plans</p>
          <p className="text-2xl font-bold text-green-600">
            {activeSubscriptions}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total Invested</p>
          <p className="text-2xl font-bold text-purple-600">
            ₦{totalInvested.toLocaleString()}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Expected Returns</p>
          <p className="text-2xl font-bold text-orange-600">
            ₦{totalExpectedReturn.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "all"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "active"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "completed"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter("cancelled")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === "cancelled"
              ? "bg-[#1A2B88] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Subscriptions List */}
      {loading ? (
        <div className="text-center py-12">
          <LucideLoader
            className="inline-block animate-spin  text-[#1A2B88]"
            size={32}
          />
          <p className="mt-4 text-gray-600">Loading subscriptions...</p>
        </div>
      ) : filteredSubscriptions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No subscriptions found</p>
          <p className="text-gray-400 text-sm mt-2">
            Subscribe to a thrift package to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSubscriptions.map((subscription) => {
            const progress = getProgressPercentage(
              subscription.startDate,
              subscription.endDate
            );
            const daysRemaining = getDaysRemaining(subscription.endDate);

            return (
              <div
                key={subscription.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
              >
                {/* Card Header */}
                <div className="bg-[#1A2B88] p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold">
                        {subscription.packageName}
                      </h3>
                      <p className="text-sm opacity-90">
                        {subscription.duration} weeks plan
                      </p>
                    </div>
                    {getStatusBadge(subscription.status)}
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-lg font-semibold">
                      {subscription.profitPercentage}% Profit
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Investment Details */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Amount Invested
                      </p>
                      <p className="text-xl font-bold text-[#1A2B88]">
                        ₦{subscription.amountInvested.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Expected Return
                      </p>
                      <p className="text-xl font-bold text-green-600">
                        ₦{subscription.expectedReturn.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {new Date(subscription.startDate).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">
                        {new Date(subscription.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {subscription.status === "active" && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-semibold text-[#1A2B88]">
                          {progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#00C4B4] h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{daysRemaining} days remaining</span>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 bg-[#1A2B88] text-white py-2 rounded-lg hover:bg-[#152270] transition-colors text-sm font-semibold">
                      View Details
                    </button>
                    {subscription.status === "active" && (
                      <button className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-semibold">
                        Manage
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
