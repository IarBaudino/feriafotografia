"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <motion.section
      className="w-full relative bg-bg-primary overflow-hidden"
      style={{ height: "100svh" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <div className="absolute inset-0">
        <div className="relative w-full h-full">
          <Image
            src="/imagenes/headfotoferia.png"
            alt="Feria Fotografía"
            fill
            priority
            className="object-contain sm:object-contain"
            sizes="100vw"
            style={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
              maxHeight: "100svh",
            }}
          />
        </div>
      </div>
    </motion.section>
  );
}
