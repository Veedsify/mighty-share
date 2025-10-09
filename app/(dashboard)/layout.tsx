import "@fontsource-variable/inter";
import { redirect } from "next/navigation";
import { DashboardProvider } from "../../components/DashboardProvider";
import DashboardSidebar from "../../components/DashboardSidebar";
import DashboardHeader from "../../components/DashboardHeader";
import "../globals.css";
import axios from "axios";
import { cookies } from "next/headers";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "MightyShare",
  description: "MightyShare App powered by Next.js + Prisma + PostgreSQL",
};

async function getUser() {
  try {
    // Try to fetch from API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const token = cookies().get("token")?.value;
    if (!token) {
      return redirect("/login");
    }
    const res = await axios.get(`${baseUrl}/api/auth/me`, {
      withCredentials: true,
      headers: {
        "Cache-Control": "no-store",
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.data?.user) {
      return res.data.user;
    }
    // If API fails, return null (client will handle localStorage fallback)
    return null;
  } catch (error) {
    // console.error("Error fetching user:", error);
    return null;
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  return (
    <html>
      <body>
        <DashboardProvider initialUser={user}>
          <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />
            <main className="flex-1 md:ml-72 p-6">
              <DashboardHeader />
              {children}
            </main>
          </div>
        </DashboardProvider>
      </body>
    </html>
  );
}
