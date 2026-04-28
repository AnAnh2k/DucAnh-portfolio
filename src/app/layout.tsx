import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./simple-style/main.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "An Duc Anh - Portfolio",
  description: "Frontend Developer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="dark">
      <body
        className={`${inter.variable} antialiased bg-slate-950 text-slate-50`}
        style={{
          fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors position="top-right" theme="dark" />
      </body>
    </html>
  );
}
