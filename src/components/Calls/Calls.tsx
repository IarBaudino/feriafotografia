"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface CallsContent {
  id?: string;
  is_active: boolean;
  deadline: string;
  location: string;
  form_link: string;
  title: string;
  description: string;
  created_at?: string;
}

export default function Calls() {
  const [callData, setCallData] = useState<CallsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCallData();

    // Suscribirse a cambios en la tabla calls
    const channel = supabase
      .channel("calls_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "calls",
        },
        (payload) => {
          console.log("Cambios detectados:", payload);
          loadCallData(); // Recargar datos cuando hay cambios
        }
      )
      .subscribe();

    // Limpiar suscripción
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadCallData = async () => {
    try {
      console.log("Cargando datos de convocatoria...");
      const { data, error } = await supabase
        .from("calls")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      console.log("Datos recibidos:", data);
      console.log("Error:", error);

      if (error) {
        if (error.code === "PGRST116") {
          // No hay datos, establecer estado inicial
          setCallData(null);
        } else {
          throw error;
        }
      }

      if (data) {
        const processedData = {
          ...data,
          is_active: Boolean(data.is_active),
        };
        console.log("Datos procesados:", processedData);
        setCallData(processedData);
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

        {Boolean(callData?.is_active) ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-bg-primary rounded-lg p-8"
          >
            <h3 className="text-2xl font-bevietnam font-bold mb-4 text-bg-secondary">
              {callData?.title}
            </h3>
            <p className="text-text-primary font-bevietnam font-normal mb-6">
              {callData?.description}
            </p>
            <div className="space-y-4">
              <p className="font-bevietnam font-thin italic">
                Fecha límite:{" "}
                <span className="font-joly italic">
                  {callData?.deadline ? formatDate(callData.deadline) : ""}
                </span>
              </p>
              <p className="font-bevietnam font-thin italic">
                Lugar: <span className="text-thin">{callData?.location}</span>
              </p>
            </div>
            <a
              href={callData?.form_link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-bg-secondary text-bg-primary px-6 py-3 rounded-lg 
                       hover:bg-accent-blue transition-colors duration-300 mt-6 font-bevietnam font-bold"
            >
              Inscríbete aquí
            </a>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="bg-bg-primary rounded-lg p-8"
          >
            <p className="text-text-primary text-center text-lg font-bevietnam font-normal">
              No hay convocatorias abiertas en este momento.
              <br />
              <span className="font-joly italic">
                ¡Mantente atento a nuestras redes sociales para futuras
                convocatorias!
              </span>
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
