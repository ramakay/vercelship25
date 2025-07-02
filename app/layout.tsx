import type { Metadata } from "next";
import { Geist, Geist_Mono, Caveat } from "next/font/google";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { themeConfig } from "./theme-config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vercel Ship 2025 - AI Gateway Benchmark",
  description: "Compare AI models with Vercel AI Gateway",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} antialiased`}
      >
        <Theme
          accentColor={themeConfig.accentColor}
          grayColor={themeConfig.grayColor}
          radius={themeConfig.radius}
          scaling={themeConfig.scaling}
          appearance={themeConfig.appearance}
        >
          {children}
        </Theme>
      </body>
    </html>
  );
}
