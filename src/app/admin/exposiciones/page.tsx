"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { HiPlus, HiPencil, HiTrash, HiSave, HiUpload } from "react-icons/hi";
import CustomQuillEditor from "@/components/Editor/CustomQuillEditor";
import AuthCheck from "@/components/Auth/AuthCheck";

interface Exposicion {
  id: string;
  created_at?: string;
  title: string;
  description: string;
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
    Record<string, string[]>
  >({});
  const [isUploadingImages, setIsUploadingImages] = useState(false);

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
            acc[img.section_id].push(img.url);
            return acc;
          }, {} as Record<string, string[]>);

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

  const handleImageUpload = async (files: FileList) => {
    if (!currentExposicion) {
      alert("Por favor, selecciona una exposición para subir imágenes");
      return;
    }

    setIsUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `exhibitions/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        return publicUrl;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      setExposicionImages((prev) => ({
        ...prev,
        [currentExposicion.id]: [
          ...(prev[currentExposicion.id] || []),
          ...newImageUrls,
        ],
      }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error subiendo imágenes:", error);
      alert("Error al subir las imágenes");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    if (!currentExposicion) return;

    try {
      // Extraer el nombre del archivo de la URL
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("images")
          .remove([`exhibitions/${fileName}`]);

        if (storageError) throw storageError;
      }

      // Eliminar de la base de datos
      const { error: dbError } = await supabase
        .from("images")
        .delete()
        .eq("url", imageUrl);

      if (dbError) throw dbError;

      // Actualizar estado local
      setExposicionImages((prev) => ({
        ...prev,
        [currentExposicion.id]: prev[currentExposicion.id].filter(
          (url) => url !== imageUrl
        ),
      }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      alert("Error al eliminar la imagen");
    }
  };

  const handleSave = async () => {
    if (!currentExposicion) return;
    setIsSaving(true);
    try {
      let exposicionId = currentExposicion.id;
      if (!exposicionId) {
        // Crear nueva exposición
        const { data: newExposicion, error: createError } = await supabase
          .from("exhibitions")
          .insert({
            title: currentExposicion.title,
            description: currentExposicion.description,
          })
          .select()
          .single();
        if (createError) throw createError;
        exposicionId = newExposicion.id;
      } else {
        // Actualizar exposición existente
        const { error: updateError } = await supabase
          .from("exhibitions")
          .update({
            title: currentExposicion.title,
            description: currentExposicion.description,
          })
          .eq("id", exposicionId);
        if (updateError) throw updateError;
      }

      // Guardar imágenes en la base de datos
      if (exposicionId) {
        const currentImages = exposicionImages[currentExposicion.id] || [];
        for (const imageUrl of currentImages) {
          // Verificar si la imagen ya existe en la base de datos
          const { data: existingImage } = await supabase
            .from("images")
            .select("id")
            .eq("url", imageUrl)
            .single();

          if (!existingImage) {
            // Si no existe, insertarla
            const { error: imageError } = await supabase.from("images").insert({
              url: imageUrl,
              alt: `Imagen de ${currentExposicion.title}`,
              section: "exhibitions",
              section_id: exposicionId,
            });
            if (imageError) throw imageError;
          }
        }
      }

      setHasUnsavedChanges(false);
      alert("Cambios guardados correctamente");
      loadExposiciones();
      setCurrentExposicion(null);
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
      // Eliminar imágenes asociadas
      const { data: imagesData, error: imagesError } = await supabase
        .from("images")
        .select("*")
        .eq("section_id", id);

      if (imagesError) throw imagesError;

      // Eliminar archivos del storage
      if (imagesData) {
        for (const img of imagesData) {
          const fileName = img.url.split("/").pop();
          if (fileName) {
            await supabase.storage
              .from("images")
              .remove([`exhibitions/${fileName}`]);
          }
        }
      }

      // Eliminar registros de imágenes de la base de datos
      const { error: deleteImagesError } = await supabase
        .from("images")
        .delete()
        .eq("section_id", id);

      if (deleteImagesError) throw deleteImagesError;

      // Eliminar la exposición
      const { error: deleteError } = await supabase
        .from("exhibitions")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      alert("Exposición eliminada correctamente");
      loadExposiciones();
      setCurrentExposicion(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar la exposición");
    }
  };

  const handleCancel = () => {
    setCurrentExposicion(null);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-bg-secondary font-bevietnam">
              Administrar Exposiciones
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Nueva Exposición
            </button>
          </div>

          {isEditing && currentExposicion ? (
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

                  {/* Grid de imágenes */}
                  {exposicionImages[currentExposicion.id]?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {exposicionImages[currentExposicion.id].map(
                        (imageUrl, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <img
                                src={imageUrl}
                                alt={`Imagen ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Overlay con botón de eliminar */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button
                                onClick={() => handleImageDelete(imageUrl)}
                                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                title="Eliminar imagen"
                              >
                                <HiTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )
                      )}
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
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {exposiciones.map((exposicion) => (
                <motion.div
                  key={exposicion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-bg-secondary font-bevietnam mb-2">
                        {exposicion.title}
                      </h3>
                      <p className="text-text-primary/80 font-bevietnam">
                        {exposicion.description}
                      </p>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
