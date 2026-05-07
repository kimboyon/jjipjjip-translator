import "./globals.css";
import { ViewTracker } from "@/components/ViewTracker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velora",
  description: "Luxury community commerce experience built with Next.js and Supabase"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <ViewTracker />
        {children}
      </body>
    </html>
  );
}
