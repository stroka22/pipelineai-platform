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
  title: "Pipeline AI - Premium Social Media Content for Local Service Businesses",
  description: "Done-for-you social media campaigns, reels, carousels, and branded marketing assets for local service businesses. Customized with your logo, phone, and service area.",
  keywords: "social media content, pest control marketing, local service marketing, carousel campaigns, reels, branded content",
  openGraph: {
    title: "Pipeline AI - Premium Social Media Content",
    description: "Done-for-you social media campaigns for local service businesses",
    url: "https://getpipelineai.com",
    siteName: "Pipeline AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pipeline AI - Premium Social Media Content",
    description: "Done-for-you social media campaigns for local service businesses",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
