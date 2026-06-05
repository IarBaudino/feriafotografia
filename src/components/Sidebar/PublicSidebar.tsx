"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface SidebarItem {
  id: string;
  title: string;
  year: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface PublicSidebarProps {
  sections: SidebarSection[];
  currentId: string;
  onSelect: (id: string) => void;
  title: string;
}

export default function PublicSidebar({
  sections,
  currentId,
  onSelect,
  title,
}: PublicSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  console.log(
    "PublicSidebar render: currentId =",
    currentId,
    "sections =",
    sections.length
  );

  return (
    <>
      {/* Botón para abrir en móvil - solo visible cuando está cerrado */}
      {!isMobileOpen && (
        <button
          className="md:hidden fixed top-24 left-4 z-50 bg-bg-secondary text-white p-3 rounded-lg shadow-lg"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Abrir menú"
        >
          ☰
        </button>
      )}

      {/* Overlay para cerrar al hacer clic fuera */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed left-0 top-0 bottom-0 w-[85vw] max-w-sm md:w-72 bg-bg-secondary transform transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full pt-20 md:pt-24">
          <div className="px-6 py-5 border-b border-accent-blue/20 relative">
            {/* Botón de cerrar dentro del sidebar en móvil */}
            <button
              className="md:hidden absolute top-3 right-3 text-white hover:text-accent-blue p-2 rounded-lg transition-colors"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Cerrar menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bevietnam font-bold text-white leading-tight pr-12 md:pr-0">
              {title}
            </h1>
            <p className="text-xs md:text-base font-bevietnam italic text-accent-blue mt-2">
              Explora nuestras actividades
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-6 space-y-6">
              {sections.map((section) => (
                <div key={section.title} className="mb-8">
                  <h2 className="text-base md:text-lg font-bold text-bg-secondary mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onSelect(item.id);
                          setIsMobileOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentId === item.id
                            ? "bg-accent-blue/10 text-accent-blue"
                            : "hover:bg-white/5 text-text-primary"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bevietnam text-sm md:text-base truncate flex-1">
                            {item.title}
                          </span>
                          <span className="text-xs md:text-sm opacity-60 flex-shrink-0">
                            {item.year}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="border-t border-accent-blue/20 p-4">
            <p className="font-bevietnam italic text-xs text-accent-blue text-center">
              Feria Fotografía
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
