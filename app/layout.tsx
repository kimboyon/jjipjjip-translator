import "./globals.css";
import { ViewTracker } from "@/components/ViewTracker";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EMOTRANS-찝찝한 번역기",
  description: "보내기 전 찝찝한 말을 감정, 사실, 해석, 대응으로 정리하는 AI 문장 도구"
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
