import { Inter } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";
import SWRProvider from "@/components/providers/SWRProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Tahfidz Management System",
  description: "Sistem Manajemen Hafalan Al-Quran",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} antialiased`}>
        <SessionProvider>
          <SWRProvider>
            {children}
          </SWRProvider>
        </SessionProvider>
      </body>
    </html>
  );
}