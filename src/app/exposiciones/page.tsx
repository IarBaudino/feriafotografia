"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PublicSidebar from "@/components/Sidebar/PublicSidebar";

const exposiciones = [
  {
    id: "expo-2024-1",
    title: "Miradas Urbanas",
    year: "2024",
    description: "Fotografía documental sobre la vida en la ciudad",
    content: {
      text: "Una exploración visual de la vida cotidiana...",
      images: [
        /* ... */
      ],
    },
  },
  // ... más exposiciones
];

const sidebarSections = [
  {
    title: "Exposiciones Actuales",
    items: exposiciones,
  },
];

export default function ExposicionesPage() {
  const [currentExpo, setCurrentExpo] = useState(exposiciones[0].id);
  const selectedExpo = exposiciones.find((expo) => expo.id === currentExpo);

  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicSidebar
        sections={sidebarSections}
        currentId={currentExpo}
        onSelect={setCurrentExpo}
        title="Exposiciones"
      />

      <main className="md:pl-64 pt-20">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            key={currentExpo}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* ... contenido de la exposición ... */}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
