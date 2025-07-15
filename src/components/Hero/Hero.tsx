"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface SiteSettings {
  hero_type: "image" | "video";
  hero_image_url?: string;
  hero_video_url?: string;
  hero_video_type?: "upload" | "youtube" | "vimeo";
}

export default function Hero() {
  const [settings, setSettings] = useState<SiteSettings>({
    hero_type: "image",
    hero_image_url: "/imagenes/headfotoferia.png",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("is_active", true)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error cargando configuración:", error);
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para extraer ID de YouTube
  const extractYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  // Función para extraer ID de Vimeo
  const extractVimeoId = (url: string): string | null => {
    const regExp = /vimeo\.com\/([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  if (isLoading) {
    return (
      <motion.section
        className="w-screen overflow-x-hidden relative bg-bg-primary -mb-1"
        style={{ height: "min-content" }}
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
            style={{ objectPosition: "top center" }}
          />
        </div>
      </motion.section>
    );
  }

  return (
    <motion.section
      className="w-screen overflow-x-hidden relative bg-bg-primary -mb-1"
      style={{ height: "min-content" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <div className="relative w-screen aspect-[12/5] md:aspect-[21/9]">
        {settings.hero_type === "image" && settings.hero_image_url ? (
          <Image
            src={settings.hero_image_url}
            alt="Feria Fotografía"
            fill
            priority
            className="object-contain object-top md:object-cover md:object-center"
            sizes="100vw"
            style={{ objectPosition: "top center" }}
          />
        ) : settings.hero_type === "video" && settings.hero_video_url ? (
          settings.hero_video_type === "upload" ? (
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover absolute inset-0"
              style={{ display: "block" }}
              src={settings.hero_video_url}
            >
              Tu navegador no soporta el elemento video.
            </video>
          ) : settings.hero_video_type === "youtube" ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${extractYouTubeId(
                settings.hero_video_url
              )}?autoplay=1&mute=1&loop=1&playlist=${extractYouTubeId(
                settings.hero_video_url
              )}&controls=0&showinfo=0&rel=0`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ display: "block" }}
            ></iframe>
          ) : settings.hero_video_type === "vimeo" ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://player.vimeo.com/video/${extractVimeoId(
                settings.hero_video_url
              )}?autoplay=1&muted=1&loop=1&controls=0&title=0&byline=0&portrait=0`}
              title="Vimeo video"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ display: "block" }}
            ></iframe>
          ) : (
            <Image
              src="/imagenes/headfotoferia.png"
              alt="Feria Fotografía"
              fill
              priority
              className="object-contain object-top md:object-cover md:object-center"
              sizes="100vw"
              style={{ objectPosition: "top center" }}
            />
          )
        ) : (
          <Image
            src="/imagenes/headfotoferia.png"
            alt="Feria Fotografía"
            fill
            priority
            className="object-contain object-top md:object-cover md:object-center"
            sizes="100vw"
            style={{ objectPosition: "top center" }}
          />
        )}
      </div>
    </motion.section>
  );
}
