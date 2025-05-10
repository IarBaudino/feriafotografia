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
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
} from "react-beautiful-dnd";

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

interface EdicionImage {
  id: string;
  url: string;
  alt: string;
  section_id: string;
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
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [edicionImages, setEdicionImages] = useState<
    Record<string, EdicionImage[]>
  >({});
  const [isUploadingImages, setIsUploadingImages] = useState(false);

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
            acc[img.section_id].push(img);
            return acc;
          }, {} as Record<string, EdicionImage[]>);

          setEdicionImages(imagesByEdition);
        }
      }
    } catch (error) {
      console.error("Error cargando ediciones:", error);
    }
  };

  const handleSave = async () => {
    if (!currentEdicion) return;

    setIsSaving(true);
    try {
      const dataToSave: Partial<Edicion> = {
        title: currentEdicion.title,
        date: currentEdicion.date,
        description: currentEdicion.description,
        location: currentEdicion.location,
        participants: currentEdicion.participants,
        visitors: currentEdicion.visitors,
      };

      if (currentEdicion.id) {
        dataToSave.id = currentEdicion.id;
      }

      const { error } = await supabase.from("editions").upsert(dataToSave);

      if (error) throw error;

      loadEdiciones();
      setHasUnsavedChanges(false);
      setIsEditing(false);
      alert("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error guardando cambios:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentEdicion) return;

    setIsUploadingImages(true);
    try {
      console.log("Iniciando subida de imágenes...");
      const files = Array.from(e.target.files);
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `editions/${currentEdicion.id}/${fileName}`;

        console.log("Subiendo archivo:", filePath);
        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        console.log("URL pública generada:", publicUrl);

        // Guardar referencia en la tabla images
        const { data: imageData, error: imageError } = await supabase
          .from("images")
          .insert({
            url: publicUrl,
            alt: `Imagen de ${currentEdicion.title}`,
            section: "editions",
            section_id: currentEdicion.id,
          })
          .select()
          .single();

        if (imageError) throw imageError;
        console.log("Imagen guardada en BD:", imageData);
        return imageData;
      });

      const newImages = await Promise.all(uploadPromises);
      console.log("Todas las imágenes subidas:", newImages);

      setEdicionImages((prev) => ({
        ...prev,
        [currentEdicion.id]: [...(prev[currentEdicion.id] || []), ...newImages],
      }));

      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error subiendo imágenes:", error);
      alert("Error al subir las imágenes");
    } finally {
      setIsUploadingImages(false);
    }
  };

  const handleImageDelete = async (img: EdicionImage) => {
    if (!currentEdicion) return;

    try {
      // Eliminar el archivo del storage
      const fileName = img.url.split("/").pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("images")
          .remove([`editions/${currentEdicion.id}/${fileName}`]);

        if (storageError) throw storageError;
      }

      // Eliminar el registro de la base de datos
      const { error: dbError } = await supabase
        .from("images")
        .delete()
        .eq("id", img.id);

      if (dbError) throw dbError;

      // Actualizar el estado local
      setEdicionImages((prev) => ({
        ...prev,
        [currentEdicion.id]: prev[currentEdicion.id].filter(
          (image) => image.section_id !== img.section_id
        ),
      }));

      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      alert("Error al eliminar la imagen");
    }
  };

  return (
    <AuthCheck>
      <div className="max-w-6xl mx-auto pt-20 px-6">
        {!isEditing ? (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-bg-secondary font-bevietnam">
              Gestionar Ediciones
            </h1>
            <button
              onClick={() => {
                setCurrentEdicion(EMPTY_EDICION);
                setIsEditing(true);
              }}
              className="bg-accent-green text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-accent-green/90 transition-colors"
            >
              <HiPlus className="w-5 h-5" />
              Nueva Edición
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Título</label>
              <input
                type="text"
                value={currentEdicion?.title || ""}
                onChange={(e) => {
                  setCurrentEdicion((prev) =>
                    prev ? { ...prev, title: e.target.value } : null
                  );
                  setHasUnsavedChanges(true);
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <input
                type="datetime-local"
                value={currentEdicion?.date || ""}
                onChange={(e) => {
                  setCurrentEdicion((prev) =>
                    prev ? { ...prev, date: e.target.value } : null
                  );
                  setHasUnsavedChanges(true);
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Ubicación
              </label>
              <input
                type="text"
                value={currentEdicion?.location || ""}
                onChange={(e) => {
                  setCurrentEdicion((prev) =>
                    prev ? { ...prev, location: e.target.value } : null
                  );
                  setHasUnsavedChanges(true);
                }}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Participantes
                </label>
                <input
                  type="number"
                  value={currentEdicion?.participants || 0}
                  onChange={(e) => {
                    setCurrentEdicion((prev) =>
                      prev
                        ? { ...prev, participants: Number(e.target.value) }
                        : null
                    );
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Visitantes
                </label>
                <input
                  type="number"
                  value={currentEdicion?.visitors || 0}
                  onChange={(e) => {
                    setCurrentEdicion((prev) =>
                      prev
                        ? { ...prev, visitors: Number(e.target.value) }
                        : null
                    );
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Descripción
              </label>
              <textarea
                value={currentEdicion?.description || ""}
                onChange={(e) => {
                  setCurrentEdicion((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  );
                  setHasUnsavedChanges(true);
                }}
                rows={4}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Imágenes</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploadingImages}
                className="w-full p-2 border rounded"
              />

              {/* Mostrar imágenes existentes */}
              {currentEdicion &&
                edicionImages[currentEdicion.id]?.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {edicionImages[currentEdicion.id].map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt={img.alt}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleImageDelete(img)}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
            </div>

            <div className="flex justify-end gap-4 mt-6">
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
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {ediciones.map((edicion) => (
            <motion.div
              key={edicion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl overflow-hidden shadow-lg"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-bg-secondary font-bevietnam mb-2">
                  {edicion.title}
                </h3>
                <p className="text-sm text-accent-blue font-joly mb-4">
                  {new Date(edicion.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-text-primary/80 mb-4 line-clamp-2">
                  {edicion.description}
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setCurrentEdicion(edicion);
                      setIsPreviewOpen(true);
                    }}
                    className="p-2 text-accent-green hover:bg-accent-green/10 rounded-lg transition-colors"
                  >
                    <HiEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setCurrentEdicion(edicion);
                      setIsEditing(true);
                    }}
                    className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                  >
                    <HiPencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      /* Confirmar y eliminar */
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {currentEdicion && (
          <PreviewModal
            edicion={currentEdicion}
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false);
              setCurrentEdicion(null);
            }}
          />
        )}
      </div>
    </AuthCheck>
  );
}
