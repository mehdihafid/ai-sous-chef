import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Sous Chef",
  description: "Snap your fridge, get a recipe",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
