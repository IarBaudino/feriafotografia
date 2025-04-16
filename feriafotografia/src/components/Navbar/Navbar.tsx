'use client'
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { HiMenu, HiX } from 'react-icons/hi';
import MobileMenu from './MobileMenu';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Manejo del scroll para cambiar el fondo de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.nav 
        className={`fixed w-full z-50 transition-colors duration-300 ${
          isScrolled ? 'bg-bg-primary/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-width">
          <div className="flex justify-between items-center h-16 md:h-20 px-4 md:px-8">
            <Link 
              href="/" 
              className={`text-lg md:text-xl font-bold transition-colors ${
                isScrolled ? 'text-text-primary' : 'text-bg-primary'
              }`}
            >
              Feria Fotografía
            </Link>

            {/* Menú de escritorio */}
            <div className="hidden md:flex space-x-1 lg:space-x-8">
              {['about', 'ediciones', 'exposiciones', 'convocatorias', 'equipo', 'contacto'].map((item) => (
                <Link
                  key={item}
                  href={`#${item}`}
                  className={`px-3 py-2 rounded-md transition-colors ${
                    isScrolled 
                      ? 'text-text-primary hover:text-bg-secondary' 
                      : 'text-bg-primary hover:text-accent-blue'
                  }`}
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Link>
              ))}
            </div>

            {/* Botón de menú móvil */}
            <button
              className={`md:hidden p-2 rounded-md transition-colors ${
                isScrolled ? 'text-text-primary' : 'text-bg-primary'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Menú móvil con AnimatePresence para una mejor transición */}
      <AnimatePresence>
        {isMenuOpen && <MobileMenu onClose={() => setIsMenuOpen(false)} />}
      </AnimatePresence>
    </>
  );
} 