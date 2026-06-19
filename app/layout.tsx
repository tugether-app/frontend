import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";

// Fredoka: rounded geometric headings. Nunito: humanist body. Per UI reference.
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
  display: "swap",
});

const TITLE = "Tugether - Nabung bareng sampai tercapai";
const DESC = "Kumpulin dana bareng menuju satu tujuan. Cukup login email, tanpa wallet.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: TITLE,
  description: DESC,
  appleWebApp: { capable: true, title: "Tugether", statusBarStyle: "default" },
  openGraph: { title: TITLE, description: DESC, type: "website", images: ["/og.png"] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESC, images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#fbfaf7",
  viewportFit: "cover",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <div className="aurora" aria-hidden />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
