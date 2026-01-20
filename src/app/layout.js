import { Poppins, Amiri } from "next/font/google";
import "./globals.css";
import "@/styles/responsive.css";
import "@/styles/charts-responsive.css";
import SessionProvider from "@/components/providers/SessionProvider";
import SWRProvider from "@/components/providers/SWRProvider";
import QueryProvider from "@/components/providers/QueryProvider";
import PasswordChangeSuggestion from "@/components/shared/PasswordChangeSuggestion";
import RecoverySetupTrigger from "@/components/shared/RecoverySetupTrigger";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri"
});

export const metadata = {
  title: "SIMTAQ",
  description: "Sistem Informasi Manajemen Tahfidz Qur'an",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png", 
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#10b981", // emerald-500
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
  formatDetection: {
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIMTAQ",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${poppins.className} ${poppins.variable} ${amiri.variable} antialiased bg-white`} suppressHydrationWarning>
        <SessionProvider>
          <SWRProvider>
            <QueryProvider>
              {children}
              <PasswordChangeSuggestion />
              <RecoverySetupTrigger />
            </QueryProvider>
          </SWRProvider>
        </SessionProvider>
      </body>
    </html>
  );
}