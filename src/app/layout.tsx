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
  title: "Pipeline AI - Content That Makes You The Obvious Choice",
  description: "Done-for-you social media campaigns, reels, carousels, and branded marketing assets customized for your business. Your logo, your brand, your message.",
  keywords: "social media content, business marketing, carousel campaigns, reels, branded content, content creation",
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: "Pipeline AI - Content That Makes You The Obvious Choice",
    description: "Done-for-you social media campaigns customized for your business",
    url: "https://getpipelineai.com",
    siteName: "Pipeline AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pipeline AI - Content That Makes You The Obvious Choice",
    description: "Done-for-you social media campaigns customized for your business",
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
