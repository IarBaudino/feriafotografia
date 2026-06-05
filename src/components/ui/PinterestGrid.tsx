"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { HiTrash } from "react-icons/hi";

interface PinterestGridProps {
  images: Array<{
    id: string;
    url: string;
    alt?: string;
    title?: string;
    artist?: string;
    social?: string;
  }>;
  onImageClick?: (image: any) => void;
  onDeleteImage?: (imageUrl: string) => void;
  showDeleteButtons?: boolean;
  className?: string;
}

export default function PinterestGrid({
  images,
  onImageClick,
  onDeleteImage,
  showDeleteButtons = false,
  className = "",
}: PinterestGridProps) {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const handleImageClick = (image: any) => {
    if (onImageClick) {
      onImageClick(image);
    } else {
      setSelectedImage(image);
    }
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Función para calcular alturas aleatorias para el efecto Pinterest
  const getRandomHeight = (index: number) => {
    const heights = [
      "aspect-[3/4]",
      "aspect-[4/5]",
      "aspect-square",
      "aspect-[5/4]",
      "aspect-[4/3]",
    ];
    return heights[index % heights.length];
  };

  return (
    <>
      <div
        className={`columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 ${className}`}
      >
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="break-inside-avoid mb-4 group cursor-pointer"
            onClick={() => handleImageClick(image)}
          >
            <div
              className={`relative overflow-hidden rounded-lg bg-gray-100 ${getRandomHeight(
                index
              )}`}
            >
              <motion.img
                src={image.url}
                alt={image.alt || `Imagen ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Botón de eliminar */}
              {showDeleteButtons && onDeleteImage && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteImage(image.url);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
                  title="Eliminar imagen"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              )}

              {/* Overlay con información */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  {image.title && (
                    <h4 className="font-bevietnam font-bold text-sm mb-1">
                      {image.title}
                    </h4>
                  )}
                  {image.artist && (
                    <p className="font-bevietnam text-xs opacity-90 mb-1">
                      {image.artist}
                    </p>
                  )}
                  {image.social && (
                    <p className="font-bevietnam text-xs text-accent-blue">
                      @{image.social}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal para vista ampliada */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.url}
              alt={selectedImage.alt}
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
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
            </button>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
