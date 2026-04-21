import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromoRadar",
  description: "Find Reddit posts to promote your tool — AI-scored opportunities with drafted replies",
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
