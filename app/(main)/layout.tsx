import "@fontsource-variable/inter";
import "../globals.css";
import { SessionProvider } from "./auth/Provider";
import type { Metadata } from "next";
import { Suspense } from "react";
import { LucideLoader } from "lucide-react";

export const metadata: Metadata = {
  title: "MightyShare",
  description: "MightyShare App powered by Next.js + Prisma + PostgreSQL",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        <Suspense
          fallback={<LucideLoader className="animate-spin" size={40} />}
        >
          <SessionProvider>{children}</SessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
