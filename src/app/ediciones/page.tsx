"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PublicSidebar from "@/components/Sidebar/PublicSidebar";

const ediciones = [
  {
    id: "ed-2024",
    title: "Quinta Edición",
    year: "2024",
    description: "Fotografía Contemporánea",
    content: {
      text: "La quinta edición de la Feria de Fotografía exploró las nuevas tendencias en fotografía contemporánea, reuniendo a más de 50 artistas nacionales e internacionales.",
      images: [
        "/ediciones/2024/1.jpg",
        "/ediciones/2024/2.jpg",
        "/ediciones/2024/3.jpg",
      ],
    },
  },
  {
    id: "ed-2023",
    title: "Cuarta Edición",
    year: "2023",
    description: "Fotografía Documental",
    content: {
      text: "Un año dedicado a la fotografía documental y el fotoperiodismo, con exposiciones que reflejaron los acontecimientos más importantes del año.",
      images: [
        "/ediciones/2023/1.jpg",
        "/ediciones/2023/2.jpg",
        "/ediciones/2023/3.jpg",
      ],
    },
  },
  {
    id: "ed-2022",
    title: "Tercera Edición",
    year: "2022",
    description: "Fotografía Analógica",
    content: {
      text: "Celebrando el resurgimiento de la fotografía analógica, esta edición reunió coleccionistas y amantes del proceso tradicional.",
      images: [
        "/ediciones/2022/1.jpg",
        "/ediciones/2022/2.jpg",
        "/ediciones/2022/3.jpg",
      ],
    },
  },
];

const sidebarSections = [
  {
    title: "Todas las Ediciones",
    items: ediciones,
  },
];

export default function EdicionesPage() {
  const [currentEdicion, setCurrentEdicion] = useState(ediciones[0].id);
  const selectedEdicion = ediciones.find((ed) => ed.id === currentEdicion);

  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicSidebar
        sections={sidebarSections}
        currentId={currentEdicion}
        onSelect={setCurrentEdicion}
        title="Ediciones"
      />

      <main className="md:pl-64 pt-20">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            key={currentEdicion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-bevietnam font-bold text-bg-secondary mb-3">
                {selectedEdicion?.title}
              </h1>
              <p className="text-xl font-joly italic text-accent-blue mb-6">
                {selectedEdicion?.year}
              </p>
              <p className="text-lg font-bevietnam text-text-primary/80 leading-relaxed">
                {selectedEdicion?.content.text}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {selectedEdicion?.content.images.map((img, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="group relative aspect-[4/5] overflow-hidden rounded-xl"
                >
                  <img
                    src={img}
                    alt={`Imagen ${i + 1} de ${selectedEdicion.title}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white font-joly italic text-sm">
                      Imagen {i + 1}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
