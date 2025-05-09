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

// Imágenes por defecto como fallback
const defaultCollageImages: CollageImage[] = [
  {
    src: "/imagenes/image1.jpg",
    alt: "Feria Fotografía - Ambiente",
    className:
      "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
  },
  // ... resto de las imágenes por defecto ...
];

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

        // Si no hay datos, usar las imágenes por defecto
        if (!imagesData || imagesData.length === 0) {
          setCollageImages(defaultCollageImages);
        } else {
          const formattedImages = imagesData.map((img) => ({
            src: img.url,
            alt: img.alt || "Feria Fotografía",
            className:
              "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
          }));
          setCollageImages(formattedImages);
        }

        if (aboutData) {
          setAboutData(aboutData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        // En caso de error, usar las imágenes por defecto
        setCollageImages(defaultCollageImages);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = fontStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
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
