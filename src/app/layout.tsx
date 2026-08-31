import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MECHANICA — Spider-Man × Ben 10",
  description: "Where alien technology meets spider instinct.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
