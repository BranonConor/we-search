import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Research Studies - Statistical Analysis App",
  description:
    "Create and run simple research studies with statistical analysis. Design experiments, analyze data, and discover statistically significant relationships in your everyday life.",
  keywords:
    "research studies, statistical analysis, data science, experiments, hypothesis testing",
  authors: [{ name: "Research Studies App" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
