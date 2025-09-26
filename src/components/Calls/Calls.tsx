"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { getCollection } from "@/lib/firestore-helpers";

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
}

export default function Calls() {
  const [callData, setCallData] = useState<CallsContent | null>(null);
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
        // Obtener el más reciente (Firebase no tiene orderBy por defecto)
        const latestCall = data.sort((a, b) => {
          const dateA = a.created_at?.toDate
            ? a.created_at.toDate()
            : new Date(a.created_at);
          const dateB = b.created_at?.toDate
            ? b.created_at.toDate()
            : new Date(b.created_at);
          return dateB.getTime() - dateA.getTime();
        })[0];

        const processedData = {
          ...latestCall,
          is_active: Boolean(latestCall.is_active),
        };
        console.log("Datos procesados:", processedData);
        setCallData(processedData);
      } else {
        setCallData(null);
      }
    } catch (error) {
      console.error("Error cargando convocatoria:", error);
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
          Convocatorias
        </motion.h2>

        {callData && (callData.is_active || callData.feria_date) ? (
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
                <span className="font-joly italic">
                  {callData.deadline ? formatDate(callData.deadline) : ""}
                </span>
              </p>
              <p className="font-bevietnam font-thin italic">
                Fecha de la feria:{" "}
                <span className="font-joly italic">
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
                <span className="font-joly italic">
                  {callData.horario || "Por confirmar"}
                </span>
              </p>
            </div>
            {callData.is_active ? (
              <a
                href={callData.form_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-bg-secondary text-bg-primary px-6 py-3 rounded-lg 
                         hover:bg-accent-blue transition-colors duration-300 mt-6 font-bevietnam font-bold"
              >
                Inscríbete aquí
              </a>
            ) : (
              <div className="mt-8 text-center">
                <p className="text-text-primary text-lg font-bevietnam font-normal">
                  La convocatoria está cerrada.
                </p>
                <p className="font-joly italic text-accent-blue mt-4">
                  ¡Te esperamos en la feria para disfrutar de todas las
                  actividades!
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
