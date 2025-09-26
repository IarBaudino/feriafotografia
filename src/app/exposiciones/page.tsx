"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PublicSidebar from "@/components/Sidebar/PublicSidebar";
import { getCollection, getDocumentsWithFilter } from "@/lib/firestore-helpers";
import Image from "next/image";
import Masonry from "react-masonry-css";
import "react-quill/dist/quill.snow.css";

interface Exposicion {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

interface ExposicionImage {
  id: string;
  url: string;
  alt: string;
  section_id: string;
  artist_name: string;
  artwork_title: string;
  social_media: string;
  is_main: boolean;
}

// Firebase ya está configurado en firestore-helpers

export default function ExposicionesPage() {
  const [exposiciones, setExposiciones] = useState<Exposicion[]>([]);
  const [exposicionImages, setExposicionImages] = useState<
    Record<string, ExposicionImage[]>
  >({});
  const [currentExposicion, setCurrentExposicion] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ExposicionImage | null>(
    null
  );

  useEffect(() => {
    loadExposiciones();
  }, []);

  const loadExposiciones = async () => {
    try {
      const exposicionesData = await getCollection("exhibitions");

      if (exposicionesData && exposicionesData.length > 0) {
        // Ordenar por fecha de creación descendente
        const sortedExposiciones = exposicionesData.sort((a, b) => {
          const dateA = a.created_at?.toDate
            ? a.created_at.toDate()
            : new Date(a.created_at);
          const dateB = b.created_at?.toDate
            ? b.created_at.toDate()
            : new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        });

        setExposiciones(sortedExposiciones);
        setCurrentExposicion(sortedExposiciones[0].id);

        const imagesData = await getDocumentsWithFilter(
          "images",
          "section",
          "exhibitions"
        );

        if (imagesData) {
          const imagesByExposition = imagesData.reduce((acc, img) => {
            if (!acc[img.section_id]) {
              acc[img.section_id] = [];
            }
            acc[img.section_id].push(img);
            return acc;
          }, {} as Record<string, ExposicionImage[]>);

          setExposicionImages(imagesByExposition);
        }
      }
    } catch (error) {
      console.error("Error cargando exposiciones:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedExposicion = exposiciones.find(
    (exp) => exp.id === currentExposicion
  );

  const sidebarSections = [
    {
      title: "Exposiciones",
      items: exposiciones.map((exp) => ({
        id: exp.id,
        title: exp.title,
        year: new Date(exp.created_at).getFullYear().toString(),
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

  const getMainImage = (exposicionId: string): ExposicionImage | undefined => {
    if (!exposicionId || !exposicionImages[exposicionId]) return undefined;
    return exposicionImages[exposicionId].find(
      (img: ExposicionImage) => img.is_main
    );
  };

  // Y luego usarlo:
  const mainImage = selectedExposicion
    ? getMainImage(selectedExposicion.id)
    : undefined;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-lg text-bg-secondary">Cargando exposiciones...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicSidebar
        sections={sidebarSections}
        currentId={currentExposicion}
        onSelect={setCurrentExposicion}
        title="Exposiciones"
      />

      <main className="md:pl-64 pt-28">
        {/* Si no hay exposición seleccionada, mostrar solo la lista de títulos */}
        {currentExposicion === "" ? (
          <div className="container mx-auto px-6 py-12">
            <div className="grid gap-6 max-w-3xl mx-auto">
              {exposiciones.map((expo) => (
                <div
                  key={expo.id}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:bg-accent-blue/5 transition-colors"
                  onClick={() => setCurrentExposicion(expo.id)}
                >
                  <h3 className="text-2xl font-bevietnam font-bold text-bg-secondary">
                    {expo.title}
                  </h3>
                </div>
              ))}
            </div>
          </div>
        ) : selectedExposicion ? (
          <div className="container mx-auto px-6 py-12">
            <motion.div
              key={currentExposicion}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="max-w-7xl mx-auto"
            >
              {/* Header de la exposición */}
              <div className="relative mb-24">
                <motion.div
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 0.1, y: 0 }}
                  transition={{ duration: 1 }}
                  className="absolute -top-20 -left-20 text-[12rem] font-bold text-accent-blue/5 pointer-events-none select-none"
                >
                  {new Date(selectedExposicion.created_at).getFullYear()}
                </motion.div>

                {/* Título */}
                <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-6xl font-bevietnam font-bold text-bg-secondary mb-6 bg-gradient-to-r from-accent-blue to-bg-secondary bg-clip-text text-transparent">
                    {selectedExposicion.title}
                  </h2>
                </div>

                {/* Texto en dos columnas centradas */}
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Primera columna de texto */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="relative"
                    >
                      <div
                        className="prose prose-lg max-w-none text-justify [&_p]:mb-4 [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_ul]:list-disc [&_ol]:list-decimal [&_ul,&_ol]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-accent-blue [&_blockquote]:pl-4 [&_blockquote]:italic [&_p:first-of-type]:mt-0 [&_.ql-font-bevietnam]:font-bevietnam [&_.ql-font-joly]:font-joly"
                        dangerouslySetInnerHTML={{
                          __html: selectedExposicion.description.slice(
                            0,
                            selectedExposicion.description.length / 2
                          ),
                        }}
                      />
                    </motion.div>

                    {/* Segunda columna de texto */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="relative"
                    >
                      <div
                        className="prose prose-lg max-w-none text-justify [&_p]:mb-4 [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_ul]:list-disc [&_ol]:list-decimal [&_ul,&_ol]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-accent-blue [&_blockquote]:pl-4 [&_blockquote]:italic [&_p:first-of-type]:mt-0 [&_.ql-font-bevietnam]:font-bevietnam [&_.ql-font-joly]:font-joly"
                        dangerouslySetInnerHTML={{
                          __html: selectedExposicion.description.slice(
                            selectedExposicion.description.length / 2
                          ),
                        }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Galería de imágenes */}
              {exposicionImages[selectedExposicion.id]?.length > 0 && (
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
                    {exposicionImages[selectedExposicion.id].map((img, i) => {
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
                              alt={img.alt || `Imagen ${i + 1}`}
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
                                {img.artwork_title && (
                                  <h4 className="text-white font-bevietnam font-bold mb-1">
                                    {img.artwork_title}
                                  </h4>
                                )}
                                {img.artist_name && (
                                  <p className="text-white/90 text-sm font-bevietnam mb-1">
                                    {img.artist_name}
                                  </p>
                                )}
                                {img.social_media && (
                                  <a
                                    href={
                                      img.social_media.startsWith("http")
                                        ? img.social_media
                                        : `https://${img.social_media}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-accent-blue text-sm hover:underline"
                                  >
                                    @{img.social_media.split("/").pop()}
                                  </a>
                                )}
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
              No hay exposiciones disponibles
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
