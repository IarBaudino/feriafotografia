'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';

interface Edition {
  id: number;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
}

const editions: Edition[] = [
  {
    id: 1,
    date: "Diciembre 2023",
    title: "9na Edición - PINTA BA PHOTO",
    description: "Feria de publicaciones independientes en el marco de PINTA BA PHOTO.",
    imageUrl: "/editions/edition-9.jpg",
    location: "Ciudad de México"
  },
  // Agregar más ediciones aquí
];

export default function Editions() {
  const [selectedEdition, setSelectedEdition] = useState<number | null>(null);

  return (
    <section id="ediciones" className="py-20 px-4 md:px-8 bg-bg-secondary">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-3xl font-bevietnam font-bold mb-8 text-bg-primary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Ediciones Anteriores
        </motion.h2>
        <div className="space-y-4">
          {editions.map((edition) => (
            <motion.div
              key={edition.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-bg-primary rounded-lg overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 flex justify-between items-center"
                onClick={() => setSelectedEdition(selectedEdition === edition.id ? null : edition.id)}
              >
                <div>
                  <span className="font-joly italic text-text-primary">
                    {edition.date}
                  </span>
                  <h3 className="font-bevietnam font-bold text-text-primary">
                    {edition.title}
                  </h3>
                </div>
                <HiChevronDown
                  className={`transform transition-transform ${
                    selectedEdition === edition.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {selectedEdition === edition.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-4"
                  >
                    <div className="aspect-video relative mb-4">
                      <img
                        src={edition.imageUrl}
                        alt={edition.title}
                        className="object-cover w-full h-full rounded"
                      />
                    </div>
                    <p className="text-text-primary font-bevietnam font-normal">
                      {edition.description}
                    </p>
                    <div className="mt-4">
                      <span className="text-thin">
                        Lugar: {edition.location}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 