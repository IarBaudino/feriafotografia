"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
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

interface Edicion {
  id: string;
  created_at?: string;
  title: string;
  date: string;
  description: string;
  location: string;
  participants: number;
  visitors: number;
}

interface PreviewModalProps {
  edicion: Edicion;
  isOpen: boolean;
  onClose: () => void;
}

function PreviewModal({ edicion, isOpen, onClose }: PreviewModalProps) {
  if (!isOpen) return null;

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
              {edicion.date}
            </p>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-lg font-bevietnam text-text-primary/80 leading-relaxed">
                  {edicion.description}
                </p>
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

const EMPTY_EDICION: Edicion = {
  id: "",
  title: "",
  date: "",
  description: "",
  location: "",
  participants: 0,
  visitors: 0,
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
  const [previewModal, setPreviewModal] = useState<{
    isOpen: boolean;
    edicion: Edicion | null;
  }>({ isOpen: false, edicion: null });

  useEffect(() => {
    loadEdiciones();
  }, []);

  const loadEdiciones = async () => {
    try {
      const { data, error } = await supabase
        .from("editions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;

      if (data) {
        setEdiciones(data);

        // Cargar imágenes
        const { data: imagesData, error: imagesError } = await supabase
          .from("images")
          .select("*")
          .eq("section", "editions");

        if (imagesError) throw imagesError;

        if (imagesData) {
          const imagesByEdition = imagesData.reduce((acc, img) => {
            if (!acc[img.section_id]) {
              acc[img.section_id] = [];
            }
            acc[img.section_id].push(img.url);
            return acc;
          }, {} as Record<string, string[]>);

          setEdicionImages(imagesByEdition);
        }
      }
    } catch (error) {
      console.error("Error cargando ediciones:", error);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!currentEdicion) {
      alert("Por favor, selecciona una edición para subir imágenes");
      return;
    }

    setIsUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `editions/${fileName}`;

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
      setEdicionImages((prev) => ({
        ...prev,
        [currentEdicion.id]: [
          ...(prev[currentEdicion.id] || []),
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
    if (!currentEdicion) return;

    try {
      // Extraer el nombre del archivo de la URL
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("images")
          .remove([`editions/${fileName}`]);

        if (storageError) throw storageError;
      }

      // Eliminar de la base de datos
      const { error: dbError } = await supabase
        .from("images")
        .delete()
        .eq("url", imageUrl);

      if (dbError) throw dbError;

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

  const handleSave = async () => {
    if (!currentEdicion) return;

    setIsSaving(true);
    try {
      let edicionId = currentEdicion.id;

      if (!edicionId) {
        // Crear nueva edición
        const { data: newEdicion, error: createError } = await supabase
          .from("editions")
          .insert({
            title: currentEdicion.title,
            date: currentEdicion.date,
            description: currentEdicion.description,
            location: currentEdicion.location,
            participants: currentEdicion.participants,
            visitors: currentEdicion.visitors,
          })
          .select()
          .single();

        if (createError) throw createError;
        edicionId = newEdicion.id;
      } else {
        // Actualizar edición existente
        const { error: updateError } = await supabase
          .from("editions")
          .update({
            title: currentEdicion.title,
            date: currentEdicion.date,
            description: currentEdicion.description,
            location: currentEdicion.location,
            participants: currentEdicion.participants,
            visitors: currentEdicion.visitors,
          })
          .eq("id", edicionId);

        if (updateError) throw updateError;
      }

      // Guardar imágenes en la base de datos
      if (edicionId) {
        const currentImages = edicionImages[currentEdicion.id] || [];
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
              alt: `Imagen de ${currentEdicion.title}`,
              section: "editions",
              section_id: edicionId,
            });
            if (imageError) throw imageError;
          }
        }
      }

      setHasUnsavedChanges(false);
      alert("Cambios guardados correctamente");
      loadEdiciones();
      setCurrentEdicion(null);
      setIsEditing(false);
    } catch (error) {
      console.error("Error guardando edición:", error);
      alert("Error al guardar la edición");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (edicionId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta edición?")) return;

    try {
      // Eliminar imágenes asociadas
      const { data: imagesData, error: imagesError } = await supabase
        .from("images")
        .select("*")
        .eq("section_id", edicionId);

      if (imagesError) throw imagesError;

      // Eliminar archivos del storage
      if (imagesData) {
        for (const img of imagesData) {
          const fileName = img.url.split("/").pop();
          if (fileName) {
            await supabase.storage
              .from("images")
              .remove([`editions/${fileName}`]);
          }
        }
      }

      // Eliminar registros de imágenes de la base de datos
      const { error: deleteImagesError } = await supabase
        .from("images")
        .delete()
        .eq("section_id", edicionId);

      if (deleteImagesError) throw deleteImagesError;

      // Eliminar la edición
      const { error: deleteError } = await supabase
        .from("editions")
        .delete()
        .eq("id", edicionId);

      if (deleteError) throw deleteError;

      alert("Edición eliminada correctamente");
      loadEdiciones();
    } catch (error) {
      console.error("Error eliminando edición:", error);
      alert("Error al eliminar la edición");
    }
  };

  const handleEdit = (edicion: Edicion) => {
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
    setCurrentEdicion(null);
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-bg-secondary font-bevietnam">
              Administrar Ediciones
            </h1>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Nueva Edición
            </button>
          </div>

          {isEditing && currentEdicion ? (
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
                      type="text"
                      value={currentEdicion.date}
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

                  {/* Grid de imágenes */}
                  {edicionImages[currentEdicion.id]?.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {edicionImages[currentEdicion.id].map(
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
                        {edicion.date} • {edicion.location}
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
