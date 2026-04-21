import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Creativity & AI Study",
  description: "A CHI research study on human-AI collaborative creativity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
