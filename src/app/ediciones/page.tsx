"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PublicSidebar from "@/components/Sidebar/PublicSidebar";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Masonry from "react-masonry-css";

interface Edicion {
  id: string;
  title: string;
  date: string;
  description: string;
  location: string;
  participants: number;
  visitors: number;
}

interface EdicionImage {
  id: string;
  url: string;
  alt: string;
  section_id: string;
}

export default function EdicionesPage() {
  const [ediciones, setEdiciones] = useState<Edicion[]>([]);
  const [edicionImages, setEdicionImages] = useState<
    Record<string, EdicionImage[]>
  >({});
  const [currentEdicion, setCurrentEdicion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<EdicionImage | null>(null);

  useEffect(() => {
    loadEdiciones();
  }, []);

  const loadEdiciones = async () => {
    try {
      console.log("Cargando ediciones...");
      const { data: edicionesData, error: edicionesError } = await supabase
        .from("editions")
        .select("*")
        .order("date", { ascending: false });

      if (edicionesError) throw edicionesError;
      console.log("Ediciones cargadas:", edicionesData);

      if (edicionesData && edicionesData.length > 0) {
        setEdiciones(edicionesData);
        setCurrentEdicion(edicionesData[0].id);

        console.log("Cargando imágenes...");
        const { data: imagesData, error: imagesError } = await supabase
          .from("images")
          .select("*")
          .eq("section", "editions");

        if (imagesError) throw imagesError;
        console.log("Imágenes cargadas:", imagesData);

        if (imagesData) {
          const imagesByEdition = imagesData.reduce((acc, img) => {
            if (!acc[img.section_id]) {
              acc[img.section_id] = [];
            }
            acc[img.section_id].push(img);
            return acc;
          }, {} as Record<string, EdicionImage[]>);

          console.log("Imágenes agrupadas:", imagesByEdition);
          setEdicionImages(imagesByEdition);
        }
      }
    } catch (error) {
      console.error("Error cargando ediciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedEdicion = ediciones.find((ed) => ed.id === currentEdicion);

  const sidebarSections = [
    {
      title: "Todas las Ediciones",
      items: ediciones.map((ed) => ({
        id: ed.id,
        title: ed.title,
        year: new Date(ed.date).getFullYear().toString(),
      })),
    },
  ];

  // Animaciones para las imágenes
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-lg text-bg-secondary">Cargando ediciones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicSidebar
        sections={sidebarSections}
        currentId={currentEdicion}
        onSelect={setCurrentEdicion}
        title="Ediciones"
      />

      <main className="md:pl-64 pt-20">
        {selectedEdicion ? (
          <div className="container mx-auto px-6 py-12">
            <motion.div
              key={currentEdicion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-7xl mx-auto"
            >
              {/* Header de la edición */}
              <div className="relative mb-24">
                <motion.h1
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="text-6xl md:text-8xl font-bevietnam font-bold text-bg-secondary opacity-10 absolute -top-8 left-0"
                >
                  {new Date(selectedEdicion.date).getFullYear()}
                </motion.h1>
                <motion.div
                  initial={{ y: 20 }}
                  animate={{ y: 0 }}
                  className="relative"
                >
                  <h2 className="text-4xl md:text-5xl font-bevietnam font-bold text-bg-secondary mb-4">
                    {selectedEdicion.title}
                  </h2>
                  <p className="text-xl font-joly italic text-accent-blue">
                    {new Date(selectedEdicion.date).toLocaleDateString(
                      "es-ES",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </motion.div>
              </div>

              {/* Contenido principal */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
                <div className="lg:col-span-7">
                  <div className="prose prose-lg max-w-none">
                    <div 
                      className="text-xl font-bevietnam text-text-primary/80 leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: selectedEdicion.description
                      }}
                    />
                  </div>
                </div>
                <div className="lg:col-span-5">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center">
                        <span className="text-accent-blue">📍</span>
                      </div>
                      <div>
                        <p className="text-sm text-text-primary/60">
                          Ubicación
                        </p>
                        <p className="text-lg font-bevietnam text-bg-secondary">
                          {selectedEdicion.location}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center">
                        <span className="text-accent-blue">👥</span>
                      </div>
                      <div>
                        <p className="text-sm text-text-primary/60">
                          Participantes
                        </p>
                        <p className="text-lg font-bevietnam text-bg-secondary">
                          {selectedEdicion.participants}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full bg-accent-blue/10 flex items-center justify-center">
                        <span className="text-accent-blue">👀</span>
                      </div>
                      <div>
                        <p className="text-sm text-text-primary/60">
                          Visitantes
                        </p>
                        <p className="text-lg font-bevietnam text-bg-secondary">
                          {selectedEdicion.visitors}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Galería de imágenes mejorada */}
              {edicionImages[selectedEdicion.id]?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                  className="mt-20"
                >
                  <Masonry
                    breakpointCols={{
                      default: 5,
                      1600: 4,
                      1200: 3,
                      900: 2,
                      500: 1,
                    }}
                    className="flex -ml-4 w-auto"
                    columnClassName="pl-4 bg-clip-padding"
                  >
                    {edicionImages[selectedEdicion.id].map((img, i) => {
                      // Ajustamos las proporciones para hacerlas más delicadas
                      const isLarge = i % 5 === 0;
                      const isMedium = i % 3 === 0 && !isLarge;

                      return (
                        <motion.div
                          key={img.id}
                          custom={i}
                          variants={imageVariants}
                          initial="hidden"
                          animate="visible"
                          whileHover="hover"
                          onClick={() => setSelectedImage(img)}
                          className={`mb-4 cursor-pointer ${
                            isLarge
                              ? "aspect-[2/3]"
                              : isMedium
                              ? "aspect-[3/4]"
                              : "aspect-[4/5]"
                          }`}
                          layoutId={`image-${img.id}`}
                        >
                          <div className="relative w-full h-full rounded-lg overflow-hidden">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-t from-bg-secondary/90 via-bg-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"
                              initial={{ opacity: 0 }}
                              whileHover={{ opacity: 1 }}
                            />

                            <motion.img
                              src={img.url}
                              alt={
                                img.alt ||
                                `Imagen ${i + 1} de ${selectedEdicion.title}`
                              }
                              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                              initial={{ scale: 1.2 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.8 }}
                            />

                            <motion.div
                              className="absolute inset-0 z-20 flex flex-col justify-end p-6 group"
                              initial={{ opacity: 0, y: 20 }}
                              whileHover={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                <p className="text-white text-sm font-bevietnam mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                  {img.alt ||
                                    `Imagen ${i + 1} de ${
                                      selectedEdicion.title
                                    }`}
                                </p>
                                <div className="h-1 w-0 group-hover:w-full bg-accent-blue transition-all duration-500 delay-200" />
                              </div>
                            </motion.div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </Masonry>
                </motion.div>
              )}
            </motion.div>
          </div>
        ) : (
          <div className="container mx-auto px-6 py-8 text-center">
            <p className="text-lg text-bg-secondary">
              No hay ediciones disponibles
            </p>
          </div>
        )}
      </main>

      {/* Modal de imagen */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-bg-secondary/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              layoutId={`image-${selectedImage.id}`}
              className="relative max-w-5xl w-full aspect-[16/9] rounded-2xl overflow-hidden"
            >
              <img
                src={selectedImage.url}
                alt={selectedImage.alt}
                className="w-full h-full object-contain"
              />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute top-4 right-4 text-white bg-bg-secondary/50 rounded-full p-2 hover:bg-bg-secondary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage(null);
                }}
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
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
