import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InsuraShield - Premium Insurance Management Platform",
  description: "Automate policy creation, file claim verifications, track premium payments, and generate reporting charts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full dark`}
    >
      <body className="h-full bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
        <AuthProvider>
          <Navbar />
          <div className="flex-1 pt-16 flex flex-col">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
