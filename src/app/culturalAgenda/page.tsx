"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import PublicSidebar from "@/components/Sidebar/PublicSidebar";
import { supabase } from "@/lib/supabase";

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
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error cargando eventos:", error);
    }
  };

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("category_name")
        .not("category_name", "is", null);

      if (error) throw error;

      const uniqueCategories = Array.from(
        new Set(data.map((event) => event.category_name))
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const filteredEvents = currentCategory === "todos" 
    ? events 
    : events.filter(event => event.category_name === currentCategory);

  const sidebarSections = [
    {
      title: "Categorías",
      items: [
        {
          id: "todos",
          title: "Todos los eventos",
          description: "Ver todos los eventos",
        },
        ...categories.map((cat) => ({
          id: cat,
          title: cat,
          description: `Ver eventos de ${cat}`,
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
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                >
                  {event.image_url && (
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={event.image_url}
                        alt={event.type}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bevietnam font-bold text-bg-secondary mb-2">
                      {event.type}
                    </h3>
                    <p className="text-sm font-joly italic text-accent-blue mb-4">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <div className="space-y-2 text-sm text-text-primary/80">
                      <p className="font-bevietnam">
                        <span className="text-accent-green">Ubicación:</span>{" "}
                        {event.location}
                      </p>
                      {event.instructor && (
                        <p className="font-bevietnam">
                          <span className="text-accent-green">Instructor:</span>{" "}
                          {event.instructor}
                        </p>
                      )}
                      {event.speaker && (
                        <p className="font-bevietnam">
                          <span className="text-accent-green">Ponente:</span>{" "}
                          {event.speaker}
                        </p>
                      )}
                      <p className="mt-4">{event.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
