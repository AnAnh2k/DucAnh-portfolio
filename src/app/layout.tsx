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
  title: {
    default: "Đức Anh Developer | Fullstack Web Developer",
    template: "%s | Đức Anh Developer",
  },
  description: "Portfolio cá nhân của An Đức Anh (ducanhdev) - Fullstack Web Developer. Chuyên thiết kế và phát triển ứng dụng web hiện đại với React, Next.js và Node.js.",
  keywords: ["ducanhdev", "Đức Anh Developer", "An Đức Anh", "Fullstack Developer", "Next.js", "Portfolio", "Web Developer Vietnam", "duc anh dev", "software engineer"],
  authors: [{ name: "An Đức Anh", url: "https://ducanhdev.io.vn" }],
  creator: "An Đức Anh",
  metadataBase: new URL("https://ducanhdev.io.vn"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Đức Anh Developer | Fullstack Web Developer",
    description: "Khám phá các dự án và kỹ năng của An Đức Anh - Fullstack Developer chuyên nghiệp.",
    url: "https://ducanhdev.io.vn",
    siteName: "Đức Anh Developer Portfolio",
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Đức Anh Developer | Fullstack Web Developer",
    description: "Portfolio của An Đức Anh - Fullstack Developer chuyên nghiệp.",
    creator: "@AnAnh2k",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  verification: {
    google: "32b-IlTr3VWweqDo57tgv5SoSKny6dK4zn911wPBGtA",
  },
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
