
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sofia AI Studio | Build Anything",
  description:
    "Sofia AI Studio by Shaheed Bhagat Singh State University, Ferozepur. Create AI apps, websites, games and intelligent agents.",
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
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
      <body>{children}</body>
    </html>
  );
}
