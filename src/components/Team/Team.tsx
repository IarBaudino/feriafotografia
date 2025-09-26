"use client";
import { motion } from "framer-motion";
import { FaInstagram, FaGlobe } from "react-icons/fa";
import Masonry from "react-masonry-css";
import { useState, useEffect } from "react";
import { getCollection } from "@/lib/firestore-helpers";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  instagram?: string;
  website?: string;
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Obtener los miembros del equipo
        const teamData = await getCollection("team_members");

        if (teamData) {
          console.log("Datos del equipo recibidos:", teamData);

          // Ordenar por fecha de creación
          const sortedMembers = teamData.sort((a, b) => {
            const dateA = a.created_at?.toDate
              ? a.created_at.toDate()
              : new Date(a.created_at);
            const dateB = b.created_at?.toDate
              ? b.created_at.toDate()
              : new Date(b.created_at);
            return dateA.getTime() - dateB.getTime();
          });

          setTeamMembers(sortedMembers);
        }
      } catch (error) {
        console.error("Error:", error);
        setError("Error inesperado cargando el equipo");
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamMembers();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-bg-secondary">Cargando equipo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  const breakpointColumns = {
    default: 3,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <section id="equipo" className="section-padding bg-bg-primary">
      <div className="container-width">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="heading-2 text-bg-secondary font-bevietnam font-bold">
            Nuestro Equipo
          </h2>
          <p className="mt-2 text-text-primary/80 font-bevietnam font-normal">
            Un grupo apasionado por la fotografía
          </p>
        </motion.div>

        <div className="flex justify-center">
          <Masonry
            breakpointCols={breakpointColumns}
            className="flex w-auto max-w-5xl -ml-4"
            columnClassName="pl-4 bg-clip-padding"
          >
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="mb-4 group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-secondary/90 via-bg-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="relative z-10">
                    <h3 className="text-lg font-bevietnam font-bold text-text-primary group-hover:text-bg-primary transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-sm font-bevietnam font-thin italic text-text-primary/90 group-hover:text-bg-primary/90 transition-colors">
                      {member.role}
                    </p>
                    <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {member.instagram && (
                        <a
                          href={`https://instagram.com/${member.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-bg-primary hover:text-accent-blue transition-all duration-300 transform hover:scale-110"
                        >
                          <FaInstagram size={18} />
                        </a>
                      )}
                      {member.website && (
                        <a
                          href={member.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-bg-primary hover:text-accent-blue transition-all duration-300 transform hover:scale-110"
                        >
                          <FaGlobe size={18} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </Masonry>
        </div>
      </div>
    </section>
  );
}
