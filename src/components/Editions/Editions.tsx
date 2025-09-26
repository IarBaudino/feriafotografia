"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiChevronDown, HiCalendar, HiLocationMarker } from "react-icons/hi";
import {
  getCollection,
  getDocumentsWithFilter,
  removeDuplicateImages,
} from "@/lib/firestore-helpers";

interface Edition {
  id: string;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  participants?: number;
  visitors?: number;
}

// Datos hardcodeados eliminados - ahora se cargan desde Firebase

export default function Editions() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [selectedEdition, setSelectedEdition] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEditions() {
      try {
        // Obtener ediciones desde Firebase
        const editionsData = await getCollection("editions");

        if (editionsData && editionsData.length > 0) {
          // Ordenar por fecha
          const sortedEditions = editionsData.sort((a, b) => {
            const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return dateB.getTime() - dateA.getTime();
          });

          // Obtener imágenes para cada edición
          const editionsWithImages = await Promise.all(
            sortedEditions.map(async (edition) => {
              console.log(
                `\n🔍 PROCESANDO EDICIÓN: ${edition.title} (ID: ${edition.id})`
              );

              const imagesData = await getDocumentsWithFilter(
                "images",
                "section_id",
                edition.id
              );

              console.log(
                `📊 Imágenes encontradas para ${edition.title}: ${imagesData.length}`
              );
              imagesData.forEach((img, index) => {
                console.log(
                  `  ${index + 1}. ID: ${img.id} | URL: ${img.url?.substring(
                    0,
                    80
                  )}...`
                );
              });

              // Filtrar duplicados por URL
              const uniqueImages = removeDuplicateImages(imagesData);

              console.log(
                `🧹 Después del filtro: ${uniqueImages.length} imágenes únicas`
              );
              console.log(
                `📊 Duplicados eliminados: ${
                  imagesData.length - uniqueImages.length
                }`
              );

              // Usar la primera imagen como imagen principal
              const imageUrl =
                uniqueImages.length > 0 ? uniqueImages[0].url : "";

              console.log(
                `🎨 Imagen principal seleccionada: ${imageUrl?.substring(
                  0,
                  80
                )}...`
              );

              return {
                id: edition.id,
                date: edition.date?.toDate
                  ? edition.date.toDate().toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                    })
                  : new Date(edition.date).toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                    }),
                title: edition.title,
                description: edition.description,
                imageUrl: imageUrl,
                location: edition.location,
                participants: edition.participants,
                visitors: edition.visitors,
              };
            })
          );

          setEditions(editionsWithImages);
        }
      } catch (error) {
        console.error("Error cargando ediciones:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadEditions();
  }, []);

  if (isLoading) {
    return (
      <section className="section-padding bg-bg-primary">
        <div className="container-width">
          <div className="text-center py-12">
            <p className="text-lg text-bg-secondary font-bevietnam">
              Cargando ediciones...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding bg-bg-primary">
      <div className="container-width">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="heading-2 text-bg-secondary font-bevietnam font-bold">
            Ediciones Anteriores
          </h2>
          <p className="mt-2 text-text-primary/80 font-bevietnam font-normal">
            Un recorrido por nuestra historia
          </p>
        </motion.div>

        <div className="grid gap-6 max-w-4xl mx-auto">
          {editions.length > 0 ? (
            editions.map((edition, index) => (
              <motion.div
                key={edition.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div>
                      <span className="font-joly italic text-bg-secondary">
                        {edition.date}
                      </span>
                      <h3 className="text-xl font-bevietnam font-bold text-bg-secondary mt-1">
                        {edition.title}
                      </h3>
                    </div>
                    <button
                      onClick={() =>
                        setSelectedEdition(
                          selectedEdition === edition.id ? null : edition.id
                        )
                      }
                      className="mt-4 md:mt-0 text-bg-secondary hover:text-accent-blue transition-colors"
                    >
                      <HiChevronDown
                        size={24}
                        className={`transform transition-transform duration-300 ${
                          selectedEdition === edition.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-text-primary/80">
                    <div className="flex items-center gap-2">
                      <HiCalendar className="text-bg-secondary" />
                      <span className="font-bevietnam font-thin italic">
                        {edition.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiLocationMarker className="text-bg-secondary" />
                      <span className="font-bevietnam font-thin italic">
                        {edition.location}
                      </span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {selectedEdition === edition.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-6 space-y-4">
                          {edition.imageUrl && (
                            <div className="aspect-video relative rounded-lg overflow-hidden">
                              <img
                                src={`${edition.imageUrl}?v=${Date.now()}`}
                                alt={edition.title}
                                className="object-cover w-full h-full"
                              />
                            </div>
                          )}
                          <p className="text-text-primary font-bevietnam font-normal">
                            {edition.description}
                          </p>
                          {(edition.participants || edition.visitors) && (
                            <div className="flex gap-6 pt-4">
                              {edition.participants && (
                                <div className="text-center">
                                  <span className="block text-2xl font-bold text-bg-secondary">
                                    {edition.participants}
                                  </span>
                                  <span className="text-sm text-text-primary/60 font-bevietnam font-thin">
                                    Participantes
                                  </span>
                                </div>
                              )}
                              {edition.visitors && (
                                <div className="text-center">
                                  <span className="block text-2xl font-bold text-bg-secondary">
                                    {edition.visitors}
                                  </span>
                                  <span className="text-sm text-text-primary/60 font-bevietnam font-thin">
                                    Visitantes
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-lg text-text-primary/60 font-bevietnam">
                No hay ediciones disponibles
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
