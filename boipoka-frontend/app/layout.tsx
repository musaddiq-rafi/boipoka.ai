import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import OfflinePopup from "@/components/OfflinePopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BoiPoka | Your Book Companion",
  description: "Discover, read, and share books on BoiPoka.",
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "BoiPoka",
    title: {
      default: "BoiPoka | Your Book Companion",
      template: "%s - BoiPoka",
    },
    description: "Discover, read, and share books on BoiPoka.",
  },
  twitter: {
    card: "summary",
    title: {
      default: "BoiPoka | Your Book Companion",
      template: "%s - BoiPoka",
    },
    description: "Discover, read, and share books on BoiPoka.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="description" content="Discover, read, and share books on BoiBritto" />
        <meta name="theme-color" content="#7c3aed" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={geistSans.className}>
        <OfflinePopup />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
