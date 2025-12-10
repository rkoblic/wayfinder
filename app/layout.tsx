import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "Wayfinder - Curiosity-First Learning",
  description: "A curiosity-first learning platform for wandering generalists",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  );
}
