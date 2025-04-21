"use client";
import { motion } from "framer-motion";
import { FaInstagram, FaGlobe } from "react-icons/fa";
import Masonry from "react-masonry-css";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image: string;
  instagram?: string;
  website?: string;
  isVideo?: boolean;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Agus",
    role: "Coordinación",
    image: "/team/agus.jpg",
    instagram: "agus_instagram",
  },
  {
    id: 2,
    name: "Savia",
    role: "Video",
    image: "/team/savia.mp4",
    instagram: "savia_instagram",
    isVideo: true,
  },
  {
    id: 3,
    name: "Cata",
    role: "Fotógrafa",
    image: "/team/cata.jpg",
    instagram: "cata_instagram",
  },
  {
    id: 4,
    name: "Coti",
    role: "Diseñadora",
    image: "/team/coti.jpg",
    instagram: "coti_instagram",
  },
  {
    id: 5,
    name: "Iara",
    role: "Desarrolladora Web",
    image: "/team/iara.jpg",
    instagram: "iara_instagram",
  },
  {
    id: 6,
    name: "Cande",
    role: "Creadora de Contenido",
    image: "/team/cande.jpg",
    instagram: "cande_instagram",
  },
];

export default function Team() {
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
                  {member.isVideo ? (
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    >
                      <source src={member.image} type="video/mp4" />
                    </video>
                  ) : (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
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
