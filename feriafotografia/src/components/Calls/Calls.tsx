'use client'
import { motion } from 'framer-motion';

export default function Calls() {
  const isCallActive = true; // Esto podría ser un estado que manejes según haya o no convocatoria activa

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
        
        {isCallActive ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-bg-primary rounded-lg p-8"
          >
            <h3 className="text-2xl font-bevietnam font-bold mb-4 text-bg-secondary">
              Convocatoria Abierta
            </h3>
            <p className="text-text-primary font-bevietnam font-normal mb-6">
              ¡Participa en la próxima edición de la Feria de Fotografía!
            </p>
            <div className="space-y-4">
              <p className="font-bevietnam font-thin italic">
                Fecha límite: <span className="font-joly italic">30 de Abril, 2024</span>
              </p>
              <p className="font-bevietnam font-thin italic">
                Lugar: <span className="text-thin">Centro Cultural Recoleta</span>
              </p>
            </div>
            <a 
              href="https://forms.google.com/..." // Aquí irá el link al formulario
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
                ¡Mantente atento a nuestras redes sociales para futuras convocatorias!
              </span>
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
} 