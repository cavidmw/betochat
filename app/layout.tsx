import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { StarfieldCanvas } from "@/components/background/StarfieldCanvas";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "BetoChat",
  description: "Modern, minimal ve hızlı mesajlaşma uygulaması",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0b10",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <StarfieldCanvas />
        <QueryProvider>
          <div className="relative z-10 min-h-dvh">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
