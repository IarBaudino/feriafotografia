"use client";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Hero() {
  return (
    <motion.section
      className="w-screen overflow-hidden relative bg-bg-primary -mb-1"
      style={{
        height: "min-content",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <div className="relative w-screen aspect-[12/5] md:aspect-[21/9]">
        <Image
          src="/imagenes/headfotoferia.png"
          alt="Feria Fotografía"
          fill
          priority
          className="object-contain object-top md:object-cover md:object-center"
          sizes="100vw"
          style={{
            objectPosition: "top center",
          }}
        />
      </div>
    </motion.section>
  );
}
