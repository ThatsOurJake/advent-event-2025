import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jakes Advent Event 2025",
  description: "An Advent event for 2025",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${openSans.variable} antialiased`}>
        <div className="bg-stone-400 min-w-screen min-h-screen">
          <div className="container mx-auto py-4">{children}</div>
        </div>
      </body>
    </html>
  );
}
