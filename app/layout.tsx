import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MockTest AI - JEE Physics Preparation",
  description: "AI-powered mock tests for JEE Main Physics preparation with adaptive learning and personalized question generation",
  keywords: "JEE, Physics, Mock Tests, AI, Exam Preparation, JEE Main, NEET",
  authors: [{ name: "MockTest AI" }],
  openGraph: {
    title: "MockTest AI - JEE Physics Preparation",
    description: "Master JEE Physics with AI-generated mock tests",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
