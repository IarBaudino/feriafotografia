"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AuthCheck from "@/components/Auth/AuthCheck";
import { HiSave, HiUpload, HiTrash, HiEye } from "react-icons/hi";
import {
  getCollection,
  addDocument,
  updateDocument,
} from "@/lib/firestore-helpers";

interface SiteSettings {
  id: string;
  hero_type: "image" | "video";
  hero_image_url?: string;
  hero_video_url?: string;
  hero_video_type?: "upload" | "youtube" | "vimeo";
  is_active: boolean;
}

export default function PortadaPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    id: "",
    hero_type: "image",
    hero_image_url: "/imagenes/headfotoferia.png",
    is_active: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getCollection("site_settings");

      if (data && data.length > 0) {
        const settingsData = data[0] as any;
        setSettings({
          id: settingsData.id,
          hero_type: settingsData.hero_type || "image",
          hero_image_url:
            settingsData.hero_image_url || "/imagenes/headfotoferia.png",
          hero_video_url: settingsData.hero_video_url,
          hero_video_type: settingsData.hero_video_type,
          is_active: settingsData.is_active !== false,
        });
      }
    } catch (error) {
      console.error("❌ Error cargando configuración:", error);
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

  // Función para validar URL de video
  const validateVideoUrl = (
    url: string
  ): { isValid: boolean; type: "youtube" | "vimeo" | undefined } => {
    if (extractYouTubeId(url)) {
      return { isValid: true, type: "youtube" };
    }
    if (extractVimeoId(url)) {
      return { isValid: true, type: "vimeo" };
    }
    return { isValid: false, type: undefined };
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "feriafotografia/hero");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls && data.urls[0]) {
        setSettings({
          ...settings,
          hero_image_url: data.urls[0],
        });
        setHasUnsavedChanges(true);
        alert("Imagen subida correctamente");
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleVideoUpload = async (file: File) => {
    // Validar tipo de archivo
    const validTypes = [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo", // .avi
    ];
    if (!validTypes.includes(file.type)) {
      alert(
        "Por favor, sube un archivo de video válido (MP4, WebM, OGG, MOV, AVI)"
      );
      return;
    }

    // Validar tamaño (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      alert("El video no puede ser mayor a 100MB");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "feriafotografia/hero/videos");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls && data.urls[0]) {
        setSettings({
          ...settings,
          hero_video_url: data.urls[0],
          hero_video_type: "upload",
        });
        setHasUnsavedChanges(true);
        alert("Video subido correctamente. Recuerda guardar los cambios.");
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      console.error("❌ Error subiendo video:", error);
      alert(`Error al subir el video: ${error}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settingsData = {
        hero_type: settings.hero_type,
        hero_image_url: settings.hero_image_url || null,
        hero_video_url: settings.hero_video_url || null,
        hero_video_type: settings.hero_video_type || null,
        is_active: settings.is_active,
        updated_at: new Date(),
      };

      if (settings.id) {
        // Actualizar configuración existente
        await updateDocument("site_settings", settings.id, settingsData);
      } else {
        // Crear nueva configuración
        const newId = await addDocument("site_settings", {
          ...settingsData,
          created_at: new Date(),
        });
        setSettings({ ...settings, id: newId });
      }

      setHasUnsavedChanges(false);
      alert("Configuración guardada correctamente");
      await loadSettings();
    } catch (error) {
      console.error("❌ Error guardando configuración:", error);
      alert(`Error al guardar la configuración: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Cargando...</div>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-6 py-8 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-bg-secondary mb-8 font-bevietnam">
                Configurar Portada
              </h1>

              <div className="space-y-8">
                {/* Tipo de portada */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Tipo de Portada
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="image"
                        checked={settings.hero_type === "image"}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            hero_type: "image" as const,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="mr-2"
                      />
                      Imagen
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="video"
                        checked={settings.hero_type === "video"}
                        onChange={(e) => {
                          setSettings({
                            ...settings,
                            hero_type: "video" as const,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="mr-2"
                      />
                      Video
                    </label>
                  </div>
                </div>

                {/* Configuración de imagen */}
                {settings.hero_type === "image" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Imagen de Portada
                    </label>

                    {/* Imagen actual */}
                    {settings.hero_image_url && (
                      <div className="mb-4">
                        <img
                          src={settings.hero_image_url}
                          alt="Portada actual"
                          className="w-full max-w-md rounded-lg shadow-md"
                        />
                      </div>
                    )}

                    {/* Subir nueva imagen */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <HiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Subir nueva imagen de portada
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleImageUpload(e.target.files[0]);
                          }
                        }}
                        disabled={isUploading}
                        className="hidden"
                        id="hero-image-upload"
                      />
                      <label
                        htmlFor="hero-image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
                      >
                        {isUploading ? "Subiendo..." : "Seleccionar Imagen"}
                      </label>
                    </div>
                  </div>
                )}

                {/* Configuración de video */}
                {settings.hero_type === "video" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Video de Portada
                    </label>

                    {/* Video actual */}
                    {settings.hero_video_url && (
                      <div className="mb-4">
                        {settings.hero_video_type === "upload" ? (
                          <video
                            controls
                            className="w-full max-w-md rounded-lg"
                            src={settings.hero_video_url}
                          >
                            Tu navegador no soporta el elemento video.
                          </video>
                        ) : settings.hero_video_type === "youtube" ? (
                          <div className="w-full max-w-md">
                            <iframe
                              width="100%"
                              height="200"
                              src={`https://www.youtube.com/embed/${extractYouTubeId(
                                settings.hero_video_url
                              )}`}
                              title="YouTube video"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="rounded-lg"
                            ></iframe>
                          </div>
                        ) : settings.hero_video_type === "vimeo" ? (
                          <div className="w-full max-w-md">
                            <iframe
                              width="100%"
                              height="200"
                              src={`https://player.vimeo.com/video/${extractVimeoId(
                                settings.hero_video_url
                              )}`}
                              title="Vimeo video"
                              frameBorder="0"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                              className="rounded-lg"
                            ></iframe>
                          </div>
                        ) : null}
                      </div>
                    )}

                    {/* Opciones para agregar video */}
                    <div className="space-y-4">
                      {/* Subir video */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                        <HiUpload className="mx-auto h-6 w-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Subir video (máx. 100MB)
                        </p>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleVideoUpload(e.target.files[0]);
                            }
                          }}
                          disabled={isUploading}
                          className="hidden"
                          id="hero-video-upload"
                        />
                        <label
                          htmlFor="hero-video-upload"
                          className="cursor-pointer inline-flex items-center px-3 py-1 bg-accent-blue text-white rounded text-sm hover:bg-accent-blue/90 transition-colors"
                        >
                          {isUploading ? "Subiendo..." : "Subir Video"}
                        </label>
                      </div>

                      {/* O separador */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 bg-white text-gray-500">O</span>
                        </div>
                      </div>

                      {/* Link de YouTube/Vimeo */}
                      <div>
                        <input
                          type="url"
                          placeholder="Pega aquí el link de YouTube o Vimeo"
                          value={
                            settings.hero_video_url &&
                            settings.hero_video_type !== "upload"
                              ? settings.hero_video_url
                              : ""
                          }
                          onChange={(e) => {
                            const url = e.target.value;
                            if (url) {
                              const validation = validateVideoUrl(url);
                              if (validation.isValid) {
                                setSettings({
                                  ...settings,
                                  hero_video_url: url,
                                  hero_video_type: validation.type,
                                });
                                setHasUnsavedChanges(true);
                              } else {
                                alert(
                                  "Por favor, ingresa un link válido de YouTube o Vimeo"
                                );
                              }
                            } else {
                              setSettings({
                                ...settings,
                                hero_video_url: "",
                                hero_video_type: undefined,
                              });
                              setHasUnsavedChanges(true);
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Soporta links de YouTube y Vimeo
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vista previa */}
                <div className="border-t pt-8">
                  <h3 className="text-lg font-bold text-bg-secondary mb-4">
                    Vista Previa
                  </h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="relative w-full aspect-[21/9] rounded-lg overflow-hidden">
                      {settings.hero_type === "image" &&
                      settings.hero_image_url ? (
                        <img
                          src={settings.hero_image_url}
                          alt="Vista previa de portada"
                          className="w-full h-full object-cover"
                        />
                      ) : settings.hero_type === "video" &&
                        settings.hero_video_url ? (
                        settings.hero_video_type === "upload" ? (
                          <video
                            controls
                            className="w-full h-full object-cover"
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
                            )}`}
                            title="YouTube video"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0"
                          ></iframe>
                        ) : settings.hero_video_type === "vimeo" ? (
                          <iframe
                            width="100%"
                            height="100%"
                            src={`https://player.vimeo.com/video/${extractVimeoId(
                              settings.hero_video_url
                            )}`}
                            title="Vimeo video"
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0"
                          ></iframe>
                        ) : null
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <p className="text-gray-500">Sin contenido</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 pt-6">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="flex items-center px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <HiSave className="w-5 h-5 mr-2" />
                    {isSaving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AuthCheck>
  );
}
