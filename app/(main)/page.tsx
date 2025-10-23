// app/page.js
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Calendar,
  Gift,
  DollarSign,
  Apple,
  Users,
  Mail,
  PhoneCall,
  Map,
  MessageCircle,
  Menu,
  X,
  Twitter,
  Instagram,
  Facebook,
} from "lucide-react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

// ===== Mock Authentication (localStorage) =====
const mockUsers: any =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("mockUsers") || "{}")
    : {};
const mockSessions: any =
  typeof window !== "undefined"
    ? JSON.parse(localStorage.getItem("mockSessions") || "{}")
    : {};

interface FormData {
  name: string;
  email: string;
  message: string;
  website: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

interface Status {
  type: string;
  message: string;
}

interface WalletData {
  balance: number;
  plan: string;
  rewards: number;
}

export default function Home() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<Status>({ type: "", message: "" });

  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    plan: "None",
    rewards: 0,
  });
  const router = useRouter();

  useEffect(() => {
    const session = mockSessions.current;
    if (session && session.userId) {
      const user = mockUsers[session.userId] || {
        balance: 0,
        plan: "None",
        rewards: 0,
      };
      setWalletData({
        balance: user.balance || 0,
        plan: user.plan || "None",
        rewards: user.rewards || 0,
      });
    } else {
      setWalletData({ balance: 0, plan: "None", rewards: 0 });
    }
  }, []);

  const validateContact = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required.";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email))
        newErrors.email = "Enter a valid email.";
    }
    if (!formData.message.trim()) newErrors.message = "Message is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors])
      setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    if (!validateContact()) return;
    setSubmitting(true);
    setTimeout(() => {
      setStatus({
        type: "success",
        message: "Thanks! Your message has been sent.",
      });
      setFormData({ name: "", email: "", message: "", website: "" });
      setSubmitting(false);
    }, 900);
  };

  const handleTopUp = () => {
    alert(
      "Wema ALAT integration pending. Contact gamingunit@wemabank.com for channelId and sourceAccountNumber."
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ===== Navbar ===== */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src="/mightyshare-logo.jpg"
              alt="Mighty Share Logo"
              className="w-8 h-8"
            />
            <div className="text-2xl font-bold text-white">Mighty Share</div>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-white hover:text-[#00C4B4] transition"
            >
              Home
            </Link>
            <Link
              href="#about"
              className="text-white hover:text-[#00C4B4] transition"
            >
              About
            </Link>
            <Link
              href="#features"
              className="text-white hover:text-[#00C4B4] transition"
            >
              Features
            </Link>
            <Link
              href="#membership"
              className="text-white hover:text-[#00C4B4] transition"
            >
              Membership
            </Link>
            <Link
              href="#testimonials"
              className="text-white hover:text-[#00C4B4] transition"
            >
              Testimonials
            </Link>
            <Link
              href="#contact"
              className="text-white hover:text-[#00C4B4] transition"
            >
              Contact
            </Link>
            <Link
              href="/signup"
              className="bg-[#FC0FC0] text-[#1A2B88] px-4 py-2 rounded-md font-semibold hover:bg-[#00C4B4] hover:text-white transition"
            >
              Join Us
            </Link>
            <Link
              href="/login"
              className="bg-[#FC0FC0] text-[#1A2B88] px-4 py-2 rounded-md font-semibold hover:bg-[#00C4B4] hover:text-white transition"
            >
              Log In
            </Link>
          </div>

          {/* Mobile Menu */}
          <Disclosure as="div" className="md:hidden">
            {({ open }) => (
              <>
                <DisclosureButton className="p-2 focus:outline-none">
                  {open ? (
                    <X className="w-6 h-6 text-white" />
                  ) : (
                    <Menu className="w-6 h-6 text-white" />
                  )}
                </DisclosureButton>
                <DisclosurePanel className="absolute top-16 left-0 right-0 bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] shadow-md p-4 flex flex-col space-y-4">
                  <Link
                    href="/"
                    className="text-white hover:text-[#00C4B4] transition"
                  >
                    Home
                  </Link>
                  <Link
                    href="#about"
                    className="text-white hover:text-[#00C4B4] transition"
                  >
                    About
                  </Link>
                  <Link
                    href="#features"
                    className="text-white hover:text-[#00C4B4] transition"
                  >
                    Features
                  </Link>
                  <Link
                    href="#membership"
                    className="text-white hover:text-[#00C4B4] transition"
                  >
                    Membership
                  </Link>
                  <Link
                    href="#testimonials"
                    className="text-white hover:text-[#00C4B4] transition"
                  >
                    Testimonials
                  </Link>
                  <Link
                    href="#contact"
                    className="text-white hover:text-[#00C4B4] transition"
                  >
                    Contact
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-white text-[#1A2B88] px-4 py-2 rounded-md font-semibold hover:bg-[#00C4B4] hover:text-white transition"
                  >
                    Join Us
                  </Link>
                  <Link
                    href="/login"
                    className="bg-white text-[#1A2B88] px-4 py-2 rounded-md font-semibold hover:bg-[#00C4B4] hover:text-white transition"
                  >
                    Log In
                  </Link>
                </DisclosurePanel>
              </>
            )}
          </Disclosure>
        </nav>
      </header>

      <main className="flex-grow">
        {/* ===== Hero Section ===== */}
        <section className="relative flex items-center justify-center py-24 px-6 bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] text-white">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1 }}
              className="relative w-full h-96 rounded-lg overflow-hidden shadow-lg"
            >
              <Image
                src="/img2.jpg"
                alt="Happy members saving together"
                fill
                className="object-cover"
                priority
              />
            </motion.div>

            <div className="text-center md:text-left">
              <motion.h1
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="text-4xl md:text-5xl font-extrabold text-white"
              >
                Welcome to <span className="text-[#FC0FC0]">Mighty Share</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="max-w-md text-lg mb-8"
              >
                Empowering communities with financial
                stability and food incentives.
              </motion.p>
              <div className="flex gap-4 justify-center md:justify-start">
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="#membership"
                  className="bg-white text-[#1A2B88] px-6 py-3 rounded-lg shadow-lg font-semibold hover:bg-[#00C4B4] hover:text-white transition"
                >
                  Get Started
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.05 }}
                  href="#about"
                  className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#00C4B4] hover:border-[#00C4B4] transition"
                >
                  Learn More
                </motion.a>
              </div>
            </div>
          </div>
        </section>

        {/* ===== About Section ===== */}
        <section
          id="about"
          className="py-20 px-6 max-w-7xl mx-auto text-center space-y-6 bg-[#F8FAFB]"
        >
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] bg-clip-text text-transparent"
          >
            About <span className="text-[#FC0FC0]">Mighty Share</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full max-w-md mx-auto mb-6 h-64 rounded-lg overflow-hidden shadow-lg"
          >
            <Image
              src="/img6.png"
              alt="About Mighty Share"
              fill
              className="object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <p className="max-w-3xl mx-auto text-2xl text-gray-600">
              At <span className="text-[#FC0FC0]">Mighty Share</span> Charity
              Foundation, we believe that dignity begins with access and
              generosity can be mighty when shared. Founded with a mission to
              uplift underserved communities, we provide food incentives that go beyond charity. Through our food support
              programs, families and individuals receive nutritious meals and
              much needed essentials.
            </p>
          </motion.div>
        </section>
        {/* ===== Membership Options (Clickable) ===== */}
        <section id="membership" className="py-16 bg-[#F8FAFB]">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] bg-clip-text text-transparent text-center mb-12"
          >
            Membership Options
          </motion.h2>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
            {/* Option A */}
            <motion.div
              onClick={() => router.push("/signup?plan=A")}
              className="cursor-pointer bg-white/80 backdrop-blur-md shadow-md rounded-xl p-6 text-center hover:shadow-lg hover:bg-[#F8FAFB] transition"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-[#3498DB]/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Calendar className="text-[#3498DB] w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-xl font-extrabold text-[#FC0FC0] mb-2">
                Option A (Weekly)
              </h3>
              <p>
                Contribute <span className="font-semibold">₦2,400</span> weekly
                for 30 weeks and get ₦120,000 cashback with ₦25,000 foodstuff.
              Number of Accounts: Min 1 Max 100. <br/> Referral Mode: 3 Months.</p>
            </motion.div>

            {/* Option B */}
            <motion.div
              onClick={() => router.push("/signup?plan=B")}
              className="cursor-pointer bg-white/80 backdrop-blur-md shadow-md rounded-xl p-6 text-center hover:shadow-lg hover:bg-[#F8FAFB] transition"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-[#2ECC71]/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Calendar className="text-[#2ECC71] w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-xl font-extrabold text-[#FC0FC0] mb-2">
                Option B (Monthly)
              </h3>
              <p>
                Contribute <span className="font-semibold">₦10,000</span>{" "}
                monthly for 7 months and get ₦120,000 cashback with ₦30,000
                foodstuff.
              Number of Accounts: Min 1 Max 500. <br/> Referral Mode: 3 Months.</p>
            </motion.div>

            {/* Option C */}
            <motion.div
              onClick={() => router.push("/signup?plan=C")}
              className="cursor-pointer bg-white/80 backdrop-blur-md shadow-md rounded-xl p-6 text-center hover:shadow-lg hover:bg-[#F8FAFB] transition"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-[#E74C3C]/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Calendar className="text-[#E74C3C] w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-xl font-extrabold text-[#FC0FC0] mb-2">
                Option C (Fast Track)
              </h3>
              <p>
                Contribute <span className="font-semibold">₦70,000</span> once
                and get ₦120,000 cashback in 6 months with ₦30,000 foodstuff.
              Number of Accounts: Min 10 Max 1000. <br/> Referral Mode: 2 Months.</p>
            </motion.div>
          </div>

          <p className="text-center mt-8 text-[#1A2B88] font-bold">
            To become a member, pay a registration fee of ₦2,500 only.
          </p>
        </section>
        {/* ===== Features & Benefits ===== */}
        <section id="features" className="py-16 bg-[#F8FAFB]">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] bg-clip-text text-transparent text-center mb-12"
          >
            Features & Benefits
          </motion.h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
            {/* Membership Card */}
            <motion.div
              className="bg-white/80 backdrop-blur-md shadow-md rounded-xl p-6 text-center hover:shadow-lg transition-colors hover:bg-gradient-to-br from-[#F8FAFB] to-[#00DDEB]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Wallet className="text-[#FF5733] w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-xl font-extrabold text-[#1A2B88] mb-2">
                Membership Card
              </h3>
              <p className="text-gray-600 mb-4">
                Be a registered Member with a dedicated Portal.
              
              </p>
              <div className="bg-[#F8FAFB] p-4 rounded-lg">
                <p className="font-semibold text-[#00C4B4]">
                  Current Status: {walletData.balance.toFixed(2)}
                </p>
                <button
                  onClick={handleTopUp}
                  className="mt-2 bg-gradient-to-r from-[#FC0FC0] to-[#FC0FC0] text-white px-4 py-2 rounded-md hover:from-[#00DDEB] hover:to-[#1A2B88] transition"
                >
                  Add Up
                </button>
              </div>
            </motion.div>

            {/* Thrift Card */}
            <motion.div
              className="bg-white/80 backdrop-blur-md shadow-md rounded-xl p-6 text-center hover:shadow-lg transition-colors hover:bg-gradient-to-br from-[#F8FAFB] to-[#00C4B4]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Calendar className="text-[#3498DB] w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-xl font-extrabold text-[#1A2B88] mb-2">
                Community Plans
              </h3>
              <p className="text-gray-600 mb-4">
                Join Member groups with
                rewards.
              </p>
              <div className="bg-[#F8FAFB] p-4 rounded-lg">
                <p className="font-semibold text-[#00C4B4]">
                  Active Plan: {walletData.plan}
                </p>
                <button className="mt-2 bg-gradient-to-r from-[#FC0FC0] to-[#FC0FC0] text-white px-4 py-2 rounded-md hover:from-[#00DDEB] hover:to-[#00DDEB] transition">
                  Join Plan
                </button>
              </div>
            </motion.div>

            {/* Rewards Card */}
            <motion.div
              className="bg-white/80 backdrop-blur-md shadow-md rounded-xl p-6 text-center hover:shadow-lg transition-colors hover:bg-gradient-to-br from-[#F8FAFB] to-[#00C4B4]"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="bg-white/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Gift className="text-[#2ECC71] w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-xl font-extrabold text-[#1A2B88] mb-2">
                Food Incentives
              </h3>
              <p className="text-gray-600 mb-4">
                Earn foodstuff rewards based on your contributions and
                milestones.
              </p>
              <div className="bg-[#F8FAFB] p-4 rounded-lg">
                <p className="font-semibold text-[#00C4B4]">
                  Rewards Earned: ₦{walletData.rewards.toFixed(0)}
                </p>
                <button className="mt-2 bg-gradient-to-r from-[#FC0FC0] to-[#FC0FC0] text-white px-4 py-2 rounded-md hover:from-[#00DDEB] hover:to-[#1A2B88] transition">
                  Claim Reward
                </button>
              </div>
            </motion.div>
          </div>
          <p className="text-center mt-8 text-gray-600">
            Sign
            up to access your personalized portal.
          </p>
        </section>

        {/* ===== Why Join Section ===== */}
        <section className="py-16 bg-[#F8FAFB] text-gray-600">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] bg-clip-text text-transparent text-center mb-12"
          >
            Why Join <span className="text-[#FF00FF]">Mighty Share</span>
          </motion.h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-6">
            <motion.div
              className="bg-white/20 backdrop-blur-md shadow-md rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <DollarSign className="w-8 h-8 mx-auto mb-4 text-[#E74C3C]" />
              <h3 className="text-xl font-extrabold text-[#1A2B88] mb-2">
                Financial Empowerment
              </h3>
              <p>
                Earn cashback and build.
              </p>
            </motion.div>
            <motion.div
              className="bg-white/20 backdrop-blur-md shadow-md rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Apple className="w-8 h-8 mx-auto mb-4 text-[#9B59B6]" />
              <h3 className="text-xl font-extrabold text-[#1A2B88] mb-2">
                Food Incentives
              </h3>
              <p>Get nutritious food rewards for your contributions.</p>
            </motion.div>
            <motion.div
              className="bg-white/20 backdrop-blur-md shadow-md rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Users className="w-8 h-8 mx-auto mb-4 text-[#F1C40F]" />
              <h3 className="text-xl font-extrabold text-[#1A2B88] mb-2">
                Community Support
              </h3>
              <p>Join a network that uplifts underserved communities.</p>
            </motion.div>
          </div>
        </section>

        {/* ===== Testimonials Section ===== */}
        <section
          id="testimonials"
          className="relative py-16 text-white overflow-hidden"
        >
          {/* Background image */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/img5.jpg"
              alt="Happy community"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-3xl font-extrabold text-center mb-12"
            >
              What Our Members Say
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div
                className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-md text-center"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <p className="mb-4">
                  "Mighty Share has transformed my family's financial stability.
                  The food incentives are a
                  blessing!"
                </p>
                <p className="font-semibold text-[#191970]">
                  - Adeola Johnson, Lagos
                </p>
              </motion.div>
              <motion.div
                className="bg-white/20 backdrop-blur-md p-6 rounded-xl shadow-md text-center"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <p className="mb-4">
                  "
                   Highly recommend!"
                </p>
                <p className="font-semibold text-[#191970]">
                  - Chinedu Okoro, Abuja
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        {/* ===== Featured Member Section ===== */}
        <section className="py-16 bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] text-white">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-extrabold text-center mb-12"
          >
            Featured Member of the Month
          </motion.h2>
          <div className="max-w-7xl mx-auto px-6 text-center">
            <motion.div
              className="inline-block bg-white/20 backdrop-blur-md shadow-md rounded-xl p-6 max-w-md mx-auto transition-colors"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-[#E74C3C]/20 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <Users className="text-[#FC0FC0] w-8 h-8 mx-auto" />
              </div>
              <h3 className="text-xl font-extrabold text-[#FC0FC0] mb-2">
                Yetunde Boluwatife
              </h3>
              <p className="text-white">
                Consistent member with Option C plan. Achieved ₦120,000 cashback
                and foodstuff rewards!
              </p>
            </motion.div>
          </div>
        </section>

        {/* ===== Contact Section ===== */}
        <section id="contact" className="py-16 bg-[#F8FAFB]">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] bg-clip-text text-transparent text-center mb-12"
          >
            Get In Touch
          </motion.h2>
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6">
            {/* Left: Form */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-white/80 backdrop-blur-md shadow-md rounded-xl p-6">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={handleContactChange}
                    autoComplete="off"
                    className="hidden"
                    tabIndex={-1}
                  />
                  <label className="block">
                    <span className="text-gray-700">Name</span>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleContactChange}
                      placeholder="Your full name"
                      className={`mt-1 block w-full border rounded-lg shadow-sm focus:ring-[#00C4B4] focus:border-[#00C4B4] ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-gray-700">Email</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleContactChange}
                      placeholder="you@example.com"
                      className={`mt-1 block w-full border rounded-lg shadow-sm focus:ring-[#00C4B4] focus:border-[#00C4B4] ${
                        errors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.email}
                      </p>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-gray-700">Message</span>
                    <textarea
                      rows={4}
                      name="message"
                      value={formData.message}
                      onChange={handleContactChange}
                      placeholder="Write your message here..."
                      className={`mt-1 block w-full border rounded-lg shadow-sm focus:ring-[#00C4B4] focus:border-[#00C4B4] ${
                        errors.message ? "border-red-500" : "border-gray-300"
                      }`}
                      required
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.message}
                      </p>
                    )}
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`bg-gradient-to-r from-[#FC0FC0] to-[#FC0FC0] text-[#1A2B88] px-6 py-2 rounded-lg font-semibold shadow hover:from-[#00DDEB] hover:to-[#1A2B88] transition ${
                      submitting ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>

                  <div className="min-h-[1.5rem]">
                    {status.type === "success" && (
                      <p className="text-[#00C4B4] font-medium">
                        {status.message}
                      </p>
                    )}
                    {status.type === "error" && (
                      <p className="text-red-600 font-medium">
                        {status.message}
                      </p>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Right: Contact info */}
            <motion.div
              className="space-y-6"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center text-gray-600">
                <Mail className="w-6 h-6 text-[#8A2BE2] mr-3" />
                <span>support@mightyshare.com</span>
              </div>
              <div className="flex items-center text-gray-600">
                <PhoneCall className="w-6 h-6 text-[#DC143C] mr-3" />
                <span>08104208361, 09137623758</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Map className="w-6 h-6 text-[#20B2AA] mr-3" />
                <span>
                  No 2 Ifoshi Road, Iyana Ejigbo, Inside Morouf Filling Station
                </span>
              </div>
              <div className="flex items-center">
                <a
                  href="https://wa.me/2348104208361?text=Hello%20from%20Mighty%20Share"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center bg-[#F8FAFB] text-[#1A2B88] px-4 py-2 rounded-lg shadow hover:bg-[#00C4B4] hover:text-white transition"
                >
                  <MessageCircle className="w-6 h-6 mr-2 text-[#ADFF2F]" /> Chat
                  with Us
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer className="bg-gradient-to-r from-[#1A2B88] to-[#00DDEB] text-white py-8 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <img
                src="/mightyshare-logo.jpg"
                alt="Mighty Share Logo"
                className="w-6 h-6"
              />
              <h3 className="text-lg font-bold text-[#FC0FC0]">Mighty Share</h3>
            </div>
            <p className="text-sm">
              Empowering communities through food
              incentives.
            </p>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#FC0FC0]">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-[#00C4B4] transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-[#00C4B4] transition">
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="#features"
                  className="hover:text-[#00C4B4] transition"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#membership"
                  className="hover:text-[#00C4B4] transition"
                >
                  Membership
                </Link>
              </li>
              <li>
                <Link
                  href="#testimonials"
                  className="hover:text-[#00C4B4] transition"
                >
                  Testimonials
                </Link>
              </li>
              <li>
                <Link
                  href="#contact"
                  className="hover:text-[#00C4B4] transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#FC0FC0]">Contact Us</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-2 text-[#8A2BE2]" />
                <span>support@mightyshare.com</span>
              </div>
              <div className="flex items-center">
                <PhoneCall className="w-5 h-5 mr-2 text-[#DC143C]" />
                <span>08104208361, 09137623758</span>
              </div>
              <div className="flex items-center">
                <Map className="w-5 h-5 mr-2 text-[#20B2AA]" />
                <span>
                  No 2 Ifoshi Road, Iyana Ejigbo, Inside Morouf Filling Station
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-[#FC0FC0]">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://wa.me/2348104208361"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00C4B4] transition"
              >
                <MessageCircle className="w-6 h-6 text-[#ADFF2F]" />
              </a>
              <a
                href="https://twitter.com/mightyshare"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00C4B4] transition"
              >
                <Twitter className="w-6 h-6 text-[#FF4500]" />
              </a>
              <a
                href="https://instagram.com/mightyshare"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00C4B4] transition"
              >
                <Instagram className="w-6 h-6 text-[#BA55D3]" />
              </a>
              <a
                href="https://facebook.com/mightyshare"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#00C4B4] transition"
              >
                <Facebook className="w-6 h-6 text-[#4682B4]" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}





