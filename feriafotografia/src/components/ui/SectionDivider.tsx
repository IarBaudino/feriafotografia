'use client'
import { motion } from 'framer-motion'

interface SectionDividerProps {
  fromColor: string;
  toColor: string;
}

export default function SectionDivider({ fromColor, toColor }: SectionDividerProps) {
  return (
    <motion.div
      className="h-16 -mt-8 -mb-8 relative z-10"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 0.2 }}
      viewport={{ once: true }}
      style={{
        background: `linear-gradient(to bottom, ${fromColor}00 0%, ${fromColor}40 35%, ${toColor}40 65%, ${toColor}00 100%)`
      }}
    />
  )
} 