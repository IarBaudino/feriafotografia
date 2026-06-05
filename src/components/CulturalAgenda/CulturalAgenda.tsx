"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiCalendar,
  HiLocationMarker,
  HiExternalLink,
  HiFilter,
} from "react-icons/hi";

interface Event {
  id: number;
  title: string;
  type: "curso" | "evento";
  date: string;
  endDate?: string;
  location: string;
  shortDescription: string;
  description: string;
  link?: string;
  image?: string;
  organizer: string;
}

const events: Event[] = [
  {
    id: 1,
    title: "Taller de Fotografía Analógica",
    type: "curso",
    date: "2024-03-15",
    endDate: "2024-04-15",
    location: "Palermo, CABA",
    shortDescription:
      "Introducción al mundo de la fotografía analógica: técnicas básicas, manejo de cámara y proceso de revelado.",
    description:
      "Aprende las bases de la fotografía analógica, desde el manejo de la cámara hasta el revelado en laboratorio. Valor del curso: $25.000. Cupos limitados a 10 personas.",
    organizer: "Laboratorio Análogo",
    link: "https://ejemplo.com/curso",
    image: "/agenda/curso-analogica.jpg",
  },
  {
    id: 2,
    title: "Miradas del Sur - Exposición Fotográfica",
    type: "evento",
    date: "2024-03-20",
    endDate: "2024-04-10",
    location: "Centro Cultural Recoleta",
    shortDescription:
      "Exposición colectiva que reúne el trabajo de 15 fotógrafos emergentes del sur de América Latina.",
    description:
      "Una muestra colectiva que reúne el trabajo de 15 fotógrafos emergentes del sur de América Latina. La exposición explora las diferentes perspectivas sobre la vida cotidiana y los paisajes de la región. Entrada libre y gratuita.",
    organizer: "Colectivo Fotográfico del Sur",
    link: "https://ejemplo.com/miradas-del-sur",
    image: "/agenda/expo-miradas.jpg",
  },
  {
    id: 3,
    title: "Workshop de Retrato Editorial",
    type: "curso",
    date: "2024-04-05",
    location: "San Telmo, CABA",
    shortDescription:
      "Intensivo de un día donde aprenderás las técnicas fundamentales del retrato editorial.",
    description:
      "Intensivo de un día donde aprenderás las técnicas fundamentales del retrato editorial. Incluye práctica con modelo en estudio. Valor del workshop: $15.000. Incluye coffee break y material teórico.",
    organizer: "Estudio Visual",
    link: "https://ejemplo.com/workshop-retrato",
    image: "/agenda/workshop-retrato.jpg",
  },
  {
    id: 4,
    title: "Territorios Invisibles - Muestra Individual",
    type: "evento",
    date: "2024-03-25",
    endDate: "2024-04-25",
    location: "Galería Luz Verde, Villa Crespo",
    shortDescription:
      "Primera muestra individual de la fotógrafa María González.",
    description:
      "Primera muestra individual de la fotógrafa María González. Un recorrido visual por espacios urbanos olvidados y su transformación a través del tiempo. Inauguración: 19hs con la presencia de la artista. Entrada libre y gratuita.",
    organizer: "Galería Luz Verde",
    link: "https://ejemplo.com/territorios-invisibles",
    image: "/agenda/territorios.jpg",
  },
  {
    id: 5,
    title: "Curso de Iluminación Natural y Artificial",
    type: "curso",
    date: "2024-04-10",
    endDate: "2024-05-15",
    location: "Núñez, CABA",
    shortDescription:
      "Curso teórico-práctico sobre el manejo de la luz en fotografía.",
    description:
      "Curso teórico-práctico sobre el manejo de la luz en fotografía. 6 encuentros donde aprenderás desde el uso de la luz natural hasta el manejo de flashes y modificadores. Valor del curso: $30.000. Incluye equipo para prácticas.",
    organizer: "Escuela de Fotografía Creativa",
    link: "https://ejemplo.com/curso-iluminacion",
    image: "/agenda/curso-luz.jpg",
  },
  {
    id: 6,
    title: "Fotografía Urbana - Muestra Colectiva",
    type: "evento",
    date: "2024-04-15",
    endDate: "2024-05-15",
    location: "Centro Cultural San Martín",
    shortDescription:
      "20 fotógrafos urbanos presentan su visión de la ciudad a través de diferentes estilos y técnicas.",
    description:
      "20 fotógrafos urbanos presentan su visión de la ciudad a través de diferentes estilos y técnicas. La muestra incluye charlas con los artistas los días sábados. Visitas guiadas disponibles. Entrada gratuita.",
    organizer: "Colectivo Ciudad Visual",
    link: "https://ejemplo.com/foto-urbana",
    image: "/agenda/urbana.jpg",
  },
];

