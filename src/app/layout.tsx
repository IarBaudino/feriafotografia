import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import localFont from "next/font/local";
import Footer from "@/components/Footer/Footer";

// Be Vietnam Pro
const beVietnamPro = localFont({
  src: [
    {
      path: "../../src/fonts/BeVietnamPro/BeVietnamPro-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../src/fonts/BeVietnamPro/BeVietnamPro-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../src/fonts/BeVietnamPro/BeVietnamPro-ThinItalic.woff2",
      weight: "100",
      style: "italic",
    },
  ],
  variable: "--font-bevietnam",
  display: "swap",
});

// Joly Display
const jolyDisplay = localFont({
  src: "../../src/fonts/JolyDisplay/JolyDisplay-MediumItalic.woff2",
  variable: "--font-joly",
  display: "swap",
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
      className={`scroll-smooth ${beVietnamPro.variable} ${jolyDisplay.variable}`}
    >
      <body className="bg-bg-primary text-text-primary font-bevietnam">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
