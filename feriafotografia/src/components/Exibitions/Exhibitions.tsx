'use client'
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Exhibition {
  id: number;
  title: string;
  description: string;
  images: string[];
}

const exhibitions: Exhibition[] = [
  {
    id: 1,
    title: "Exposición Online 2024",
    description: "Selección de obras destacadas",
    images: [
      "/exhibitions/expo1.jpg",
      "/exhibitions/expo2.jpg",
      // Agregar más imágenes
    ]
  },
  // Agregar más exposiciones
];

export default function Exhibitions() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="exposiciones" className="py-20 px-4 md:px-8 bg-bg-primary">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-3xl font-bold mb-12 text-bg-secondary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Exposiciones Online
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {exhibitions.map(exhibition => (
            <motion.div
              key={exhibition.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4 text-bg-secondary">
                  {exhibition.title}
                </h3>
                <p className="text-text-primary mb-4">
                  {exhibition.description}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {exhibition.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className="aspect-square overflow-hidden rounded-lg"
                    >
                      <img 
                        src={image} 
                        alt={`${exhibition.title} - imagen ${index + 1}`}
                        className="w-full h-full object-cover transition-transform hover:scale-110"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal para ver imagen ampliada */}
      {selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Imagen ampliada"
            className="max-w-full max-h-[90vh] object-contain"
          />
        </motion.div>
      )}
    </section>
  );
} 