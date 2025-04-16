'use client'
import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaInstagram } from 'react-icons/fa';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Aquí puedes agregar la lógica para enviar el formulario
      // Por ejemplo, usando un servicio de email o una API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStatus({
        type: 'success',
        message: '¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.'
      });
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setStatus({
        type: 'error',
        message: 'Hubo un error al enviar el mensaje. Por favor, intenta nuevamente.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-20 px-4 md:px-8 bg-bg-secondary">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold mb-4 text-bg-primary">Contacto</h2>
          <p className="text-bg-primary">
            ¿Tienes alguna pregunta? ¡Escríbenos!
          </p>
          <a 
            href="https://instagram.com/feriafotografia" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-bg-primary hover:text-accent-blue transition-colors mt-2"
          >
            <FaInstagram size={24} className="mr-2" />
            @feriafotografia
          </a>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          className="bg-bg-primary rounded-lg p-8 shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-text-primary mb-2">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-accent-blue focus:outline-none focus:ring-2 focus:ring-bg-secondary"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-text-primary mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-accent-blue focus:outline-none focus:ring-2 focus:ring-bg-secondary"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-text-primary mb-2">
                Asunto
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg border border-accent-blue focus:outline-none focus:ring-2 focus:ring-bg-secondary"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-text-primary mb-2">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-2 rounded-lg border border-accent-blue focus:outline-none focus:ring-2 focus:ring-bg-secondary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-6 rounded-lg bg-bg-secondary text-bg-primary font-semibold
                        transition-colors duration-300 ${
                          isSubmitting 
                            ? 'opacity-70 cursor-not-allowed' 
                            : 'hover:bg-accent-blue'
                        }`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar mensaje'}
            </button>

            {status.type && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 rounded-lg ${
                  status.type === 'success' 
                    ? 'bg-accent-green/20 text-accent-green' 
                    : 'bg-red-100 text-red-600'
                }`}
              >
                {status.message}
              </motion.div>
            )}
          </div>
        </motion.form>
      </div>
    </section>
  );
} 