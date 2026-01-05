import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planificador",
  description: "Personal Management Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50" suppressHydrationWarning={true}>
      <body className={`${inter.className} h-full overflow-hidden flex`} suppressHydrationWarning={true}>
        {/* Sidebar */}
        <Suspense fallback={<div className="w-64 h-full bg-white/50 border-r" />}>
          <Sidebar />
        </Suspense>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
