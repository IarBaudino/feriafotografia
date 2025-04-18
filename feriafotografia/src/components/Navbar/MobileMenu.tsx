"use client";
import { motion } from "framer-motion";
import Link from "next/link";

interface MobileMenuProps {
  onClose: () => void;
}

export default function MobileMenu({ onClose }: MobileMenuProps) {
  const menuItems = [
    { href: "about", label: "Sobre la Feria" },
    { href: "ediciones", label: "Ediciones" },
    { href: "exposiciones", label: "Exposiciones" },
    { href: "convocatorias", label: "Convocatorias" },
    { href: "agenda", label: "Agenda Cultural" },
    { href: "equipo", label: "Equipo" },
    { href: "contacto", label: "Contacto" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-bg-primary/95 backdrop-blur-sm"
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="fixed inset-y-0 right-0 w-full max-w-sm bg-bg-primary shadow-xl"
      >
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto px-6 py-20">
            <nav className="space-y-6">
              {menuItems.map(({ href, label }) => (
                <Link
                  key={href}
                  href={`#${href}`}
                  className="block text-lg font-medium text-text-primary hover:text-bg-secondary transition-colors"
                  onClick={onClose}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </motion.div>

      {/* Overlay para cerrar el menú */}
      <motion.div
        className="fixed inset-0 bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
    </motion.div>
  );
}
