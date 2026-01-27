import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planificador",
  description: "Personal Management Dashboard",
};

import { auth } from '@/auth'

// ...

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="h-full bg-gray-50" suppressHydrationWarning={true}>
      <body className={`${inter.className} h-full overflow-hidden`} suppressHydrationWarning={true}>
        <AuthProvider session={session}>
          <AppShell>
            {children}
            <Toaster />
          </AppShell>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
