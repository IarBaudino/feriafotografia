"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface SidebarItem {
  id: string;
  title: string;
  year?: string;
  description?: string;
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

  return (
    <>
      <button
        className="md:hidden fixed top-24 left-4 z-50 bg-bg-secondary text-white p-2 rounded-lg"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? "✕" : "☰"}
      </button>

      <aside
        className={`${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary transform transition-transform duration-300 ease-in-out z-40`}
      >
        <div className="flex flex-col h-full pt-20">
          <div className="p-5 border-b border-accent-blue/20">
            <h1 className="text-2xl font-bevietnam font-bold text-white">
              {title}
            </h1>
            <p className="text-xs font-joly italic text-accent-blue mt-1">
              Explora nuestras actividades
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-6">
              {sections.map((section) => (
                <div key={section.title}>
                  <h2 className="text-lg font-joly italic text-accent-blue mb-3">
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
                        className={`w-full text-left p-4 rounded-lg transition-all duration-300 ${
                          currentId === item.id
                            ? "bg-accent-blue/20 border border-accent-blue/30"
                            : "text-white hover:bg-white/5 border border-transparent"
                        }`}
                      >
                        <div className="font-bevietnam font-bold text-white">
                          {item.title}
                        </div>
                        {item.year && (
                          <div className="font-joly italic text-accent-blue text-sm mt-1">
                            {item.year}
                          </div>
                        )}
                        {item.description && (
                          <p className="font-bevietnam text-xs text-white/70 mt-2">
                            {item.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div className="border-t border-accent-blue/20 p-4">
            <p className="font-joly italic text-xs text-accent-blue text-center">
              Feria Fotografía
            </p>
          </div>
        </div>
      </aside>
    </>
  );
} 