import type { Metadata } from "next";
import localFont from "next/font/local";
import { MainNav } from "@/components/nav";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: {
    default: 'GovHub - AI-Powered Government Contract Search',
    template: '%s | GovHub'
  },
  description: 'Browse and analyze government contracts with AI assistance. A learning project exploring modern web development and AI capabilities.',
  authors: [{ name: 'JZhang2024' }],
  creator: 'JZhang2024',
  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <MainNav />
        <div className="flex-1">
          {children}
        </div>
      </body>
    </html>
  );
}
