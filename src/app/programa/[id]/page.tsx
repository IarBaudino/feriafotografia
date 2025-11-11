"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getDocument } from "@/lib/firestore-helpers";
import { Program, ProgramDay, ProgramActivity } from "@/lib/program-types";
import { useParams } from "next/navigation";

export default function ProgramaPage() {
  const params = useParams();
  const programId = params.id as string;
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (programId) {
      loadProgram();
    }
  }, [programId]);

  const loadProgram = async () => {
    try {
      setIsLoading(true);
      const programData = await getDocument("programs", programId);

      if (programData) {
        // Convertir fechas de Firestore Timestamps a Date
        const processedProgram: Program = {
          ...programData,
          days: (programData as any).days?.map((day: any) => ({
            ...day,
            date: day.date?.toDate
              ? day.date.toDate()
              : day.date instanceof Date
              ? day.date
              : new Date(day.date),
          })) || [],
        } as Program;
        setProgram(processedProgram);
      }
    } catch (error) {
      console.error("Error cargando programa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    // Si ya está en formato HH:MM, devolverlo
    if (time.match(/^\d{1,2}:\d{2}$/)) {
      return time;
    }
    return time;
  };

  const groupActivitiesByCategory = (activities: ProgramActivity[]) => {
    const grouped: Record<string, ProgramActivity[]> = {};
    activities.forEach((activity) => {
      if (!grouped[activity.category]) {
        grouped[activity.category] = [];
      }
      grouped[activity.category].push(activity);
    });
    return grouped;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-lg text-bg-secondary font-bevietnam">Cargando programa...</p>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <p className="text-lg text-bg-secondary font-bevietnam">
          Programa no encontrado
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary pt-20 md:pt-24">
      <div className="container-width py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Encabezado */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-bg-secondary font-bevietnam mb-4">
              Programación
            </h1>
            <h2 className="text-2xl font-bold text-bg-secondary font-bevietnam mb-4">
              📍 {program.title}
            </h2>
            <p className="text-lg text-text-primary font-bevietnam mb-2">
              {program.date_range} – {program.location}
            </p>
            {program.note && (
              <p className="text-text-primary font-bevietnam font-normal italic">
                {program.note}
              </p>
            )}
          </div>

          {/* Días */}
          {program.days.map((day: ProgramDay, dayIndex: number) => {
            const groupedActivities = groupActivitiesByCategory(day.activities);

            return (
              <motion.div
                key={dayIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
                className="mb-12 bg-bg-secondary rounded-lg p-8"
              >
                <h3 className="text-2xl font-bold text-bg-primary font-bevietnam mb-6">
                  DÍA {day.day_number} — {day.date_label}
                </h3>

                {/* Actividades agrupadas por categoría */}
                {Object.entries(groupedActivities).map(
                  ([category, activities]) => (
                    <div key={category} className="mb-8">
                      <h4 className="text-xl font-bold text-bg-primary font-bevietnam mb-4">
                        {category}
                      </h4>

                      {/* Ordenar actividades por hora */}
                      {activities
                        .sort((a, b) => {
                          const timeA = a.time || "";
                          const timeB = b.time || "";
                          return timeA.localeCompare(timeB);
                        })
                        .map((activity, activityIndex) => (
                          <div
                            key={activityIndex}
                            className="mb-6 pl-4 border-l-4 border-accent-blue"
                          >
                            <div className="flex items-start gap-3 mb-2">
                              {activity.time && (
                                <span className="font-bold text-accent-blue font-bevietnam whitespace-nowrap">
                                  {formatTime(activity.time)} —
                                </span>
                              )}
                              <div className="flex-1">
                                <h5 className="font-bold text-bg-primary font-bevietnam mb-1">
                                  {activity.title}
                                </h5>
                                {activity.description && (
                                  <p className="text-text-primary font-bevietnam font-normal mb-2">
                                    {activity.description}
                                  </p>
                                )}
                                {activity.location && (
                                  <p className="text-text-primary font-bevietnam font-normal mb-1">
                                    {activity.location}
                                  </p>
                                )}
                                {activity.coordinator && (
                                  <p className="text-text-primary font-bevietnam font-normal italic">
                                    {activity.coordinator}
                                  </p>
                                )}
                                {activity.link && (
                                  <a
                                    href={activity.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-accent-blue hover:text-accent-blue/80 font-bevietnam font-bold underline"
                                  >
                                    Inscribirse aquí
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )
                )}
              </motion.div>
            );
          })}

          {program.days.length === 0 && (
            <div className="bg-bg-secondary rounded-lg p-8 text-center">
              <p className="text-text-primary font-bevietnam">
                El programa aún no está disponible.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

