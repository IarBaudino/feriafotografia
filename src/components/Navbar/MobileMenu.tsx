"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { HiX } from "react-icons/hi";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  homeMenuItems: string[];
  pageLinks: { name: string; path: string }[];
  currentPath: string;
}

export default function MobileMenu({
  isOpen,
  onClose,
  homeMenuItems,
  pageLinks,
  currentPath,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg-primary z-40"
    >
      <div className="h-full px-6 pb-6 max-w-md">
        {/* Header con botón de cerrar */}
        <div className="flex items-center justify-between pt-6 pb-8 border-b border-bg-secondary/10">
          <h2 className="text-2xl font-bevietnam font-bold text-bg-secondary">
            Menú
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-primary hover:bg-bg-secondary/10 rounded-lg transition-colors"
            aria-label="Cerrar menú"
          >
            <HiX size={28} />
          </button>
        </div>

        <nav className="h-full flex flex-col pt-8">
          <div className="space-y-6">
            {currentPath === "/" &&
              homeMenuItems.map((item) => (
                <Link
                  key={item}
                  href={`#${item}`}
                  onClick={onClose}
                  className="block py-2 text-lg font-bevietnam font-normal text-text-primary hover:text-bg-secondary transition-colors"
                >
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                </Link>
              ))}

            {pageLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={onClose}
                className={`block py-2 text-lg font-bevietnam font-normal transition-colors ${
                  currentPath === link.path
                    ? "text-bg-secondary font-bold"
                    : "text-text-primary hover:text-bg-secondary"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </motion.div>
  );
}
