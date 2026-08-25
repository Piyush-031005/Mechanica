import type { Metadata } from "next";
import { Oswald, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
});

export const metadata: Metadata = {
  title: "MECHANICA | The Luminous Cyber-Ecology",
  description: "An unprecedented WebGL experience.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${oswald.variable} ${notoSansJP.variable}`}>
      <body>{children}</body>
    </html>
  );
}
