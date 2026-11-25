
import type { Metadata, Viewport } from "next";
import "./globals.css";

import PWARegister from "./pwa-register";
import SofiaController from "./sofia-controller";
import SofiaConnect from "./sofia-connect";

export const metadata: Metadata = {
  title: "Sofia AI Studio | Build Anything",
  description:
    "Create AI applications, websites, games and intelligent agents with Sofia AI Studio by Shaheed Bhagat Singh State University, Ferozepur.",
  applicationName: "Sofia AI Studio",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sofia AI"
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080B18",
  viewportFit: "cover"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}

        {/* PWA installation and service worker */}
        <PWARegister />

        {/* Sofia AI conversation controller */}
        <SofiaController />

        {/* AI providers and GitHub connections */}
        <SofiaConnect />
      </body>
    </html>
  );
}
