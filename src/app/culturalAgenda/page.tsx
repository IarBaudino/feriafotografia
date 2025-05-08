"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import PublicSidebar from "@/components/Sidebar/PublicSidebar";

// Primero definimos las interfaces para los diferentes tipos de contenido
interface BaseContent {
  text: string;
  images: string[];
  fecha: string;
  lugar: string;
}

interface TallerContent extends BaseContent {
  instructor: string;
}

interface CharlaContent extends BaseContent {
  ponente: string;
}

interface Evento<T extends BaseContent> {
  id: string;
  title: string;
  year: string;
  description: string;
  content: T;
}

// Definimos la estructura de eventos
const eventos = {
  talleres: [
    {
      id: "taller-2024-1",
      title: "Fotografía de Retrato",
      year: "2024",
      description: "Técnicas avanzadas de retrato",
      content: {
        text: "Aprende las técnicas más efectivas para capturar la esencia de tus sujetos...",
        images: [
          "/agenda/retrato1.jpg",
          "/agenda/retrato2.jpg",
          "/agenda/retrato3.jpg",
        ],
        fecha: "15 de Marzo, 2024",
        lugar: "Sala Principal",
        instructor: "Ana García",
      },
    },
    {
      id: "taller-2024-2",
      title: "Fotografía Callejera",
      year: "2024",
      description: "Capturando la vida urbana",
      content: {
        text: "Explora las calles y aprende a capturar momentos únicos...",
        images: [
          "/agenda/calle1.jpg",
          "/agenda/calle2.jpg",
          "/agenda/calle3.jpg",
        ],
        fecha: "18 de Marzo, 2024",
        lugar: "Centro Histórico",
        instructor: "Miguel Ángel Pérez",
      },
    },
  ],
  charlas: [
    {
      id: "charla-2024-1",
      title: "El Futuro de la Fotografía",
      year: "2024",
      description: "Tendencias y tecnologías emergentes",
      content: {
        text: "Una mirada profunda a las nuevas tecnologías...",
        images: [
          "/agenda/futuro1.jpg",
          "/agenda/futuro2.jpg",
          "/agenda/futuro3.jpg",
        ],
        fecha: "20 de Marzo, 2024",
        lugar: "Auditorio",
        ponente: "Carlos Ruiz",
      },
    },
    {
      id: "charla-2024-2",
      title: "Fotografía Social",
      year: "2024",
      description: "Impacto y responsabilidad",
      content: {
        text: "Análisis del rol de la fotografía en el cambio social...",
        images: [
          "/agenda/social1.jpg",
          "/agenda/social2.jpg",
          "/agenda/social3.jpg",
        ],
        fecha: "22 de Marzo, 2024",
        lugar: "Sala de Conferencias",
        ponente: "María González",
      },
    },
  ],
  workshops: [
    {
      id: "workshop-2024-1",
      title: "Iluminación Avanzada",
      year: "2024",
      description: "Domina la luz en tus fotos",
      content: {
        text: "Workshop intensivo sobre técnicas de iluminación...",
        images: ["/agenda/luz1.jpg", "/agenda/luz2.jpg", "/agenda/luz3.jpg"],
        fecha: "25 de Marzo, 2024",
        lugar: "Estudio Fotográfico",
        instructor: "Laura Martínez",
      },
    },
    // ... más workshops
  ],
};

type CategoryType = "talleres" | "charlas" | "workshops";

export default function CulturalAgendaPage() {
  const [currentCategory, setCurrentCategory] =
    useState<CategoryType>("talleres");

  const sidebarSections = [
    {
      title: "Categorías",
      items: [
        {
          id: "talleres",
          title: "Talleres",
          description: "Aprende con expertos",
        },
        {
          id: "charlas",
          title: "Charlas",
          description: "Conocimiento y debate",
        },
        {
          id: "workshops",
          title: "Workshops",
          description: "Práctica intensiva",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicSidebar
        sections={sidebarSections}
        currentId={currentCategory}
        onSelect={(id) => setCurrentCategory(id as CategoryType)}
        title="Agenda Cultural"
      />

      <main className="md:pl-64 pt-20">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            key={currentCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bevietnam font-bold text-bg-secondary mb-8">
              {currentCategory.charAt(0).toUpperCase() +
                currentCategory.slice(1)}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {eventos[currentCategory].map((evento) => (
                <motion.div
                  key={evento.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={evento.content.images[0]}
                      alt={evento.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bevietnam font-bold text-bg-secondary mb-2">
                      {evento.title}
                    </h3>
                    <p className="text-sm font-joly italic text-accent-blue mb-4">
                      {evento.content.fecha}
                    </p>
                    <div className="space-y-2 text-sm text-text-primary/80">
                      <p className="font-bevietnam">
                        <span className="text-accent-green">Ubicación:</span>{" "}
                        {evento.content.lugar}
                      </p>
                      {"instructor" in evento.content && (
                        <p className="font-bevietnam">
                          <span className="text-accent-green">Instructor:</span>{" "}
                          {evento.content.instructor}
                        </p>
                      )}
                      {"ponente" in evento.content && (
                        <p className="font-bevietnam">
                          <span className="text-accent-green">Ponente:</span>{" "}
                          {evento.content.ponente}
                        </p>
                      )}
                    </div>
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
