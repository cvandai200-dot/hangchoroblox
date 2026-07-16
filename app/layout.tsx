import type { Metadata } from "next";
import { Inter } from 'next/font/google'
import "./globals.css";

const inter = Inter({ 
  subsets: ['latin'],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Hàng Chờ Roblox | Giveaway Robux",
  description: "Tham gia hàng chờ Giveaway Robux - Mỗi tên Roblox chỉ được tham gia 1 lần. Vui lòng đợi và may mắn!",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0f] text-white font-sans">{children}</body>
    </html>
  );
}
