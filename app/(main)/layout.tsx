import "../globals.css";
import { SessionProvider } from "./auth/Provider";
import type { Metadata } from "next";

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
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
