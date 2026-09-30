import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KSEB VPP Command Center | Decentralized Virtual Power Plant",
  description:
    "Kerala State Electricity Board Decentralized Virtual Power Plant operations dashboard for peak load management, prosumer battery dispatch, and grid stabilization.",
  keywords: [
    "KSEB",
    "Virtual Power Plant",
    "VPP",
    "Smart Grid",
    "Demand Response",
    "Kerala",
    "Battery Storage",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 antialiased font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
