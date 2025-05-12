"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { HiPlus, HiPencil, HiTrash, HiUpload, HiSave } from "react-icons/hi";
import CustomQuillEditor from "@/components/Editor/CustomQuillEditor";
import AuthCheck from "@/components/Auth/AuthCheck";
import Masonry from "react-masonry-css";

interface Exposicion {
  id: string;
  created_at?: string;
  title: string;
  description: string;
}

interface ExposicionImage {
  id: string;
  url: string;
  alt: string;
  section_id: string;
  artist_name: string;
  artwork_title: string;
  social_media: string;
  is_main: boolean;
}

interface PendingImageChanges {
  [imageId: string]: {
    artwork_title?: string;
    artist_name?: string;
    social_media?: string;
    is_main?: boolean;
  };
}

export default function ExposicionesAdminPage() {
  const [exposiciones, setExposiciones] = useState<Exposicion[]>([]);
  const [currentExposicion, setCurrentExposicion] = useState<Exposicion | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [exposicionImages, setExposicionImages] = useState<
    Record<string, ExposicionImage[]>
  >({});
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [pendingImageChanges, setPendingImageChanges] =
    useState<PendingImageChanges>({});
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    loadExposiciones();
  }, []);

  const loadExposiciones = async () => {
    try {
      const { data, error } = await supabase
        .from("exhibitions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setExposiciones(data);

        // Cargar imágenes
        const { data: imagesData, error: imagesError } = await supabase
          .from("images")
          .select("*")
          .eq("section", "exhibitions");

        if (imagesError) throw imagesError;

        if (imagesData) {
          const imagesByExposition = imagesData.reduce((acc, img) => {
            if (!acc[img.section_id]) {
              acc[img.section_id] = [];
            }
            acc[img.section_id].push(img);
            return acc;
          }, {} as Record<string, ExposicionImage[]>);

          setExposicionImages(imagesByExposition);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleCreate = () => {
    setCurrentExposicion({
      id: "",
      title: "Nueva Exposición",
      description: "",
    });
    setIsEditing(true);
    setHasUnsavedChanges(true);
  };

  const handleEdit = (exposicion: Exposicion) => {
    setCurrentExposicion(exposicion);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!currentExposicion) return;
    setIsSaving(true);

    try {
      // Guardar cambios de la exposición
      let savedExposicion = currentExposicion;

      if (!currentExposicion.id) {
        const { data, error } = await supabase
          .from("exhibitions")
          .insert({
            title: currentExposicion.title,
            description: currentExposicion.description,
          })
          .select()
          .single();

        if (error) throw error;
        if (data) {
          savedExposicion = data;
          setCurrentExposicion(data);
        }
      } else {
        const { error } = await supabase
          .from("exhibitions")
          .update({
            title: currentExposicion.title,
            description: currentExposicion.description,
          })
          .eq("id", currentExposicion.id);

        if (error) throw error;
      }

      // Guardar cambios pendientes de imágenes
      if (Object.keys(pendingImageChanges).length > 0) {
        // Primero encontrar la imagen principal
        const mainImageId = Object.entries(pendingImageChanges).find(
          ([_, changes]) => changes.is_main === true
        )?.[0];

        // Si hay una imagen principal, establecerla primero
        if (mainImageId) {
          console.log("Estableciendo imagen principal:", mainImageId);
          const { error: mainError } = await supabase.rpc("set_main_image", {
            p_section_id: currentExposicion.id,
            p_image_id: mainImageId,
          });
          if (mainError) throw mainError;
        }

        // Guardar el resto de los cambios
        for (const [imageId, changes] of Object.entries(pendingImageChanges)) {
          const { is_main, ...otherChanges } = changes;
          if (Object.keys(otherChanges).length > 0) {
            const { error } = await supabase
              .from("images")
              .update(otherChanges)
              .eq("id", imageId);
            if (error) throw error;
          }
        }
      }

      await loadExposiciones();
      setPendingImageChanges({});
      setHasUnsavedChanges(false);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar esta exposición?")) return;

    try {
      const { error } = await supabase
        .from("exhibitions")
        .delete()
        .eq("id", id);
      if (error) throw error;

      loadExposiciones();
      setCurrentExposicion(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar la exposición");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentExposicion?.id) {
      alert("Por favor, guarda la exposición antes de subir imágenes");
      return;
    }

    const files = Array.from(e.target.files);

    // Crear URLs de preview
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);

    setIsUploadingImages(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `expositions/${currentExposicion.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        const { data: imageData, error: imageError } = await supabase
          .from("images")
          .insert({
            url: publicUrl,
            alt: `Imagen de ${currentExposicion.title}`,
            section: "exhibitions",
            section_id: currentExposicion.id,
            is_main: false, // Asegurarnos que las nuevas imágenes no sean principales
          })
          .select()
          .single();

        if (imageError) throw imageError;
        return imageData;
      });

      const newImages = await Promise.all(uploadPromises);

      // Actualizar el estado local
      setExposicionImages((prev) => ({
        ...prev,
        [currentExposicion.id]: [
          ...(prev[currentExposicion.id] || []),
          ...newImages,
        ],
      }));
    } catch (error) {
      console.error("Error subiendo imágenes:", error);
      alert("Error al subir las imágenes");
    } finally {
      setIsUploadingImages(false);
      imagePreviews.forEach(URL.revokeObjectURL);
      setImagePreviews([]);
    }
  };

  const handleImageDelete = async (img: ExposicionImage) => {
    if (!confirm("¿Estás seguro de eliminar esta imagen?")) return;

    try {
      const { error } = await supabase.from("images").delete().eq("id", img.id);
      if (error) throw error;

      setExposicionImages((prev) => ({
        ...prev,
        [currentExposicion!.id]: prev[currentExposicion!.id].filter(
          (image) => image.id !== img.id
        ),
      }));
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      alert("Error al eliminar la imagen");
    }
  };

  const handleImageUpdate = (imageId: string, field: string, value: string) => {
    // Actualizar UI inmediatamente
    setExposicionImages((prev) => ({
      ...prev,
      [currentExposicion!.id]: prev[currentExposicion!.id].map((img) =>
        img.id === imageId ? { ...img, [field]: value } : img
      ),
    }));

    // Guardar cambio pendiente
    setPendingImageChanges((prev) => ({
      ...prev,
      [imageId]: {
        ...prev[imageId],
        [field]: value,
      },
    }));

    setHasUnsavedChanges(true);
  };

  const handleSetMainImage = (imageId: string) => {
    if (!currentExposicion) return;

    // Actualizar UI inmediatamente
    setExposicionImages((prev) => {
      const updatedImages = prev[currentExposicion.id].map((img) => ({
        ...img,
        is_main: img.id === imageId,
      }));

      return {
        ...prev,
        [currentExposicion.id]: updatedImages,
      };
    });

    // Crear cambios pendientes para todas las imágenes de la exposición actual
    const allImageIds = exposicionImages[currentExposicion.id].map(
      (img) => img.id
    );

    const changes = allImageIds.reduce(
      (acc, imgId) => ({
        ...acc,
        [imgId]: {
          ...pendingImageChanges[imgId],
          is_main: imgId === imageId,
        },
      }),
      {}
    );

    console.log("Cambios pendientes:", changes);

    setPendingImageChanges((prev) => ({
      ...prev,
      ...changes,
    }));

    setHasUnsavedChanges(true);
  };

  const isMainImage = (imageId: string) => {
    if (!currentExposicion) return false;

    // Primero revisar cambios pendientes
    if (pendingImageChanges[imageId]?.is_main !== undefined) {
      return pendingImageChanges[imageId].is_main;
    }

    // Si no hay cambios pendientes, usar el estado actual
    const images = exposicionImages[currentExposicion.id];
    return images?.find((img) => img.id === imageId)?.is_main || false;
  };

  // Agregar helper para obtener la imagen principal
  const getMainImage = (exposicionId: string) => {
    if (!exposicionId) return null;

    const images = exposicionImages[exposicionId];
    if (!images) return null;

    // Buscar imagen con cambios pendientes marcada como principal
    const pendingMainImage = images.find(
      (img) => pendingImageChanges[img.id]?.is_main === true
    );
    if (pendingMainImage) return pendingMainImage;

    // Si no hay cambios pendientes, buscar la imagen principal actual
    return images.find((img) => img.is_main);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8 pt-8">
            <h1 className="text-3xl font-bevietnam font-bold text-bg-secondary">
              Administrar Exposiciones
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-opacity-90"
            >
              <HiPlus className="w-5 h-5" />
              Nueva Exposición
            </button>
          </div>

          {isEditing && currentExposicion ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Título</label>
                <input
                  type="text"
                  value={currentExposicion.title}
                  onChange={(e) => {
                    setCurrentExposicion((prev) =>
                      prev ? { ...prev, title: e.target.value } : null
                    );
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Descripción
                </label>
                <CustomQuillEditor
                  value={currentExposicion.description}
                  onChange={(value) => {
                    setCurrentExposicion((prev) =>
                      prev ? { ...prev, description: value } : null
                    );
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Imágenes
                </label>
                <div className="space-y-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImages}
                    className="w-full p-2 border rounded"
                  />

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={preview}
                          className="relative aspect-video rounded-lg overflow-hidden bg-gray-100"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {isUploadingImages && (
                    <div className="bg-white/50 p-4 rounded-lg">
                      <p className="text-sm text-accent-blue">
                        Subiendo imágenes...
                      </p>
                    </div>
                  )}

                  {currentExposicion &&
                    exposicionImages[currentExposicion.id]?.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                        {exposicionImages[currentExposicion.id].map((img) => (
                          <div
                            key={img.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden"
                          >
                            <div className="relative aspect-video">
                              <img
                                src={img.url}
                                alt={img.alt}
                                className="w-full h-full object-cover"
                              />
                              <button
                                onClick={() => handleImageDelete(img)}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="p-4 space-y-2">
                              <input
                                key={`title-${img.id}`}
                                type="text"
                                placeholder="Título de la obra"
                                value={img.artwork_title || ""}
                                onChange={(e) =>
                                  handleImageUpdate(
                                    img.id,
                                    "artwork_title",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 text-sm border rounded"
                              />
                              <input
                                key={`artist-${img.id}`}
                                type="text"
                                placeholder="Nombre del artista"
                                value={img.artist_name || ""}
                                onChange={(e) =>
                                  handleImageUpdate(
                                    img.id,
                                    "artist_name",
                                    e.target.value
                                  )
                                }
                                className="w-full p-2 text-sm border rounded"
                              />
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-gray-400">
                                  <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                  >
                                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                                  </svg>
                                  <span>@</span>
                                </div>
                                <input
                                  key={`social-${img.id}`}
                                  type="text"
                                  placeholder="Usuario de Instagram"
                                  value={img.social_media || ""}
                                  onChange={(e) =>
                                    handleImageUpdate(
                                      img.id,
                                      "social_media",
                                      e.target.value.replace("@", "")
                                    )
                                  }
                                  className="flex-1 p-2 text-sm border rounded"
                                />
                              </div>
                              <div className="flex items-center mt-4">
                                <button
                                  onClick={() => handleSetMainImage(img.id)}
                                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm ${
                                    isMainImage(img.id)
                                      ? "bg-accent-blue text-white"
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                  }`}
                                >
                                  <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
                                  </svg>
                                  {isMainImage(img.id)
                                    ? "Imagen Principal"
                                    : "Establecer como Principal"}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              </div>

              {/* Vista previa */}
              <div className="mt-8 border-t pt-8">
                <h2 className="text-xl font-bold text-bg-secondary font-bevietnam mb-6">
                  Vista previa
                </h2>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  {/* Header con título y texto en columnas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                    {/* Título */}
                    <div className="md:col-span-3">
                      <h2 className="text-4xl md:text-6xl font-bevietnam font-bold text-bg-secondary mb-6 bg-gradient-to-r from-accent-blue to-bg-secondary bg-clip-text text-transparent">
                        {currentExposicion.title}
                      </h2>
                    </div>

                    {/* Primera columna de texto */}
                    <div>
                      <div
                        className="prose prose-lg max-w-none text-justify"
                        dangerouslySetInnerHTML={{
                          __html: currentExposicion.description.slice(
                            0,
                            currentExposicion.description.length / 2
                          ),
                        }}
                      />
                    </div>

                    {/* Segunda columna de texto */}
                    <div>
                      <div
                        className="prose prose-lg max-w-none text-justify"
                        dangerouslySetInnerHTML={{
                          __html: currentExposicion.description.slice(
                            currentExposicion.description.length / 2
                          ),
                        }}
                      />
                    </div>

                    {/* Imagen Principal */}
                    {exposicionImages[currentExposicion.id]?.length > 0 && (
                      <div className="aspect-[3/4] relative overflow-hidden rounded-lg">
                        <img
                          src={
                            getMainImage(currentExposicion.id)?.url ||
                            exposicionImages[currentExposicion.id][0].url
                          }
                          alt="Imagen Principal"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        {/* Info del artista */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          {getMainImage(currentExposicion.id)
                            ?.artwork_title && (
                            <h3 className="text-lg font-bold">
                              {
                                getMainImage(currentExposicion.id)
                                  ?.artwork_title
                              }
                            </h3>
                          )}
                          {getMainImage(currentExposicion.id)?.artist_name && (
                            <p className="text-sm opacity-90">
                              {getMainImage(currentExposicion.id)?.artist_name}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Grid de imágenes */}
                  {exposicionImages[currentExposicion.id]?.length > 1 && (
                    <div className="mt-12">
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {exposicionImages[currentExposicion.id].map((img) => (
                          <div
                            key={img.id}
                            className="aspect-video relative overflow-hidden rounded-lg"
                          >
                            <img
                              src={img.url}
                              alt={img.alt}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            {/* Info del artista */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              {img.artwork_title && (
                                <h3 className="text-sm font-bold">
                                  {img.artwork_title}
                                </h3>
                              )}
                              {img.artist_name && (
                                <p className="text-xs opacity-90">
                                  {img.artist_name}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2 mt-8">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasUnsavedChanges}
                  className={`flex items-center gap-2 px-6 py-2 rounded-lg ${
                    hasUnsavedChanges
                      ? "bg-accent-green text-white hover:bg-opacity-90"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <HiSave className="w-5 h-5" />
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exposiciones.map((exposicion) => (
                <div
                  key={exposicion.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden group"
                >
                  {exposicionImages[exposicion.id]?.[0] && (
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={exposicionImages[exposicion.id][0].url}
                        alt={exposicionImages[exposicion.id][0].alt}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bevietnam font-bold text-bg-secondary mb-2">
                      {exposicion.title}
                    </h3>
                    <div
                      className="text-sm text-text-primary/70 mb-4 line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: exposicion.description,
                      }}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(exposicion)}
                        className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                      >
                        <HiPencil className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(exposicion.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <HiTrash className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
