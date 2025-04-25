'use client'
import { motion } from "framer-motion";
import Editions from "@/components/Editions/Editions";

export default function EdicionesPage() {
  return (
    <main className="pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Editions />
      </motion.div>
    </main>
  );
} 