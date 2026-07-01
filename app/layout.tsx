import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast";
import { I18nProvider } from "@/lib/i18n/provider";
import { OfflineGate } from "@/components/OfflineGate";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";

const MAINTENANCE = ["1", "true"].includes(process.env.NEXT_PUBLIC_MAINTENANCE ?? "");

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

const TITLE = "Tugether - Save together, reach it together";
const DESC = "Pool money toward one shared goal. Just sign in with email, no wallet needed.";

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
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <div className="aurora" aria-hidden />
        <I18nProvider>
          {MAINTENANCE ? <MaintenanceScreen /> : <ToastProvider>{children}</ToastProvider>}
          <OfflineGate />
        </I18nProvider>
      </body>
    </html>
  );
}
