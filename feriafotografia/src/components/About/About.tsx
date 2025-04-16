'use client'
import { motion } from 'framer-motion';

export default function About() {
  return (
    <section id="about" className="section-padding bg-bg-primary">
      <div className="container-width">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="heading-2 text-bg-secondary mb-8 md:mb-12">
            Sobre la Feria
          </h2>
          <div className="body-text space-y-6">
            <p>
              La Feria de Fotografía nace de las ganas de generar y alimentar los espacios de encuentro para 
              todxs lxs que nos interesa la fotografía. Es una jornada para que nos conozcamos, para hablar 
              de nuestros procesos y proyectos, para conocer el trabajo de otrxs, para encontrarnos con 
              diferentes formas de producir y de materializar nuestras imágenes.
            </p>
            <p>
              Para ver, para tocar, para levantar y preguntar. Una jornada en la que se encuentran desde 
              libros, fanzines y prints hasta rollos, correas y textiles. Todo teniendo a la fotografía 
              como hilo conductor y eje central.
            </p>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-bg-secondary/10 p-6 md:p-8 rounded-lg"
            >
              <p className="font-medium">
                Este proyecto cuenta con 9 ediciones realizadas entre 2023 y 2024 en 
                las que participaron más de 400 proyectos y por las que 
                pasaron más de 3800 visitantes.
              </p>
            </motion.div>
            <p>
              Se hizo en los barrios porteños de Villa Crespo, Palermo, San Telmo y 
              Núñez, y también fuera de la capital, en Vicente López y La Plata. 
              Además, fue convocado desde el festival de fotografía FOCUS José 
              Ignacio (2023), en Uruguay, para presentar una selección de fanzines, y 
              desde FELIFA (2023) y PINTA BA PHOTO (2024) para producir la feria 
              de publicaciones independientes de ambos eventos.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 