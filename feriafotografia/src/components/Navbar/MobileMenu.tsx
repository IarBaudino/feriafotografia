"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { HiX } from "react-icons/hi";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  homeMenuItems: string[];
  pageLinks: { name: string; path: string; }[];
  currentPath: string;
}

export default function MobileMenu({ isOpen, onClose, homeMenuItems, pageLinks, currentPath }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-bg-primary z-40"
    >
      <div className="container-width h-full px-4 pt-20 pb-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-text-primary"
        >
          <HiX size={24} />
        </button>

        <nav className="h-full flex flex-col">
          <div className="space-y-4">
            {currentPath === '/' && (
              <>
                <h3 className="text-sm font-bevietnam font-bold text-text-primary/60 uppercase">
                  Inicio
                </h3>
                {homeMenuItems.map((item) => (
                  <Link
                    key={item}
                    href={`#${item}`}
                    onClick={onClose}
                    className="block py-2 text-lg font-bevietnam font-normal text-text-primary hover:text-bg-secondary transition-colors"
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Link>
                ))}
              </>
            )}

            <h3 className="text-sm font-bevietnam font-bold text-text-primary/60 uppercase mt-6">
              Páginas
            </h3>
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
