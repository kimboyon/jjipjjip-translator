import "./globals.css";
import { ViewTracker } from "@/components/ViewTracker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "맨업 ManUp",
  description: "남성 성장 관리를 위한 커뮤니티, 멘토링, 상담 플랫폼"
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
