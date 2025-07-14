"use client";
import { motion } from "framer-motion";
import { FaInstagram, FaEnvelope } from "react-icons/fa";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-bg-secondary text-bg-primary py-12">
      <div className="container-width px-4">
        <div className="flex flex-col items-center gap-8 mb-8">
          {/* Contacto */}
          <div className="text-center space-y-4">
            <h3 className="font-bevietnam font-bold text-lg">Contacto</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <a
                href="https://www.instagram.com/feriadefotografia?igsh=MXA2amJyaGtqZXo3Mg=="
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-accent-blue transition-colors font-joly italic group"
              >
                <FaInstagram
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
                @feriadefotografia
              </a>
              <a
                href="mailto:feriadefotografia@gmail.com"
                className="flex items-center gap-2 hover:text-accent-blue transition-colors font-joly italic group"
              >
                <FaEnvelope
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
                feriadefotografia@gmail.com
              </a>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="border-t border-bg-primary/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-bevietnam font-normal text-bg-primary/80">
              © {currentYear} Feria Fotografía. Todos los derechos reservados.
            </p>
            <div className="flex gap-4">
              <Link
                href="/admin/login"
                className="text-sm font-bevietnam font-normal text-bg-primary/60 hover:text-accent-blue transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
