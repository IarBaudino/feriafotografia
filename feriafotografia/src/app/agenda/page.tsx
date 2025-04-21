'use client'
import { motion } from "framer-motion";
import CulturalAgenda from "@/components/CulturalAgenda/CulturalAgenda";

export default function AgendaPage() {
  return (
    <main className="pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CulturalAgenda />
      </motion.div>
    </main>
  );
} 