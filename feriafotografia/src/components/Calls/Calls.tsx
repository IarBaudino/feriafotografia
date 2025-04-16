'use client'
import { motion } from 'framer-motion';

export default function Calls() {
  const isCallActive = true; // Esto podría ser un estado que manejes según haya o no convocatoria activa

  return (
    <section id="convocatorias" className="py-20 px-4 md:px-8 bg-bg-secondary">
      <div className="max-w-4xl mx-auto">
        <motion.h2 
          className="text-3xl font-bold mb-8 text-bg-primary"
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
            <h3 className="text-2xl font-semibold mb-4 text-bg-secondary">
              Convocatoria Abierta
            </h3>
            <p className="text-text-primary mb-6">
              ¡Participa en la próxima edición de la Feria de Fotografía!
            </p>
            <a 
              href="https://forms.google.com/..." // Aquí irá el link al formulario
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-bg-secondary text-bg-primary px-6 py-3 rounded-lg 
                       hover:bg-accent-blue transition-colors duration-300"
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
            <p className="text-text-primary text-center text-lg">
              No hay convocatorias abiertas en este momento. 
              ¡Mantente atento a nuestras redes sociales para futuras convocatorias!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
} 