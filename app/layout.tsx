import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./custom.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kid-A Dartboard - Weekly Leaderboard",
  description: "Modified version of gran-app by sobassy on Github.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <meta name="viewport" content="initial-scale=.9, width=device-width" />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
