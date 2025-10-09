"use client";

import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  UserPlus,
  CreditCard,
  Landmark,
  PiggyBank,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { useDashboard } from "./DashboardProvider";
import Image from "next/image";
import { useState } from "react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, handleLogout } = useDashboard();
  const [settlementsOpen, setSettlementsOpen] = useState(false);
  const [thriftOpen, setThriftOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Add Account", href: "/dashboard/add-account", icon: UserPlus },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Transactions", href: "/dashboard/transactions", icon: CreditCard },
    {
      name: "Settlements",
      href: "/dashboard/settlements",
      icon: Landmark,
      hasDropdown: true,
      isOpen: settlementsOpen,
      toggle: () => setSettlementsOpen(!settlementsOpen),
      subItems: [
        {
          name: "Due for Clearance",
          href: "/dashboard/settlements/due-clearance",
        },
        {
          name: "All Paid Accounts",
          href: "/dashboard/settlements/paid-accounts",
        },
        {
          name: "Request Bulk Withdrawal",
          href: "/dashboard/settlements/bulk-withdrawal",
        },
        {
          name: "Next Settlement",
          href: "/dashboard/settlements/next-settlement",
        },
      ],
    },
    {
      name: "Thrift Package",
      href: "/dashboard/thrift",
      icon: PiggyBank,
      hasDropdown: true,
      isOpen: thriftOpen,
      toggle: () => setThriftOpen(!thriftOpen),
      subItems: [
        { name: "Thrift Packages", href: "/dashboard/thrift" },
        { name: "My Subscriptions", href: "/dashboard/thrift/subscriptions" },
      ],
    },
    { name: "Complaints", href: "/dashboard/complaints", icon: MessageSquare },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile sidebar toggle */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-[#1A2B88] text-white p-2 rounded-md shadow-md"
        onClick={() => setSidebarOpen(true)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed z-40 top-0 left-0 h-full w-72 bg-[#1A2B88] text-white flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo Section */}
        <div className="px-6 py-6 border-b border-white/20 flex flex-col items-center">
          <Image
            width={80}
            height={80}
            src="/mightyshare-logo.jpg"
            alt="MightyShare Logo"
            className="w-20 h-auto mb-2 rounded-full shadow-md bg-white p-2"
          />
          <h1 className="text-2xl font-bold">Mighty Share</h1>
          <button
            className="md:hidden text-white text-2xl absolute top-4 right-4"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map(
            ({
              name,
              href,
              icon: Icon,
              hasDropdown,
              isOpen,
              toggle,
              subItems,
            }) => (
              <div key={name}>
                {hasDropdown ? (
                  <>
                    <button
                      onClick={toggle}
                      className={clsx(
                        "flex items-center justify-between w-full gap-3 px-4 py-3 rounded-lg transition-colors",
                        pathname.startsWith(href)
                          ? "bg-white text-[#1A2B88] font-semibold"
                          : "hover:bg-[#00C4B4]/20 hover:text-[#00C4B4]"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        {name}
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    {isOpen && subItems && (
                      <div className="ml-8 mt-2 space-y-1">
                        {subItems.map((subItem) => (
                          <Link
                            key={subItem.name}
                            href={subItem.href}
                            className={clsx(
                              "block px-4 py-2 rounded-lg text-sm transition-colors",
                              pathname === subItem.href
                                ? "bg-white text-[#1A2B88] font-semibold"
                                : "hover:bg-[#00C4B4]/20 hover:text-[#00C4B4]"
                            )}
                            onClick={() => setSidebarOpen(false)}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={href}
                    className={clsx(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      pathname === href
                        ? "bg-white text-[#1A2B88] font-semibold"
                        : "hover:bg-[#00C4B4]/20 hover:text-[#00C4B4]"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {name}
                  </Link>
                )}
              </div>
            )
          )}
        </nav>

        {/* Logout button */}
        <div className="px-4 py-4 border-t border-white/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg bg-red-500 hover:bg-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
