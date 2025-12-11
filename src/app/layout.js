import { Poppins, Amiri } from "next/font/google";
import "./globals.css";
import "@/styles/responsive.css";
import "@/styles/charts-responsive.css";
import SessionProvider from "@/components/providers/SessionProvider";
import SWRProvider from "@/components/providers/SWRProvider";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${poppins.className} ${poppins.variable} ${amiri.variable} antialiased`}>
        <SessionProvider>
          <SWRProvider>
            {children}
          </SWRProvider>
        </SessionProvider>
      </body>
    </html>
  );
}