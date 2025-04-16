'use client'
import { motion } from 'framer-motion';
import { FaInstagram, FaGlobe } from 'react-icons/fa';

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
    instagram: "agus_instagram"
  },
  {
    id: 2,
    name: "Savia",
    role: "Video",
    image: "/team/savia.mp4",
    instagram: "savia_instagram",
    isVideo: true
  },
  {
    id: 3,
    name: "Cata",
    role: "Fotógrafa",
    image: "/team/cata.jpg",
    instagram: "cata_instagram"
  },
  {
    id: 4,
    name: "Coti",
    role: "Diseñadora",
    image: "/team/coti.jpg",
    instagram: "coti_instagram"
  },
  {
    id: 5,
    name: "Iara",
    role: "Desarrolladora Web",
    image: "/team/iara.jpg",
    instagram: "iara_instagram"
  },
  {
    id: 6,
    name: "Cande",
    role: "Creadora de Contenido",
    image: "/team/cande.jpg",
    instagram: "cande_instagram"
  }
];

export default function Team() {
  return (
    <section id="equipo" className="py-20 px-4 md:px-8 bg-bg-primary">
      <div className="max-w-6xl mx-auto">
        <motion.h2 
          className="text-3xl font-bold mb-12 text-bg-secondary text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Nuestro Equipo
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-lg overflow-hidden shadow-lg"
            >
              <div className="aspect-square overflow-hidden">
                {member.isVideo ? (
                  <video 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={member.image} type="video/mp4" />
                  </video>
                ) : (
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-semibold text-bg-secondary">
                  {member.name}
                </h3>
                <p className="text-text-primary mb-4">{member.role}</p>
                
                <div className="flex space-x-4">
                  {member.instagram && (
                    <a 
                      href={`https://instagram.com/${member.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bg-secondary hover:text-accent-blue transition-colors"
                    >
                      <FaInstagram size={24} />
                    </a>
                  )}
                  {member.website && (
                    <a 
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-bg-secondary hover:text-accent-blue transition-colors"
                    >
                      <FaGlobe size={24} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 