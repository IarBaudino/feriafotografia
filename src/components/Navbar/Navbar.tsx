"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import MobileMenu from "./MobileMenu";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Menú principal (home)
  const homeMenuItems = ["la feria", "convocatorias", "equipo", "contacto"];

  // Enlaces a páginas separadas
  const pageLinks = [
    { name: "Ediciones", path: "/ediciones" },
    { name: "Exposiciones", path: "/exposiciones" },
    { name: "Agenda", path: "/culturalAgenda" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
          isScrolled || isMobileMenuOpen || !isHomePage
            ? "bg-bg-primary shadow-lg"
            : "bg-transparent"
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <nav className="container-width flex items-center justify-between px-4 py-4">
          <Link
            href="/"
            className="relative w-20 h-10 md:w-24 md:h-12 z-50"
            aria-label="Ir a inicio"
          >
            <Image
              src="/imagenes/stickerNavbar.png"
              alt="Feria Fotografía Logo"
              fill
              className="object-contain"
              priority
            />
          </Link>

          {/* Menú de escritorio */}
          <div className="hidden md:flex space-x-1 lg:space-x-8">
            {/* Enlaces del home */}
            {isHomePage &&
              homeMenuItems.map((item) => (
                <Link
                  key={item}
                  href={`#${item}`}
                  className={`px-3 py-2 rounded-md transition-colors font-bevietnam font-normal ${
                    isScrolled || !isHomePage
                      ? "text-text-primary hover:text-bg-secondary"
                      : "text-bg-primary hover:text-accent-blue"
                  }`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Link>
              ))}

            {/* Enlaces a páginas separadas */}
            {pageLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-3 py-2 rounded-md transition-colors font-bevietnam font-normal ${
                  isScrolled || !isHomePage
                    ? "text-text-primary hover:text-bg-secondary"
                    : "text-bg-primary hover:text-accent-blue"
                } ${
                  pathname === link.path ? "text-bg-secondary font-bold" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Botón de menú móvil */}
          <button
            className={`md:hidden p-2 ${
              isScrolled || !isHomePage
                ? "text-text-primary"
                : "text-bg-primary"
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Menú"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </nav>
      </motion.header>

      {/* Menú móvil */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        homeMenuItems={homeMenuItems}
        pageLinks={pageLinks}
        currentPath={pathname}
      />
    </>
  );
}
