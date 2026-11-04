import type { Metadata, Viewport } from "next";
import "../app.css";
import { siteUrl } from "@/lib/seo";
export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: "Global Lawyers Forum",
  icons: { icon: "/logo-badge-64.png", apple: "/logo-badge-180.png" },
  manifest: "/manifest.webmanifest",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0A1723",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500&family=Archivo:wght@400;500;600;700&display=swap"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('gla-theme');if(t==='dark'||t==='light')document.documentElement.dataset.theme=t;}catch(e){}",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
