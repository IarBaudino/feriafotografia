import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import localFont from "next/font/local";
import Footer from "@/components/Footer/Footer";
import { Be_Vietnam_Pro } from "next/font/google";

// Be Vietnam Pro
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bevietnam",
});

// Joly Display
const jolyDisplay = localFont({
  src: "../../src/fonts/JolyDisplay/JolyDisplay-MediumItalic.woff2",
  variable: "--font-joly",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Feria de Fotografía",
  description:
    "Feria de fotografía - Un espacio de encuentro para amantes de la fotografía",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/imagenes/iso.ff.color.png", type: "image/png", sizes: "any" },
    ],
    apple: "/imagenes/iso.ff.color.png",
    shortcut: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`scroll-smooth ${beVietnam.variable} ${jolyDisplay.variable}`}
    >
      <body className="bg-bg-primary text-text-primary font-bevietnam">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
