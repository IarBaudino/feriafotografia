import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import { Be_Vietnam_Pro } from "next/font/google";

// Be Vietnam Pro
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bevietnam",
});

export const metadata: Metadata = {
  title: "Feria Fotografía",
  description:
    "Feria de fotografía - Un espacio de encuentro para amantes de la fotografía",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`scroll-smooth ${beVietnam.variable}`}
    >
      <body className="bg-bg-primary text-text-primary font-bevietnam">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
