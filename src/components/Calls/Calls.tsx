"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getCollection } from "@/lib/firestore-helpers";
import {
  Program,
  ProgramActivity,
  ProgramDay,
} from "@/lib/program-types";

interface CallsContent {
  id?: string;
  is_active: boolean;
  deadline: string;
  feria_date?: string;
  location: string;
  form_link: string;
  title: string;
  description: string;
  horario?: string;
  created_at?: string;
  show_program?: boolean;
}

const groupActivitiesByCategory = (activities: ProgramActivity[]) => {
  const grouped: Record<string, ProgramActivity[]> = {};
  activities.forEach((activity) => {
    const category = activity.category || "OTROS";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(activity);
  });
  return grouped;
};

const formatTime = (time: string) => {
  if (!time) return "";
  if (/^\d{1,2}:\d{2}$/.test(time)) {
    return time;
  }
  return time;
};

export default function Calls() {
  const [callData, setCallData] = useState<CallsContent | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCallData();
  }, []);

  const loadCallData = async () => {
    try {
      console.log("Cargando datos de convocatoria...");
      const data = await getCollection("calls");

      console.log("Datos recibidos:", data);

      if (data && data.length > 0) {
        // Ordenar por fecha de creación y obtener el más reciente
        const sortedCalls = data.sort((a, b) => {
          const dateA = a.created_at?.toDate
            ? a.created_at.toDate()
            : a.updated_at?.toDate
            ? a.updated_at.toDate()
            : new Date(a.created_at || 0);
          const dateB = b.created_at?.toDate
            ? b.created_at.toDate()
            : b.updated_at?.toDate
            ? b.updated_at.toDate()
            : new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

        // Priorizar: activa > con show_program > más reciente
        const latestCall =
          sortedCalls.find((call) => Boolean(call.is_active)) ||
          sortedCalls.find((call) => Boolean(call.show_program)) ||
          sortedCalls[0];

        // Convertir Timestamps a strings ISO para las fechas
        const processedData = {
          id: latestCall.id,
          is_active: Boolean(latestCall.is_active),
          deadline: latestCall.deadline?.toDate
            ? latestCall.deadline.toDate().toISOString().split("T")[0]
            : latestCall.deadline || "",
          feria_date: latestCall.feria_date?.toDate
            ? latestCall.feria_date.toDate().toISOString().split("T")[0]
            : latestCall.feria_date || "",
          location: latestCall.location || "",
          form_link: latestCall.form_link || "",
          title: latestCall.title || "Convocatoria Abierta",
          description: latestCall.description || "",
          horario: latestCall.horario || "",
          show_program: Boolean(latestCall.show_program),
        };
        console.log("Datos procesados:", processedData);
        setCallData(processedData);
        setProgram(null);

        // Si la convocatoria está cerrada, buscar el programa relacionado
        if (!processedData.is_active && processedData.show_program) {
          try {
            console.log("🔍 Convocatoria cerrada, buscando programa...");
            // Buscar programas por la fecha de la feria o el más reciente
            const programs = await getCollection("programs");
            console.log("📋 Programas encontrados:", programs?.length || 0);
            
            if (programs && programs.length > 0) {
              // Ordenar por fecha de actualización y tomar el más reciente
              const sortedPrograms = programs.sort((a: any, b: any) => {
                const dateA = a.updated_at?.toDate
                  ? a.updated_at.toDate()
                  : a.created_at?.toDate
                  ? a.created_at.toDate()
                  : new Date(0);
                const dateB = b.updated_at?.toDate
                  ? b.updated_at.toDate()
                  : b.created_at?.toDate
                  ? b.created_at.toDate()
                  : new Date(0);
                return dateB.getTime() - dateA.getTime();
              });
              
              console.log("✅ Programa más reciente:", sortedPrograms[0]?.id, sortedPrograms[0]?.title);
              
              // Tomar el programa más reciente
              if (sortedPrograms[0]) {
                const latestProgram = sortedPrograms[0];
                const processedProgram: Program = {
                  ...latestProgram,
                  days:
                    (latestProgram as any).days?.map((day: any) => ({
                      ...day,
                      date: day.date?.toDate
                        ? day.date.toDate()
                        : day.date instanceof Date
                        ? day.date
                        : day.date
                        ? new Date(day.date)
                        : null,
                      activities:
                        day.activities?.map((activity: any) => ({
                          ...activity,
                        })) || [],
                    })) || [],
                } as Program;
                console.log("📄 Programa cargado:", processedProgram);
                setProgram(processedProgram);
                console.log("✅ Programa cargado:", processedProgram.id);
              } else {
                console.warn("⚠️ Programa no tiene ID");
                setProgram(null);
              }
            } else {
              console.log("⚠️ No se encontraron programas");
              setProgram(null);
            }
          } catch (error) {
            console.error("❌ Error buscando programa:", error);
            setProgram(null);
          }
        } else {
          console.log("ℹ️ Convocatoria activa, no se busca programa");
          setProgram(null);
        }
      } else {
        setCallData(null);
        setProgram(null);
      }
    } catch (error: any) {
      console.error("❌ Error cargando convocatoria:", error);
      console.error("Detalles del error:", {
        message: error?.message,
        code: error?.code,
      });
      
      if (error?.code === 'permission-denied') {
        console.error("⚠️ Error de permisos: Las reglas de Firestore pueden estar bloqueando el acceso");
      } else if (error?.code === 'unavailable') {
        console.error("⚠️ Error de conexión: Firebase no está disponible");
      }
      
      setCallData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  if (isLoading) return null;

  return (
    <section id="convocatorias" className="section-padding bg-bg-secondary">
      <div className="container-width">
        <motion.h2
          className="heading-2 text-bg-primary mb-8 font-bevietnam font-bold"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {!callData || callData.is_active
            ? "Convocatorias"
            : callData.show_program && program
            ? "Programación"
            : "Convocatorias"}
        </motion.h2>

        {callData && callData.is_active ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-bg-primary rounded-lg p-8"
          >
            <h3 className="text-2xl font-bevietnam font-bold mb-4 text-bg-secondary">
              {callData.title}
            </h3>
            <div
              className="text-text-primary font-bevietnam font-normal mb-6"
              dangerouslySetInnerHTML={{
                __html: callData.description || "",
              }}
            />
            <div className="space-y-4">
              <p className="font-bevietnam font-thin italic">
                Fecha límite de inscripción:{" "}
                <span className="font-bevietnam italic">
                  {callData?.deadline ? formatDate(callData.deadline) : ""}
                </span>
              </p>
              <p className="font-bevietnam font-thin italic">
                Fecha de la feria:{" "}
                <span className="font-bevietnam italic">
                  {callData.feria_date
                    ? formatDate(callData.feria_date)
                    : "Por confirmar"}
                </span>
              </p>
              <p className="font-bevietnam font-thin italic">
                Lugar: <span className="text-thin">{callData.location}</span>
              </p>
              <p className="font-bevietnam font-thin italic">
                Horario:{" "}
                <span className="font-bevietnam italic">
                  {callData.horario || "Por confirmar"}
                </span>
              </p>
            </div>
            <a
              href={callData.form_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-bg-secondary text-bg-primary px-6 py-3 rounded-lg 
                       hover:bg-accent-blue transition-colors duration-300 mt-6 font-bevietnam font-bold"
            >
              Inscríbete aquí
            </a>
          </motion.div>
        ) : callData && !callData.is_active ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-bg-primary rounded-lg p-8"
          >
            {callData.show_program && program ? (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bevietnam font-bold mb-2 text-bg-secondary">
                    Programación
                  </h3>
                  <h4 className="text-xl font-bevietnam font-bold mb-2 text-bg-secondary">
                    📍 {program.title}
                  </h4>
                  <p className="text-lg text-text-primary font-bevietnam mb-1">
                    {program.date_range} – {program.location || "Por confirmar"}
                  </p>
                  {program.note && (
                    <p className="text-text-primary font-bevietnam italic">
                      {program.note}
                    </p>
                  )}
                </div>

                {program.days && program.days.length > 0 ? (
                  program.days.map((day: ProgramDay, dayIndex: number) => {
                    const groupedActivities = groupActivitiesByCategory(
                      day.activities || []
                    );

                    return (
                      <div
                        key={dayIndex}
                        className="bg-bg-secondary rounded-lg p-6 md:p-8 space-y-6"
                      >
                        <h5 className="text-xl font-bold text-bg-primary font-bevietnam">
                          DÍA {day.day_number} — {day.date_label || "Por confirmar"}
                        </h5>

                        {Object.entries(groupedActivities).map(
                          ([category, activities]) => (
                            <div key={category} className="space-y-4">
                              <h6 className="text-lg font-bold text-bg-primary font-bevietnam uppercase tracking-wide">
                                {category}
                              </h6>

                              {activities
                                .sort((a, b) =>
                                  (a.time || "").localeCompare(b.time || "")
                                )
                                .map((activity, activityIndex) => (
                                  <div
                                    key={activityIndex}
                                    className="bg-bg-primary/90 rounded-lg p-4 md:p-5 shadow-sm"
                                  >
                                    <div className="flex flex-col md:flex-row md:items-start md:gap-4">
                                      {activity.time && (
                                        <span className="font-bold text-accent-blue font-bevietnam mb-2 md:mb-0">
                                          {formatTime(activity.time)}
                                        </span>
                                      )}
                                      <div className="flex-1 text-left space-y-2">
                                        <h6 className="font-bold text-bg-secondary font-bevietnam text-lg">
                                          {activity.title}
                                        </h6>
                                        {activity.description && (
                                          <p className="text-text-primary font-bevietnam">
                                            {activity.description}
                                          </p>
                                        )}
                                        {activity.location && (
                                          <p className="text-text-primary font-bevietnam">
                                            {activity.location}
                                          </p>
                                        )}
                                        {activity.coordinator && (
                                          <p className="text-text-primary font-bevietnam italic">
                                            {activity.coordinator}
                                          </p>
                                        )}
                                        {activity.link && (
                                          <a
                                            href={activity.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block text-sm text-accent-blue hover:text-accent-blue/80 font-bevietnam underline"
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
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-bg-secondary/20 rounded-lg p-6 text-center">
                    <p className="text-text-primary font-bevietnam">
                      El programa estará disponible próximamente.
                    </p>
                  </div>
                )}
              </div>
            ) : callData.show_program ? (
              <div className="text-center">
                <p className="text-text-primary text-lg font-bevietnam font-normal mb-4">
                  La convocatoria está cerrada.
                </p>
                <p className="text-sm text-text-primary/70 font-bevietnam">
                  El programa estará disponible próximamente.
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-text-primary text-lg font-bevietnam font-normal">
                  La convocatoria está cerrada.
                </p>
                <p className="font-bevietnam italic text-accent-blue mt-4">
                  ¡Te esperamos en la feria para disfrutar de todas las actividades!
                </p>
                <p className="text-sm text-text-primary/70 font-bevietnam mt-4">
                  Próximamente publicaremos la programación completa.
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-bg-primary rounded-lg p-8"
          >
            <p className="text-text-primary text-center text-lg font-bevietnam font-normal">
              ¡Estate atentx a la próxima convocatoria!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
