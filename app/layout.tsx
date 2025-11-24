import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const font = Nunito({
  variable: "--selected-font",
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
      <head>
        <script src="/register-sw.js"></script>
      </head>
      <body className={`${font.variable} antialiased`}>
        <div className="bg-stone-400 min-w-screen min-h-screen">
          <div className="container mx-auto py-4">{children}</div>
        </div>
      </body>
    </html>
  );
}
