"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Masonry from "react-masonry-css";
import { useEffect, useState } from "react";
import {
  getCollection,
  getDocumentsWithFilter,
  removeDuplicateImages,
} from "@/lib/firestore-helpers";

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
        const aboutDataArray = await getCollection("about");
        if (aboutDataArray && aboutDataArray.length > 0) {
          const processedAbout = {
            ...aboutDataArray[0],
            updated_at: aboutDataArray[0].updated_at?.toDate
              ? aboutDataArray[0].updated_at.toDate()
              : new Date(aboutDataArray[0].updated_at),
          };
          setAboutData(processedAbout);
        }

        // Obtener imágenes
        const imagesData = await getDocumentsWithFilter(
          "images",
          "section",
          "about"
        );

        if (imagesData && imagesData.length > 0) {
          console.log("🔍 IMÁGENES ORIGINALES DEL ABOUT:");
          console.log(`📊 Total imágenes encontradas: ${imagesData.length}`);
          imagesData.forEach((img, index) => {
            console.log(`  ${index + 1}. ID: ${img.id}`);
            console.log(`      URL COMPLETA: ${img.url}`);
          });

          // Filtrar duplicados por URL
          const uniqueImages = removeDuplicateImages(imagesData);

          console.log("\n🧹 DESPUÉS DEL FILTRO DE DUPLICADOS:");
          console.log(`📊 Imágenes únicas: ${uniqueImages.length}`);
          console.log(
            `📊 Duplicados eliminados: ${
              imagesData.length - uniqueImages.length
            }`
          );
          uniqueImages.forEach((img, index) => {
            console.log(
              `  ${index + 1}. ID: ${img.id} | URL: ${img.url?.substring(
                0,
                80
              )}...`
            );
          });

          const formattedImages = uniqueImages.map((img) => ({
            src: `${img.url}?v=${Date.now()}`,
            alt: img.alt || "Feria Fotografía",
            className:
              "mb-4 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300",
          }));

          console.log("\n🎨 IMÁGENES FINALES QUE SE MUESTRAN:");
          console.log(`📊 Total imágenes a mostrar: ${formattedImages.length}`);
          formattedImages.forEach((img, index) => {
            console.log(
              `  ${index + 1}. SRC: ${img.src?.substring(0, 80)}... | ALT: ${
                img.alt
              }`
            );
          });

          setCollageImages(formattedImages);
        } else {
          console.log("❌ No se encontraron imágenes en el About");
          setCollageImages([]);
        }
      } catch (error: any) {
        console.error("❌ Error fetching data:", error);
        console.error("Detalles del error:", {
          message: error?.message,
          code: error?.code,
          stack: error?.stack,
        });
        
        // Mostrar mensaje de error más detallado
        if (error?.code === 'permission-denied') {
          console.error("⚠️ Error de permisos: Las reglas de Firestore pueden estar bloqueando el acceso");
        } else if (error?.code === 'unavailable') {
          console.error("⚠️ Error de conexión: Firebase no está disponible. Verifica tu conexión a internet.");
        } else if (error?.message?.includes('Missing or insufficient permissions')) {
          console.error("⚠️ Error de permisos: Verifica las reglas de seguridad de Firestore");
        }
        
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
    <section id="el proyecto" className="section-padding bg-bg-primary">
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
