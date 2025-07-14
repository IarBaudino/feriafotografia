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
  title: string;
  content: string;
  images: string[];
  updated_at: string;
}

// Agregar estilos globales para las fuentes
const fontStyles = `
  .ql-font-bevietnam {
    font-family: var(--font-bevietnam) !important;
  }
  .ql-font-joly {
    font-family: var(--font-joly) !important;
  }
`;

export default function About() {
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [collageImages, setCollageImages] = useState<CollageImage[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Obtener datos del about
        const { data: aboutData, error: aboutError } = await supabase
          .from("about")
          .select("*")
          .single();

        if (aboutError) {
          console.error("Error fetching about data:", aboutError);
          return;
        }

        // Obtener imágenes
        const { data: imagesData, error: imagesError } = await supabase
          .from("images")
          .select("*")
          .eq("section", "about");

        if (imagesError) {
          console.error("Error fetching images:", imagesError);
          return;
        }

        // Solo usar imágenes de la base de datos, no fallback
        if (imagesData && imagesData.length > 0) {
          const formattedImages = imagesData.map((img) => ({
            src: img.url,
            alt: img.alt || "Feria Fotografía",
            className:
              "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
          }));
          setCollageImages(formattedImages);
        } else {
          // Si no hay imágenes, mostrar array vacío
          setCollageImages([]);
        }

        if (aboutData) {
          setAboutData(aboutData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // En caso de error, mostrar array vacío
        setCollageImages([]);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = fontStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
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
              {aboutData?.title || "Sobre la Feria"}
            </h2>
            <div
              className="body-text space-y-6"
              dangerouslySetInnerHTML={{ __html: aboutData?.content || "" }}
            />
          </motion.div>

          {/* Collage de imágenes con Masonry */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="relative"
          >
            {collageImages.length > 0 ? (
              <Masonry
                breakpointCols={breakpointColumns}
                className="flex -ml-4 w-auto"
                columnClassName="pl-4 bg-clip-padding"
              >
                {collageImages.map((image, index) => (
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
                ))}
              </Masonry>
            ) : (
              <div className="text-center py-12">
                <p className="text-text-primary/60 font-bevietnam">
                  No hay imágenes disponibles
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
