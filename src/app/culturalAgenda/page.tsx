"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PublicSidebar from "@/components/Sidebar/PublicSidebar";
import { getCollection } from "@/lib/firestore-helpers";

interface Event {
  id: string;
  type: string;
  date: string;
  end_date: string;
  location: string;
  description: string;
  short_description?: string;
  image_url?: string;
  category_name: string;
  instructor?: string;
  speaker?: string;
  link?: string;
}

export default function CulturalAgendaPage() {
  const [currentCategory, setCurrentCategory] = useState<string>("todos");
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadEvents();
    loadCategories();
  }, []);

  const loadEvents = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const data = await getCollection("events");

      if (data) {
        // Convertir TODOS los campos primero
        const processedEvents = data.map((event: any) => ({
          id: event.id,
          type: event.type || "",
          date: event.date?.toDate
            ? event.date.toDate().toISOString().split("T")[0]
            : event.date,
          end_date: event.end_date || "",
          location: event.location || "",
          description: event.description || "",
          short_description: event.short_description || "",
          image_url: event.image_url || "",
          category_name: event.category_name || "",
          instructor: event.instructor || "",
          speaker: event.speaker || "",
          link: event.link || "",
        }));

        // Separar eventos futuros y pasados
        const futureEvents = processedEvents.filter(
          (event) => event.date >= today
        );
        const pastEvents = processedEvents.filter(
          (event) => event.date < today
        );

        // Ordenar futuros ascendente (próximos primero)
        const sortedFuture = futureEvents.sort((a, b) => {
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        // Ordenar pasados descendente (más recientes primero)
        const sortedPast = pastEvents.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // Combinar: futuros primero, luego pasados
        setEvents([...sortedFuture, ...sortedPast]);
      }
    } catch (error) {
      console.error("❌ Error cargando eventos:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await getCollection("events");

      if (data && data.length > 0) {
        const uniqueCategories = Array.from(
          new Set(
            (data as Event[])
              .map((event) => event.category_name)
              .filter(Boolean)
          )
        );
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("❌ Error cargando categorías:", error);
    }
  };

  // Función para verificar si un evento ya pasó
  const isEventPast = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDateObj = new Date(eventDate);
    return eventDateObj < today;
  };

  const filteredEvents =
    currentCategory === "todos"
      ? events
      : events.filter((event) => event.category_name === currentCategory);

  const sidebarSections = [
    {
      title: "Categorías",
      items: [
        {
          id: "todos",
          title: "Todos los eventos",
          description: "Ver todos los eventos",
          year: "",
        },
        ...categories.map((cat) => ({
          id: cat,
          title: cat,
          description: `Ver eventos de ${cat}`,
          year: "",
        })),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <PublicSidebar
        sections={sidebarSections}
        currentId={currentCategory}
        onSelect={(id) => setCurrentCategory(id)}
        title="Agenda Cultural"
      />

      <main className="md:pl-64 pt-20">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            key={currentCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            <h1 className="text-4xl md:text-5xl font-bevietnam font-bold text-bg-secondary mb-8">
              {currentCategory === "todos"
                ? "Todos los eventos"
                : currentCategory}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg
                      className="w-16 h-16 mx-auto"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bevietnam font-bold text-gray-600 mb-2">
                    No hay eventos programados
                  </h3>
                  <p className="text-gray-500">
                    {currentCategory === "todos"
                      ? "No hay eventos futuros en este momento."
                      : `No hay eventos futuros en la categoría "${currentCategory}".`}
                  </p>
                </div>
              ) : (
                filteredEvents.map((event) => {
                  const isPast = isEventPast(event.date);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 ${
                        isPast ? "opacity-70" : ""
                      }`}
                    >
                      {event.image_url && (
                        <div className="aspect-[4/3] overflow-hidden relative">
                          <img
                            src={event.image_url}
                            alt={event.type}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                          />
                          {isPast && (
                            <div className="absolute top-2 right-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                              Finalizado
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bevietnam font-bold text-bg-secondary">
                            {event.type}
                          </h3>
                          {isPast && !event.image_url && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                              Finalizado
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-joly italic text-accent-blue mb-4">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                        <div className="space-y-2 text-sm text-text-primary/80">
                          <p className="font-bevietnam">
                            <span className="text-accent-green">
                              Ubicación:
                            </span>{" "}
                            {event.location}
                          </p>
                          {event.instructor && (
                            <p className="font-bevietnam">
                              <span className="text-accent-green">
                                Instructor:
                              </span>{" "}
                              {event.instructor}
                            </p>
                          )}
                          {event.speaker && (
                            <p className="font-bevietnam">
                              <span className="text-accent-green">
                                Ponente:
                              </span>{" "}
                              {event.speaker}
                            </p>
                          )}
                          <div
                            className="mt-4"
                            dangerouslySetInnerHTML={{
                              __html: event.description,
                            }}
                          />
                          {event.link && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <a
                                href={event.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 font-medium transition-colors"
                              >
                                Link del evento
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                  />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