export default function CulturalAgenda() {
  const [filter, setFilter] = useState<"todos" | "curso" | "evento">("todos");
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95,
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
        ease: "easeOut",
      },
    }),
    hover: {
      y: -10,
      scale: 1.02,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.98,
    },
  };

  const expandVariants = {
    collapsed: {
      height: 0,
      opacity: 0,
    },
    expanded: {
      height: "auto",
      opacity: 1,
      transition: {
        height: {
          duration: 0.4,
          ease: "easeInOut",
        },
        opacity: {
          duration: 0.3,
          delay: 0.1,
        },
      },
    },
  };

  const filteredEvents = events
    .filter((event) => (filter === "todos" ? true : event.type === filter))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <section
      id="agenda"
      className="section-padding bg-bg-primary overflow-hidden"
    >
      <div className="container-width">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="heading-2 text-bg-secondary font-bevietnam font-bold">
            Agenda Cultural
          </h2>
          <p className="mt-2 text-text-primary/80 font-bevietnam font-normal">
            Descubre eventos y cursos de fotografía en la ciudad
          </p>
        </motion.div>

        {/* Filtros */}
        <div className="flex justify-center gap-4 mb-8">
          {["todos", "curso", "evento"].map((type) => (
            <motion.button
              key={type}
              onClick={() => setFilter(type as typeof filter)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`px-6 py-2 rounded-lg transition-all duration-300 font-bevietnam font-bold ${
                filter === type
                  ? "bg-bg-secondary text-bg-primary shadow-lg"
                  : "bg-white text-bg-secondary border-2 border-bg-secondary/20 hover:border-bg-secondary"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </motion.button>
          ))}
        </div>

        {/* Lista de eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                whileTap="tap"
                viewport={{ once: true, margin: "-50px" }}
                layout
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="p-6">
                  <motion.div
                    className="flex items-start justify-between mb-4"
                    layout
                  >
                    <div>
                      <motion.span
                        layout
                        className={`inline-block px-3 py-1 rounded-full text-sm font-bevietnam font-bold mb-2 ${
                          event.type === "curso"
                            ? "bg-accent-blue/20 text-bg-secondary"
                            : "bg-accent-green/20 text-accent-green"
                        }`}
                      >
                        {event.type.charAt(0).toUpperCase() +
                          event.type.slice(1)}
                      </motion.span>
                      <motion.h3
                        layout
                        className="text-xl font-bevietnam font-bold text-bg-secondary mb-2"
                      >
                        {event.title}
                      </motion.h3>
                      <motion.p
                        layout
                        className="text-text-primary/80 font-bevietnam font-normal text-sm"
                      >
                        {event.shortDescription}
                      </motion.p>
                    </div>
                  </motion.div>

                  <motion.div layout className="space-y-3">
                    <div className="flex items-center gap-2">
                      <HiCalendar className="text-bg-secondary" />
                      <span className="font-bevietnam italic text-text-primary">
                        {new Date(event.date).toLocaleDateString()}
                        {event.endDate && (
                          <> - {new Date(event.endDate).toLocaleDateString()}</>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiLocationMarker className="text-bg-secondary" />
                      <span className="font-bevietnam font-thin italic">
                        {event.location}
                      </span>
                    </div>
                  </motion.div>

                  <motion.button
                    onClick={() =>
                      setExpandedEvent(
                        expandedEvent === event.id ? null : event.id
                      )
                    }
                    className="mt-4 w-full text-left"
                    layout
                  >
                    <motion.div
                      variants={expandVariants}
                      initial="collapsed"
                      animate={
                        expandedEvent === event.id ? "expanded" : "collapsed"
                      }
                      className="overflow-hidden"
                    >
                      <div className="py-4 space-y-4">
                        {event.image && (
                          <motion.div
                            className="aspect-video relative rounded-lg overflow-hidden"
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <img
                              src={event.image}
                              alt={event.title}
                              className="object-cover w-full h-full"
                            />
                          </motion.div>
                        )}
                        <motion.p
                          className="font-bevietnam font-normal text-text-primary"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                        >
                          {event.description}
                        </motion.p>
                        <motion.div
                          className="flex justify-between items-center"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          <span className="font-bevietnam font-thin italic">
                            Organiza: {event.organizer}
                          </span>
                          {event.link && (
                            <a
                              href={event.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-bg-secondary hover:text-accent-blue transition-colors font-bevietnam font-bold group"
                            >
                              Más información
                              <HiExternalLink className="group-hover:translate-x-1 transition-transform" />
                            </a>
                          )}
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
