"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiCalendar,
  HiLocationMarker,
  HiExternalLink,
  HiFilter,
} from "react-icons/hi";
import { getCollection } from "@/lib/firestore-helpers";

interface Event {
  id: string;
  title: string;
  type: "curso" | "evento";
  date: any; // Firebase Timestamp
  endDate?: any; // Firebase Timestamp
  location: string;
  shortDescription: string;
  description: string;
  link?: string;
  image?: string;
  organizer: string;
  created_at?: any; // Firebase Timestamp
  updated_at?: any; // Firebase Timestamp
}

// Los eventos ahora se cargan desde Firebase

export default function CulturalAgenda() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"todos" | "curso" | "evento">("todos");
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log("CulturalAgenda: Cargando eventos desde Firebase...");

        const eventsData = await getCollection("events");
        console.log("CulturalAgenda: Eventos cargados:", eventsData);

        if (eventsData && eventsData.length > 0) {
          // Procesar fechas de Firebase
          const processedEvents = eventsData.map((event: any) => ({
            ...event,
            date: event.date?.toDate
              ? event.date.toDate()
              : new Date(event.date),
            endDate: event.endDate?.toDate
              ? event.endDate.toDate()
              : event.endDate
              ? new Date(event.endDate)
              : undefined,
            created_at: event.created_at?.toDate
              ? event.created_at.toDate()
              : new Date(event.created_at),
            updated_at: event.updated_at?.toDate
              ? event.updated_at.toDate()
              : new Date(event.updated_at),
          }));

          // Ordenar por fecha
          const sortedEvents = processedEvents.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          );

          setEvents(sortedEvents);
        } else {
          console.log("CulturalAgenda: No se encontraron eventos");
          setEvents([]);
        }
      } catch (error) {
        console.error("CulturalAgenda: Error cargando eventos:", error);
        setError("Error cargando eventos");
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

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

  if (isLoading) {
    return (
      <section
        id="agenda"
        className="section-padding bg-bg-primary overflow-hidden"
      >
        <div className="container-width">
          <div className="text-center">
            <h2 className="heading-2 text-bg-secondary font-bevietnam font-bold">
              Agenda Cultural
            </h2>
            <p className="mt-2 text-text-primary/80 font-bevietnam font-normal">
              Cargando eventos...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        id="agenda"
        className="section-padding bg-bg-primary overflow-hidden"
      >
        <div className="container-width">
          <div className="text-center">
            <h2 className="heading-2 text-bg-secondary font-bevietnam font-bold">
              Agenda Cultural
            </h2>
            <p className="mt-2 text-red-500 font-bevietnam font-normal">
              {error}
            </p>
          </div>
        </div>
      </section>
    );
  }

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
                      <span className="font-joly italic text-text-primary">
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
                        <motion.div
                          className="font-bevietnam font-normal text-text-primary"
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.3 }}
                          dangerouslySetInnerHTML={{
                            __html: event.description,
                          }}
                        />
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
