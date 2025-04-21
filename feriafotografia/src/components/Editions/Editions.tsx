'use client'
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown, HiCalendar, HiLocationMarker } from 'react-icons/hi';

interface Edition {
  id: number;
  date: string;
  title: string;
  description: string;
  imageUrl: string;
  location: string;
  participants?: number;
  visitors?: number;
}

const editions: Edition[] = [
  {
    id: 1,
    date: "Diciembre 2023",
    title: "9na Edición - PINTA BA PHOTO",
    description: "Feria de publicaciones independientes en el marco de PINTA BA PHOTO. Una experiencia única que reunió a fotógrafos y amantes de la fotografía en un espacio de intercambio y exposición.",
    imageUrl: "/editions/edition-9.jpg",
    location: "Centro Cultural Recoleta",
    participants: 45,
    visitors: 800
  },
  {
    id: 2,
    date: "Octubre 2023",
    title: "8va Edición - FOCUS Uruguay",
    description: "Participación especial en el festival de fotografía FOCUS José Ignacio, presentando una selección curada de fanzines y publicaciones argentinas.",
    imageUrl: "/editions/edition-8.jpg",
    location: "José Ignacio, Uruguay",
    participants: 30,
    visitors: 600
  },
  // ... puedes agregar más ediciones
];

export default function Editions() {
  const [selectedEdition, setSelectedEdition] = useState<number | null>(null);

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
          {editions.map((edition, index) => (
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
                    onClick={() => setSelectedEdition(selectedEdition === edition.id ? null : edition.id)}
                    className="mt-4 md:mt-0 text-bg-secondary hover:text-accent-blue transition-colors"
                  >
                    <HiChevronDown
                      size={24}
                      className={`transform transition-transform duration-300 ${
                        selectedEdition === edition.id ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-text-primary/80">
                  <div className="flex items-center gap-2">
                    <HiCalendar className="text-bg-secondary" />
                    <span className="font-bevietnam font-thin italic">{edition.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HiLocationMarker className="text-bg-secondary" />
                    <span className="font-bevietnam font-thin italic">{edition.location}</span>
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
                        <div className="aspect-video relative rounded-lg overflow-hidden">
                          <img
                            src={edition.imageUrl}
                            alt={edition.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
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
          ))}
        </div>
      </div>
    </section>
  );
} 