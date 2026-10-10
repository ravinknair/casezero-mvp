import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseZero — FCR Intelligence",
  description: "FCR intelligence for AI-assisted support operations, ServiceNow measurement, and governed remediation.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/casezero-icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/casezero-icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/casezero-icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
