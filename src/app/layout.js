import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import "@/styles/responsive.css";
import "@/styles/charts-responsive.css";
import SessionProvider from "@/components/providers/SessionProvider";
import SWRProvider from "@/components/providers/SWRProvider";

const inter = Inter({ subsets: ["latin"] });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins"
});

export const metadata = {
  title: "SIMTAQ",
  description: "Sistem Informasi Manajemen Tahfidz Qur'an",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${inter.className} ${poppins.variable} antialiased`}>
        <SessionProvider>
          <SWRProvider>
            {children}
          </SWRProvider>
        </SessionProvider>
      </body>
    </html>
  );
}