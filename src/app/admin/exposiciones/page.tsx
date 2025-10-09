"use client";
import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { HiPlus, HiPencil, HiTrash, HiSave, HiUpload } from "react-icons/hi";
import CustomQuillEditor from "@/components/Editor/CustomQuillEditor";
import AuthCheck from "@/components/Auth/AuthCheck";
import PinterestGrid from "@/components/ui/PinterestGrid";
import {
  getCollection,
  getDocument,
  getDocumentsWithFilter,
  addDocument,
  updateDocument,
  deleteDocument,
  removeDuplicateImages,
} from "@/lib/firestore-helpers";

interface Exposicion {
  id: string;
  created_at?: string;
  title: string;
  description: string;
}

// Función para generar un ID temporal para nuevas exposiciones
const generateTempId = () => {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const EMPTY_EXPOSICION: Exposicion = {
  id: "",
  title: "",
  description: "",
};

export default function ExposicionesAdminPage() {
  const [exposiciones, setExposiciones] = useState<Exposicion[]>([]);
  const [currentExposicion, setCurrentExposicion] = useState<Exposicion | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [exposicionImages, setExposicionImages] = useState<
    Record<string, string[]>
  >({});
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  useEffect(() => {
    loadExposiciones();
  }, []);

  // Memoizar las imágenes procesadas para evitar re-renders innecesarios
  const processedImages = useMemo(() => {
    return exposicionImages;
  }, [exposicionImages]);

  const loadExposiciones = async () => {
    try {
      const data = await getCollection("exhibitions");
      console.log("📊 EXPOSICIONES - Datos cargados:", data?.length || 0);

      if (data) {
        // Ordenar por fecha de creación descendente
        const sortedExposiciones = data.sort((a: any, b: any) => {
          const dateA = a.created_at?.toDate
            ? a.created_at.toDate()
            : new Date(a.created_at || Date.now());
          const dateB = b.created_at?.toDate
            ? b.created_at.toDate()
            : new Date(b.created_at || Date.now());
          return dateB.getTime() - dateA.getTime();
        });

        setExposiciones(sortedExposiciones as Exposicion[]);

        // Cargar imágenes
        const imagesData = await getDocumentsWithFilter(
          "images",
          "section",
          "exhibitions"
        );

        console.log(
          "🖼️ EXPOSICIONES - Imágenes cargadas:",
          imagesData?.length || 0
        );

        if (imagesData) {
          const uniqueImages = removeDuplicateImages(imagesData);
          const imagesByExposition = uniqueImages.reduce((acc, img) => {
            if (!acc[img.section_id]) {
              acc[img.section_id] = [];
            }
            acc[img.section_id].push(img.url);
            return acc;
          }, {} as Record<string, string[]>);

          setExposicionImages(imagesByExposition);
        }
      } else {
        console.log("⚠️ No hay exposiciones en Firebase");
        setExposiciones([]);
      }
    } catch (error) {
      console.error("❌ Error cargando exposiciones:", error);
      setExposiciones([]);
    }
  };

  const handleCreate = () => {
    setCurrentExposicion(EMPTY_EXPOSICION);
    setIsEditing(true);
    setHasUnsavedChanges(false);
  };

  const handleEdit = (exposicion: Exposicion) => {
    setCurrentExposicion(exposicion);
    setIsEditing(true);
    setHasUnsavedChanges(false);
  };

  const handleImageUpload = async (files: FileList) => {
    if (!currentExposicion) {
      alert("Por favor, selecciona una exposición para subir imágenes");
      return;
    }

    // Si es una exposición nueva sin ID, generar un ID temporal
    let exposicionId = currentExposicion.id;
    if (!exposicionId || exposicionId === "") {
      exposicionId = generateTempId();
      setCurrentExposicion({ ...currentExposicion, id: exposicionId });
    }

    setIsUploadingImages(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", "feriafotografia/exhibitions");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls) {
        const newImages = [
          ...(exposicionImages[exposicionId] || []),
          ...data.urls,
        ];
        setExposicionImages({
          ...exposicionImages,
          [exposicionId]: newImages,
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
    if (!currentExposicion) return;

    try {
      // Buscar la imagen en Firebase
      const images = await getDocumentsWithFilter("images", "url", imageUrl);

      // Eliminar de la base de datos
      for (const img of images) {
        await deleteDocument("images", img.id);
      }

      // Actualizar estado local
      setExposicionImages((prev) => ({
        ...prev,
        [currentExposicion.id]: prev[currentExposicion.id].filter(
          (url) => url !== imageUrl
        ),
      }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("❌ Error eliminando imagen:", error);
      alert("Error al eliminar la imagen");
    }
  };

  const handleSave = async () => {
    if (!currentExposicion) return;

    setIsSaving(true);
    try {
      let exposicionId = currentExposicion.id;
      const exposicionData = {
        title: currentExposicion.title,
        description: currentExposicion.description,
      };

      // Determinar si es una exposición nueva o existente
      const isNewExposicion =
        !exposicionId ||
        exposicionId === "" ||
        exposicionId.startsWith("temp-");

      if (isNewExposicion) {
        // CREAR NUEVA EXPOSICIÓN
        exposicionId = await addDocument("exhibitions", {
          ...exposicionData,
          created_at: new Date(),
        });

        setCurrentExposicion({ ...currentExposicion, id: exposicionId });
      } else {
        // ACTUALIZAR EXPOSICIÓN EXISTENTE
        await updateDocument("exhibitions", exposicionId, exposicionData);
      }

      // Guardar imágenes en la base de datos
      if (exposicionId) {
        const currentImages =
          exposicionImages[currentExposicion.id] ||
          exposicionImages[exposicionId] ||
          [];

        // Obtener las imágenes actuales en la base de datos para esta exposición
        const existingImagesInDb = await getDocumentsWithFilter(
          "images",
          "section_id",
          exposicionId
        );

        // Crear un set de URLs actuales en el estado local
        const currentImageUrls = new Set(currentImages);

        // Eliminar imágenes que ya no están en el estado local
        for (const dbImage of existingImagesInDb) {
          const imageUrl = (dbImage as any).url;
          if (!currentImageUrls.has(imageUrl)) {
            await deleteDocument("images", dbImage.id);
          }
        }

        // Crear un set de URLs existentes en la BD
        const existingImageUrls = new Set(
          existingImagesInDb.map((img: any) => img.url)
        );

        // Agregar imágenes nuevas que no están en la BD
        for (const imageUrl of currentImages) {
          if (!existingImageUrls.has(imageUrl)) {
            await addDocument("images", {
              url: imageUrl,
              alt: `Imagen de ${currentExposicion.title}`,
              section: "exhibitions",
              section_id: exposicionId,
            });
          }
        }
      }

      setHasUnsavedChanges(false);
      alert("Cambios guardados correctamente");
      await loadExposiciones();
      setCurrentExposicion(null);
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      alert(`Error al guardar los cambios: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta exposición?")) return;

    try {
      // Eliminar imágenes asociadas
      const imagesData = await getDocumentsWithFilter(
        "images",
        "section_id",
        id
      );

      // Eliminar registros de imágenes de la base de datos
      for (const img of imagesData) {
        await deleteDocument("images", img.id);
      }

      // Eliminar la exposición
      await deleteDocument("exhibitions", id);

      alert("Exposición eliminada correctamente");
      await loadExposiciones();
      setCurrentExposicion(null);
      setIsEditing(false);
    } catch (error) {
      console.error("❌ Error al eliminar:", error);
      alert("Error al eliminar la exposición");
    }
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

    setCurrentExposicion(null);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-6 py-8 pt-20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-bg-secondary font-bevietnam">
              {isEditing
                ? currentExposicion?.id
                  ? `Editar: ${currentExposicion.title || "Exposición"}`
                  : "Nueva Exposición"
                : "Administrar Exposiciones"}
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
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
              >
                <HiPlus className="w-5 h-5" />
                Nueva Exposición
              </button>
            )}
          </div>

          {isEditing && currentExposicion ? (
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
                      {currentExposicion.id
                        ? "Editar Exposición"
                        : "Nueva Exposición"}
                    </h2>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título
                      </label>
                      <input
                        type="text"
                        value={currentExposicion.title}
                        onChange={(e) => {
                          setCurrentExposicion({
                            ...currentExposicion,
                            title: e.target.value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <CustomQuillEditor
                        value={currentExposicion.description}
                        onChange={(value) => {
                          setCurrentExposicion({
                            ...currentExposicion,
                            description: value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                      />
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
                        id="file-upload-exhibitions"
                      />
                      <label
                        htmlFor="file-upload-exhibitions"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
                      >
                        {isUploadingImages
                          ? "Subiendo..."
                          : "Seleccionar Imágenes"}
                      </label>
                    </div>

                    {/* Grid de imágenes estilo Pinterest */}
                    {processedImages[currentExposicion.id]?.length > 0 && (
                      <div className="relative">
                        <PinterestGrid
                          images={processedImages[currentExposicion.id].map(
                            (url, index) => ({
                              id: `exposicion-${index}`,
                              url,
                              alt: `Imagen ${index + 1} de ${
                                currentExposicion.title
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
                    {/* Título centrado */}
                    <div className="text-center mb-12">
                      <h1 className="text-4xl md:text-5xl font-bevietnam font-bold text-bg-secondary mb-6 bg-gradient-to-r from-accent-blue to-bg-secondary bg-clip-text text-transparent">
                        {currentExposicion.title || "Título de la Exposición"}
                      </h1>
                    </div>

                    {/* Texto en dos columnas centradas */}
                    <div className="max-w-6xl mx-auto">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Primera columna */}
                        <div className="prose prose-lg max-w-none text-justify [&_p]:mb-4 [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_ul]:list-disc [&_ol]:list-decimal [&_ul,&_ol]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-accent-blue [&_blockquote]:pl-4 [&_blockquote]:italic [&_p:first-of-type]:mt-0 [&_.ql-font-bevietnam]:font-bevietnam [&_.ql-font-joly]:font-joly">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: currentExposicion.description
                                ? currentExposicion.description.slice(
                                    0,
                                    currentExposicion.description.length / 2
                                  )
                                : "Primera mitad de la descripción",
                            }}
                          />
                        </div>

                        {/* Segunda columna */}
                        <div className="prose prose-lg max-w-none text-justify [&_p]:mb-4 [&_h1]:text-4xl [&_h2]:text-3xl [&_h3]:text-2xl [&_ul]:list-disc [&_ol]:list-decimal [&_ul,&_ol]:pl-4 [&_blockquote]:border-l-4 [&_blockquote]:border-accent-blue [&_blockquote]:pl-4 [&_blockquote]:italic [&_p:first-of-type]:mt-0 [&_.ql-font-bevietnam]:font-bevietnam [&_.ql-font-joly]:font-joly">
                          <div
                            dangerouslySetInnerHTML={{
                              __html: currentExposicion.description
                                ? currentExposicion.description.slice(
                                    currentExposicion.description.length / 2
                                  )
                                : "Segunda mitad de la descripción",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Imágenes */}
                  {processedImages[currentExposicion.id]?.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-bg-secondary font-bevietnam mb-4">
                        Imágenes ({processedImages[currentExposicion.id].length}
                        )
                      </h3>
                      <PinterestGrid
                        images={processedImages[currentExposicion.id].map(
                          (url, index) => ({
                            id: `preview-exposicion-${index}`,
                            url,
                            alt: `Imagen ${index + 1} de ${
                              currentExposicion.title
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
              {exposiciones.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg">
                  <p className="text-gray-500 mb-4">
                    No hay exposiciones todavía.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Haz clic en "Nueva Exposición" para crear una.
                  </p>
                </div>
              ) : (
                exposiciones.map((exposicion) => (
                  <motion.div
                    key={exposicion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-lg shadow-md p-6"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-bg-secondary font-bevietnam">
                          {exposicion.title}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(exposicion)}
                          className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <HiPencil className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(exposicion.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
