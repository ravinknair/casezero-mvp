import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CaseZero AI — Incident Resolution",
  description: "Six evidence-driven resolution workflows spanning incidents, security, data, infrastructure, and customer operations.",
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
