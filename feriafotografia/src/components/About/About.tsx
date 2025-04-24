"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface CollageImage {
  src: string;
  alt: string;
  className: string;
}

interface AboutData {
  content: string;
}

const collageImages: CollageImage[] = [
  {
    src: "/imagenes/image1.jpg",
    alt: "Feria Fotografía - Ambiente",
    className:
      "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
  },
  {
    src: "/imagenes/image2.jpg",
    alt: "Feria Fotografía - Exposición",
    className:
      "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
  },
  {
    src: "/imagenes/image3.jpg",
    alt: "Feria Fotografía - Detalles",
    className:
      "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
  },
  {
    src: "/imagenes/image4.jpg",
    alt: "Feria Fotografía - Participantes",
    className:
      "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
  },
  {
    src: "/imagenes/image5.jpg",
    alt: "Feria Fotografía - Obras",
    className:
      "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
  },
  {
    src: "/imagenes/image6.jpg",
    alt: "Feria Fotografía - Visitantes",
    className:
      "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
  },
  {
    src: "/imagenes/image7.jpg",
    alt: "Feria Fotografía - Panorámica",
    className:
      "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
  },
];

export default function About() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [collageImages, setCollageImages] = useState<CollageImage[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: imagesData, error: imagesError } = await supabase
        .from("images")
        .select("*")
        .eq("section", "about");

      console.log("Supabase images response:", { imagesData, imagesError });

      if (imagesError) {
        console.error("Error fetching images:", imagesError);
      } else if (imagesData) {
        setCollageImages(
          imagesData.map((img: any) => ({
            src: img.url,
            alt: img.alt || "Feria Fotografía",
            className:
              "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
          }))
        );
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchAboutData() {
      const { data, error } = await supabase.from("about").select("*").single();

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Error fetching about data:", error);
      } else {
        setAboutData(data);
      }
    }

    fetchAboutData();
  }, []);

  const breakpointColumns = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <section id="la feria" className="section-padding bg-bg-primary">
      <div className="container-width">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="heading-2 text-bg-secondary mb-8 md:mb-12 font-bevietnam font-bold">
              Sobre la Feria
            </h2>
            <div className="body-text space-y-6">
              <p className="font-bevietnam font-normal">
                La Feria de Fotografía nace de las ganas de generar y alimentar
                los espacios de encuentro para todxs lxs que nos interesa la
                fotografía. Es una jornada para que nos conozcamos, para hablar
                de nuestros procesos y proyectos, para conocer el trabajo de
                otrxs, para encontrarnos con diferentes formas de producir y de
                materializar nuestras imágenes.
              </p>
              <p className="font-bevietnam font-normal">
                Para ver, para tocar, para levantar y preguntar. Una jornada en
                la que se encuentran desde libros, fanzines y prints hasta
                rollos, correas y textiles. Todo teniendo a la fotografía como
                hilo conductor y eje central.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-bg-secondary/10 p-6 md:p-8 rounded-lg"
              >
                <p className="font-joly italic">
                  Este proyecto cuenta con 9 ediciones realizadas entre 2023 y
                  2024 en las que participaron más de 400 proyectos y por las
                  que pasaron más de 3800 visitantes.
                </p>
              </motion.div>
              <p className="font-bevietnam font-normal">
                Se hizo en los barrios porteños de{" "}
                <span className="font-bevietnam font-thin italic">
                  Villa Crespo, Palermo, San Telmo y Núñez
                </span>
                , y también fuera de la capital, en{" "}
                <span className="font-bevietnam font-thin italic">
                  Vicente López y La Plata
                </span>
                . Además, fue convocado desde el festival de fotografía FOCUS
                José Ignacio (2023), en Uruguay, para presentar una selección de
                fanzines, y desde FELIFA (2023) y PINTA BA PHOTO (2024) para
                producir la feria de publicaciones independientes de ambos
                eventos.
              </p>
            </div>
          </motion.div>

          {/* Collage de imágenes con Masonry */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            <Masonry
              breakpointCols={breakpointColumns}
              className="flex -ml-4 w-auto"
              columnClassName="pl-4 bg-clip-padding"
            >
              {collageImages.length > 0 ? (
                collageImages.map((image, index) => (
                  <motion.div
                    key={image.src}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={image.className}
                  >
                    <div className="relative overflow-hidden">
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={500}
                        height={500}
                        className="w-full h-auto object-cover hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  </motion.div>
                ))
              ) : (
                <p>Cargando imágenes...</p>
              )}
            </Masonry>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
