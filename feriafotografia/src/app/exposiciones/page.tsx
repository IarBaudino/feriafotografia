"use client";
import { motion } from "framer-motion";
import Exhibitions from "@/components/Exibitions/Exhibitions";

export default function ExposicionesPage() {
  return (
    <main className="pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Exhibitions />
      </motion.div>
    </main>
  );
}
