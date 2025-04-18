"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaInstagram, FaEnvelope, FaUser, FaPen } from "react-icons/fa";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({
    type: null,
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Aquí puedes agregar la lógica para enviar el formulario
      // Por ejemplo, usando un servicio de email o una API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStatus({
        type: "success",
        message:
          "¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.",
      });

      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      setStatus({
        type: "error",
        message:
          "Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-16 px-4 md:px-8 bg-bg-secondary">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl font-bevietnam font-bold mb-3 text-bg-primary">
            ¡Hablemos!
          </h2>
          <a
            href="https://instagram.com/feriafotografia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-bg-primary hover:text-accent-blue transition-all mt-2 font-joly italic group hover:-translate-y-1"
          >
            <FaInstagram
              size={20}
              className="mr-2 group-hover:rotate-12 transition-transform"
            />
            @feriafotografia
          </a>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-bg-primary rounded-xl p-6 md:p-8 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative group">
              <label
                htmlFor="name"
                className="block text-sm text-text-primary mb-1 font-bevietnam font-bold flex items-center"
              >
                <FaUser
                  className="mr-2 text-bg-secondary group-hover:rotate-12 transition-transform"
                  size={14}
                />
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border-2 border-accent-blue/20 focus:border-bg-secondary focus:outline-none transition-all font-bevietnam font-normal bg-white/50 hover:bg-white"
                placeholder="Tu nombre"
              />
            </div>

            <div className="relative group">
              <label
                htmlFor="email"
                className="block text-sm text-text-primary mb-1 font-bevietnam font-bold flex items-center"
              >
                <FaEnvelope
                  className="mr-2 text-bg-secondary group-hover:rotate-12 transition-transform"
                  size={14}
                />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border-2 border-accent-blue/20 focus:border-bg-secondary focus:outline-none transition-all font-bevietnam font-normal bg-white/50 hover:bg-white"
                placeholder="tu@email.com"
              />
            </div>

            <div className="relative group md:col-span-2">
              <label
                htmlFor="subject"
                className="block text-sm text-text-primary mb-1 font-bevietnam font-bold flex items-center"
              >
                <FaPen
                  className="mr-2 text-bg-secondary group-hover:rotate-12 transition-transform"
                  size={14}
                />
                Asunto
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 rounded-lg border-2 border-accent-blue/20 focus:border-bg-secondary focus:outline-none transition-all font-bevietnam font-normal bg-white/50 hover:bg-white"
                placeholder="¿Sobre qué quieres hablar?"
              />
            </div>

            <div className="relative group md:col-span-2">
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 rounded-lg border-2 border-accent-blue/20 focus:border-bg-secondary focus:outline-none transition-all font-bevietnam font-normal bg-white/50 hover:bg-white resize-none"
                placeholder="Tu mensaje aquí..."
              />
            </div>

            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`md:col-span-2 py-3 px-6 rounded-lg bg-bg-secondary text-bg-primary font-bevietnam font-bold
                      transition-all duration-300 ${
                        isSubmitting
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:bg-accent-blue hover:shadow-lg hover:-translate-y-1"
                      }`}
            >
              {isSubmitting ? "Enviando..." : "¡Enviar!"}
            </motion.button>
          </div>
        </motion.form>

        <AnimatePresence>
          {status.type && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mt-4 p-3 rounded-lg font-bevietnam font-normal text-center ${
                status.type === "success"
                  ? "bg-accent-green/20 text-accent-green"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {status.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
