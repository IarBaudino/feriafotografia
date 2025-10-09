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
                <div key={section.title} className="mb-8">
                  <h2 className="text-lg font-bold text-bg-secondary mb-4">
                    {section.title}
                  </h2>
                  <div className="space-y-2">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => onSelect(item.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentId === item.id
                            ? "bg-accent-blue/10 text-accent-blue"
                            : "hover:bg-white/5 text-text-primary"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bevietnam">{item.title}</span>
                          <span className="text-sm opacity-60">
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
            <p className="font-joly italic text-xs text-accent-blue text-center">
              Feria Fotografía
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
