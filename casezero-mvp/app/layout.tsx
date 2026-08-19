import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseZero — FCR Intelligence",
  description: "FCR intelligence for AI-assisted support operations, ServiceNow measurement, and governed remediation.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
