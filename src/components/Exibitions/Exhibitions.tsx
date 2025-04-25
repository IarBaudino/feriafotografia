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
    ]
  },
  // Agregar más exposiciones
];

export default function Exhibitions() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <section id="exposiciones" className="section-padding bg-bg-primary">
      <div className="container-width">
        <motion.h2
          className="heading-2 text-bg-secondary mb-12 text-center font-bevietnam font-bold"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Exposiciones
        </motion.h2>

        <div className="space-y-12">
          {exhibitions.map((exhibition) => (
            <motion.div
              key={exhibition.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
            >
              <div className="p-6">
                <h3 className="text-xl font-bevietnam font-bold text-bg-secondary mb-4">
                  {exhibition.title}
                </h3>
                <p className="text-text-primary font-bevietnam font-normal mb-6">
                  {exhibition.description}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {exhibition.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(image)}
                      className="aspect-square relative rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                    >
                      <img
                        src={image}
                        alt={`${exhibition.title} - Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

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
      </div>
    </section>
  );
} 