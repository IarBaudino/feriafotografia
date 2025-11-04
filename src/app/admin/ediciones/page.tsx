"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  getCollection,
  getDocument,
  getDocumentsWithFilter,
  addDocument,
  updateDocument,
  deleteDocument,
  removeDuplicateImages,
} from "@/lib/firestore-helpers";
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiEye,
  HiUpload,
  HiSave,
} from "react-icons/hi";
import CustomQuillEditor from "@/components/Editor/CustomQuillEditor";
import AuthCheck from "@/components/Auth/AuthCheck";
import PinterestGrid from "@/components/ui/PinterestGrid";

interface Edicion {
  id: string;
  created_at?: string;
  title: string;
  date: string; // Formato ISO: YYYY-MM-DD
  description: string;
  location: string;
  participants: number;
  visitors: number;
  video_url?: string;
  video_type?: "upload" | "youtube" | "vimeo";
}

interface PreviewModalProps {
  edicion: Edicion;
  isOpen: boolean;
  onClose: () => void;
}

function PreviewModal({ edicion, isOpen, onClose }: PreviewModalProps) {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-bg-secondary font-bevietnam">
            Vista Previa
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        <div className="p-6">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bevietnam font-bold text-bg-secondary mb-3">
              {edicion.title}
            </h1>
            <p className="text-xl font-joly italic text-accent-blue mb-6">
              {edicion.date
                ? new Date(edicion.date).toLocaleDateString("es-ES", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Sin fecha"}
            </p>

            {/* Video */}
            {edicion.video_url && (
              <div className="mb-8">
                <h3 className="text-lg font-bold text-bg-secondary mb-4">
                  Video
                </h3>
                {edicion.video_type === "upload" ? (
                  <video
                    controls
                    className="w-full max-w-2xl rounded-lg"
                    src={edicion.video_url}
                  >
                    Tu navegador no soporta el elemento video.
                  </video>
                ) : edicion.video_type === "youtube" ? (
                  <div className="w-full max-w-2xl">
                    <iframe
                      width="100%"
                      height="400"
                      src={`https://www.youtube.com/embed/${extractYouTubeId(
                        edicion.video_url
                      )}`}
                      title="YouTube video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-lg"
                    ></iframe>
                  </div>
                ) : edicion.video_type === "vimeo" ? (
                  <div className="w-full max-w-2xl">
                    <iframe
                      width="100%"
                      height="400"
                      src={`https://player.vimeo.com/video/${extractVimeoId(
                        edicion.video_url
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

            <div className="grid grid-cols-2 gap-6">
              <div>
                <div
                  className="text-lg font-bevietnam text-text-primary/80 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: edicion.description,
                  }}
                />
              </div>
              <div>
                <p className="text-lg font-bevietnam">
                  <span className="font-bold">Ubicación:</span>{" "}
                  {edicion.location}
                </p>
                <p className="text-lg font-bevietnam">
                  <span className="font-bold">Participantes:</span>{" "}
                  {edicion.participants}
                </p>
                <p className="text-lg font-bevietnam">
                  <span className="font-bold">Visitantes:</span>{" "}
                  {edicion.visitors}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Función para generar un ID temporal para nuevas ediciones
const generateTempId = () => {
  return `temp-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
};

const EMPTY_EDICION: Edicion = {
  id: "",
  title: "",
  date: new Date().toISOString().split("T")[0],
  description: "",
  location: "",
  participants: 0,
  visitors: 0,
  video_url: "",
  video_type: undefined,
};

export default function EdicionesAdminPage() {
  const [ediciones, setEdiciones] = useState<Edicion[]>([]);
  const [currentEdicion, setCurrentEdicion] = useState<Edicion | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [edicionImages, setEdicionImages] = useState<Record<string, string[]>>(
    {}
  );
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    edicion: Edicion | null;
  }>({ isOpen: false, edicion: null });

  useEffect(() => {
    loadEdiciones();
  }, []);

  const loadEdiciones = async () => {
    try {
      const data = await getCollection("editions");

      if (data) {
        console.log(
          "📋 CARGA - Datos crudos de Firebase:",
          data.map((e: any) => ({
            idDocumento: e.id,
            title: e.title,
          }))
        );

        // Procesar fechas de Firebase y ordenar
        const processedEdiciones = data.map((edicion: any) => ({
          id: edicion.id, // Este es el ID real del documento de Firestore
          title: edicion.title || "",
          description: edicion.description || "",
          location: edicion.location || "",
          participants: edicion.participants || 0,
          visitors: edicion.visitors || 0,
          video_url: edicion.video_url || "",
          video_type: edicion.video_type,
          date: edicion.date?.toDate
            ? edicion.date.toDate().toISOString().split("T")[0]
            : edicion.date,
        }));

        const sortedEdiciones = processedEdiciones.sort((a, b) => {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        });

        console.log(
          "✅ CARGA - Ediciones procesadas:",
          sortedEdiciones.map((e) => ({
            id: e.id,
            title: e.title,
          }))
        );

        setEdiciones(sortedEdiciones as Edicion[]);

        // Cargar imágenes
        const imagesData = await getDocumentsWithFilter(
          "images",
          "section",
          "editions"
        );

        if (imagesData) {
          console.log(
            "🖼️ IMÁGENES - Datos crudos:",
            imagesData.map((img: any) => ({
              section_id: img.section_id,
              url: img.url?.substring(0, 50) + "...",
            }))
          );

          // Aplicar filtro de duplicados global
          const uniqueImages = removeDuplicateImages(imagesData);

          // Agrupar por edición
          const imagesByEdition = uniqueImages.reduce((acc, img) => {
            if (!acc[img.section_id]) {
              acc[img.section_id] = [];
            }
            acc[img.section_id].push(img.url);
            return acc;
          }, {} as Record<string, string[]>);

          console.log(
            "🖼️ IMÁGENES - Agrupadas por edición:",
            Object.keys(imagesByEdition)
          );
          console.log(
            "📊 COMPARACIÓN - IDs de ediciones:",
            sortedEdiciones.map((e) => e.id)
          );

          setEdicionImages(imagesByEdition);
        }
      }
    } catch (error) {
      console.error("Error cargando ediciones:", error);
    }
  };

  // Memoizar las imágenes procesadas para evitar re-renders innecesarios
  const processedImages = useMemo(() => {
    return edicionImages;
  }, [edicionImages]);

  const handleImageUpload = async (files: FileList) => {
    if (!currentEdicion) {
      alert("Por favor, selecciona una edición para subir imágenes");
      return;
    }

    console.log("📤 INICIO SUBIR IMÁGENES - currentEdicion:", {
      id: currentEdicion.id,
      title: currentEdicion.title,
      tipoId: typeof currentEdicion.id,
    });

    // Si es una edición nueva sin ID, generar un ID temporal
    let edicionId = currentEdicion.id;
    if (!edicionId || edicionId === "") {
      edicionId = generateTempId();
      console.log("🆔 GENERANDO ID TEMPORAL:", edicionId);
      setCurrentEdicion({ ...currentEdicion, id: edicionId });
    } else {
      console.log("✅ USANDO ID EXISTENTE:", edicionId);
    }

    setIsUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", "feriafotografia/editions");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls) {
        console.log(
          `✅ ${data.urls.length} imagen(es) subidas - Usando ID: ${edicionId}`
        );

        // Agregar las nuevas URLs al estado local usando el ID (temporal o real)
        const newImages = [...(edicionImages[edicionId] || []), ...data.urls];
        setEdicionImages({
          ...edicionImages,
          [edicionId]: newImages,
        });
        setHasUnsavedChanges(true);
        alert(
          `${data.urls.length} imagen(es) subida(s) correctamente. Recuerda guardar los cambios.`
        );
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      console.error("❌ Error subiendo imágenes:", error);
      alert(`Error al subir las imágenes: ${error}`);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!currentEdicion) return;

    try {
      // Buscar la imagen en Firebase
      const images = await getDocumentsWithFilter("images", "url", imageUrl);

      // Eliminar de la base de datos
      for (const img of images) {
        await deleteDocument("images", img.id);
      }

      // Actualizar estado local
      setEdicionImages((prev) => ({
        ...prev,
        [currentEdicion.id]: prev[currentEdicion.id].filter(
          (url) => url !== imageUrl
        ),
      }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      alert("Error al eliminar la imagen");
    }
  };

  // Función para extraer ID de YouTube
  const extractYouTubeId = (url: string): string | null => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  
  const extractVimeoId = (url: string): string | null => {
    const regExp = /vimeo\.com\/([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  
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

  
  const handleVideoUpload = async (file: File) => {
    if (!currentEdicion) {
      alert("Por favor, selecciona una edición para subir el video");
      return;
    }

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

    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "feriafotografia/editions/videos");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls && data.urls[0]) {
        setCurrentEdicion({
          ...currentEdicion,
          video_url: data.urls[0],
          video_type: "upload",
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
      setIsUploadingVideo(false);
    }
  };

  // Función para eliminar video
  const handleVideoDelete = async () => {
    if (!currentEdicion || !currentEdicion.video_url) return;

    try {
      setCurrentEdicion({
        ...currentEdicion,
        video_url: "",
        video_type: undefined,
      });
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error eliminando video:", error);
      alert("Error al eliminar el video");
    }
  };

  const handleSave = async () => {
    if (!currentEdicion) return;

    console.log("🔍 INICIO GUARDAR - currentEdicion:", {
      id: currentEdicion.id,
      title: currentEdicion.title,
      tipoId: typeof currentEdicion.id,
      esTemporal: currentEdicion.id?.startsWith("temp-"),
    });

    setIsSaving(true);
    try {
      let edicionId = currentEdicion.id;
      const edicionData = {
        title: currentEdicion.title,
        date: currentEdicion.date ? new Date(currentEdicion.date) : null,
        description: currentEdicion.description,
        location: currentEdicion.location,
        participants: currentEdicion.participants,
        visitors: currentEdicion.visitors,
        video_url: currentEdicion.video_url || null,
        video_type: currentEdicion.video_type || null,
      };

      // Determinar si es una edición nueva o existente
      const isNewEdicion =
        !edicionId || edicionId === "" || edicionId.startsWith("temp-");

      if (isNewEdicion) {
        // CREAR NUEVA EDICIÓN
        console.log("➕ CREAR NUEVA - Razón:", {
          noTieneId: !edicionId,
          idVacio: edicionId === "",
          esTemporal: edicionId?.startsWith("temp-"),
        });

        edicionId = await addDocument("editions", {
          ...edicionData,
          created_at: new Date(),
        });

        console.log("✅ CREADA con ID real:", edicionId);
        setCurrentEdicion({ ...currentEdicion, id: edicionId });
      } else {
        // ACTUALIZAR EDICIÓN EXISTENTE
        console.log("✏️ ACTUALIZAR EXISTENTE - ID:", edicionId);

        try {
          await updateDocument("editions", edicionId, edicionData);
          console.log("✅ ACTUALIZADA exitosamente");
        } catch (updateError: any) {
          console.error("⚠️ Error al actualizar:", updateError.message);

          // Verificar si el documento realmente existe
          const docExists = await getDocument("editions", edicionId);
          console.log(
            "🔍 Verificación de existencia:",
            docExists ? "SÍ EXISTE" : "NO EXISTE"
          );

          if (!docExists) {
            // El documento no existe, crear uno nuevo
            console.log("📝 Creando nuevo documento con los datos actuales");
            const newId = await addDocument("editions", {
              ...edicionData,
              created_at: new Date(),
            });
            console.log("✅ Documento creado con nuevo ID:", newId);

            // Actualizar el ID en el estado
            edicionId = newId;
            setCurrentEdicion({ ...currentEdicion, id: newId });
          } else {
            // El documento existe pero hay otro error
            throw updateError;
          }
        }
      }

      // Guardar imágenes en la base de datos
      if (edicionId) {
        const currentImages =
          edicionImages[currentEdicion.id] || edicionImages[edicionId] || [];
        console.log(
          `💾 Sincronizando ${currentImages.length} imágenes para ID: ${edicionId}`
        );

        // Obtener las imágenes actuales en la base de datos para esta edición
        const existingImagesInDb = await getDocumentsWithFilter(
          "images",
          "section_id",
          edicionId
        );

        // Crear un set de URLs actuales en el estado local
        const currentImageUrls = new Set(currentImages);

        // Eliminar imágenes que ya no están en el estado local
        let deletedCount = 0;
        for (const dbImage of existingImagesInDb) {
          const imageUrl = (dbImage as any).url;
          if (!currentImageUrls.has(imageUrl)) {
            await deleteDocument("images", dbImage.id);
            deletedCount++;
          }
        }

        // Crear un set de URLs existentes en la BD
        const existingImageUrls = new Set(
          existingImagesInDb.map((img: any) => img.url)
        );

        // Agregar imágenes nuevas que no están en la BD
        let addedCount = 0;
        for (const imageUrl of currentImages) {
          if (!existingImageUrls.has(imageUrl)) {
            await addDocument("images", {
              url: imageUrl,
              alt: `Imagen de ${currentEdicion.title}`,
              section: "editions",
              section_id: edicionId,
            });
            addedCount++;
          }
        }

        console.log(
          `✅ Sincronización completada: +${addedCount} nuevas, -${deletedCount} eliminadas`
        );
      }

      setHasUnsavedChanges(false);
      alert("Cambios guardados correctamente");
      await loadEdiciones();
      setCurrentEdicion(null);
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Error guardando edición:", error);
      alert(`Error al guardar la edición: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (edicionId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta edición?")) return;

    try {
      // Eliminar imágenes asociadas
      const imagesData = await getDocumentsWithFilter(
        "images",
        "section_id",
        edicionId
      );

      // Eliminar registros de imágenes de la base de datos
      for (const img of imagesData) {
        await deleteDocument("images", img.id);
      }

      // Eliminar la edición
      await deleteDocument("editions", edicionId);

      alert("Edición eliminada correctamente");
      loadEdiciones();
    } catch (error) {
      console.error("Error eliminando edición:", error);
      alert("Error al eliminar la edición");
    }
  };

  const handleEdit = (edicion: Edicion) => {
    console.log("✏️ EDITAR - Edición seleccionada:", {
      id: edicion.id,
      title: edicion.title,
      tipoId: typeof edicion.id,
    });
    setCurrentEdicion(edicion);
    setIsEditing(true);
    setHasUnsavedChanges(false);
  };

  const handleNew = () => {
    setCurrentEdicion(EMPTY_EDICION);
    setIsEditing(true);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        !confirm(
          "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?"
        )
      ) {
        return;
      }
    }

    setCurrentEdicion(null);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-bg-secondary font-bevietnam">
              {isEditing ? (
                currentEdicion?.id ? (
                  <>
                    <span className="hidden md:inline">Editar: </span>
                    <span className="md:hidden">Editar </span>
                    {currentEdicion.title || "Edición"}
                  </>
                ) : (
                  "Nueva Edición"
                )
              ) : (
                <>
                  <span className="hidden md:inline">
                    Administrar Ediciones
                  </span>
                  <span className="md:hidden">Ediciones</span>
                </>
              )}
            </h1>
            {isEditing ? (
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver a la Lista
              </button>
            ) : (
              <button
                onClick={handleNew}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
              >
                <HiPlus className="w-5 h-5" />
                Nueva Edición
              </button>
            )}
          </div>

          {isEditing && currentEdicion ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-lg p-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Formulario */}
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-bg-secondary font-bevietnam">
                      {currentEdicion.id ? "Editar Edición" : "Nueva Edición"}
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título
                      </label>
                      <input
                        type="text"
                        value={currentEdicion.title}
                        onChange={(e) => {
                          setCurrentEdicion({
                            ...currentEdicion,
                            title: e.target.value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha
                      </label>
                      <input
                        type="date"
                        value={currentEdicion.date || ""}
                        onChange={(e) => {
                          setCurrentEdicion({
                            ...currentEdicion,
                            date: e.target.value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={currentEdicion.location}
                        onChange={(e) => {
                          setCurrentEdicion({
                            ...currentEdicion,
                            location: e.target.value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Participantes
                        </label>
                        <input
                          type="number"
                          value={currentEdicion.participants}
                          onChange={(e) => {
                            setCurrentEdicion({
                              ...currentEdicion,
                              participants: parseInt(e.target.value) || 0,
                            });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Visitantes
                        </label>
                        <input
                          type="number"
                          value={currentEdicion.visitors}
                          onChange={(e) => {
                            setCurrentEdicion({
                              ...currentEdicion,
                              visitors: parseInt(e.target.value) || 0,
                            });
                            setHasUnsavedChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <CustomQuillEditor
                        value={currentEdicion.description}
                        onChange={(value) => {
                          setCurrentEdicion({
                            ...currentEdicion,
                            description: value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                      />
                    </div>

                    {/* Sección de Video */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Video (opcional)
                      </label>

                      {/* Video actual */}
                      {currentEdicion.video_url && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              Video actual:
                            </span>
                            <button
                              onClick={handleVideoDelete}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Eliminar
                            </button>
                          </div>
                          {currentEdicion.video_type === "upload" ? (
                            <video
                              controls
                              className="w-full max-w-md rounded"
                              src={currentEdicion.video_url}
                            >
                              Tu navegador no soporta el elemento video.
                            </video>
                          ) : currentEdicion.video_type === "youtube" ? (
                            <div className="w-full max-w-md">
                              <iframe
                                width="100%"
                                height="200"
                                src={`https://www.youtube.com/embed/${extractYouTubeId(
                                  currentEdicion.video_url
                                )}`}
                                title="YouTube video"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="rounded"
                              ></iframe>
                            </div>
                          ) : currentEdicion.video_type === "vimeo" ? (
                            <div className="w-full max-w-md">
                              <iframe
                                width="100%"
                                height="200"
                                src={`https://player.vimeo.com/video/${extractVimeoId(
                                  currentEdicion.video_url
                                )}`}
                                title="Vimeo video"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                                className="rounded"
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
                            disabled={isUploadingVideo}
                            className="hidden"
                            id="video-upload"
                          />
                          <label
                            htmlFor="video-upload"
                            className="cursor-pointer inline-flex items-center px-3 py-1 bg-accent-blue text-white rounded text-sm hover:bg-accent-blue/90 transition-colors"
                          >
                            {isUploadingVideo ? "Subiendo..." : "Subir Video"}
                          </label>
                        </div>

                        {/* O separador */}
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                              O
                            </span>
                          </div>
                        </div>

                        {/* Link de YouTube/Vimeo */}
                        <div>
                          <input
                            type="url"
                            placeholder="Pega aquí el link de YouTube o Vimeo"
                            value={
                              currentEdicion.video_url &&
                              currentEdicion.video_type !== "upload"
                                ? currentEdicion.video_url
                                : ""
                            }
                            onChange={(e) => {
                              const url = e.target.value;
                              if (url) {
                                const validation = validateVideoUrl(url);
                                if (validation.isValid) {
                                  setCurrentEdicion({
                                    ...currentEdicion,
                                    video_url: url,
                                    video_type: validation.type,
                                  });
                                  setHasUnsavedChanges(true);
                                } else {
                                  alert(
                                    "Por favor, ingresa un link válido de YouTube o Vimeo"
                                  );
                                }
                              } else {
                                setCurrentEdicion({
                                  ...currentEdicion,
                                  video_url: "",
                                  video_type: undefined,
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
                  </div>

                  {/* Gestión de imágenes */}
                  <div className="space-y-6">
                    <h3 className="text-xl font-bold text-bg-secondary font-bevietnam">
                      Imágenes
                    </h3>

                    {/* Área de upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <HiUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Arrastra imágenes aquí o haz clic para seleccionar
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          if (e.target.files) {
                            handleImageUpload(e.target.files);
                          }
                        }}
                        disabled={isUploadingImages}
                        className="hidden"
                        id="file-upload-editions"
                      />
                      <label
                        htmlFor="file-upload-editions"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
                      >
                        {isUploadingImages
                          ? "Subiendo..."
                          : "Seleccionar Imágenes"}
                      </label>
                    </div>

                    {/* Grid de imágenes estilo Pinterest */}
                    {processedImages[currentEdicion.id]?.length > 0 && (
                      <div className="relative">
                        <PinterestGrid
                          images={processedImages[currentEdicion.id].map(
                            (url, index) => ({
                              id: `edicion-${index}`,
                              url,
                              alt: `Imagen ${index + 1} de ${
                                currentEdicion.title
                              }`,
                            })
                          )}
                          onDeleteImage={handleImageDelete}
                          showDeleteButtons={true}
                          className="mb-4"
                        />
                      </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex gap-4 pt-6">
                      <button
                        onClick={handleSave}
                        disabled={isSaving || !hasUnsavedChanges}
                        className="flex items-center px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <HiSave className="w-5 h-5 mr-2" />
                        {isSaving ? "Guardando..." : "Guardar"}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Cancelar y Volver
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Vista previa */}
              <div className="mt-12 border-t pt-8">
                <h2 className="text-xl font-bold text-bg-secondary font-bevietnam mb-6">
                  Vista previa
                </h2>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bevietnam font-bold text-bg-secondary mb-3">
                      {currentEdicion.title || "Título de la Edición"}
                    </h1>
                    <p className="text-xl font-joly italic text-accent-blue mb-6">
                      {currentEdicion.date
                        ? new Date(currentEdicion.date).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )
                        : "Fecha"}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div
                          className="text-lg font-bevietnam text-text-primary/80 leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html:
                              currentEdicion.description ||
                              "Descripción de la edición",
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-lg font-bevietnam">
                          <span className="font-bold">Ubicación:</span>{" "}
                          {currentEdicion.location || "Ubicación"}
                        </p>
                        <p className="text-lg font-bevietnam">
                          <span className="font-bold">Participantes:</span>{" "}
                          {currentEdicion.participants || 0}
                        </p>
                        <p className="text-lg font-bevietnam">
                          <span className="font-bold">Visitantes:</span>{" "}
                          {currentEdicion.visitors || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Imágenes */}
                  {processedImages[currentEdicion.id]?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-bg-secondary font-bevietnam mb-4">
                        Imágenes ({processedImages[currentEdicion.id].length})
                      </h3>
                      <PinterestGrid
                        images={processedImages[currentEdicion.id].map(
                          (url, index) => ({
                            id: `preview-edicion-${index}`,
                            url,
                            alt: `Imagen ${index + 1} de ${
                              currentEdicion.title
                            }`,
                          })
                        )}
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="grid gap-6">
              {ediciones.map((edicion) => (
                <motion.div
                  key={edicion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-bg-secondary font-bevietnam mb-2">
                        {edicion.title}
                      </h3>
                      <p className="text-text-primary/80 font-bevietnam mb-2">
                        {edicion.date
                          ? new Date(edicion.date).toLocaleDateString("es-ES", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Sin fecha"}{" "}
                        • {edicion.location}
                      </p>
                      <p className="text-text-primary font-bevietnam">
                        {edicion.participants} participantes •{" "}
                        {edicion.visitors} visitantes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPreviewModal({ isOpen: true, edicion });
                        }}
                        className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                        title="Vista previa"
                      >
                        <HiEye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(edicion)}
                        className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <HiPencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(edicion.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de vista previa */}
        <PreviewModal
          edicion={previewModal.edicion!}
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false, edicion: null })}
        />
      </div>
    </AuthCheck>
  );
}
