"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { HiUpload, HiTrash, HiSave } from "react-icons/hi";
import { motion } from "framer-motion";
import CustomQuillEditor from "@/components/Editor/CustomQuillEditor";
import AuthCheck from "@/components/Auth/AuthCheck";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DroppableProvided,
  DraggableProvided,
} from "react-beautiful-dnd";

interface AboutContent {
  id?: number;
  title: string;
  content: string;
  images: string[];
}

interface ImageItem {
  id: string;
  url: string;
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>({
    id: undefined,
    title: "",
    content: "",
    images: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrls, setPreviewUrls] = useState<ImageItem[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    // Verificar autenticación al cargar
    const checkAuth = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error || !session) {
        console.error("Error de autenticación:", error);
        setError("Debes iniciar sesión para acceder a esta página");
        return;
      }
      loadAboutContent();
    };

    checkAuth();
  }, []);

  const loadAboutContent = async () => {
    try {
      const { data: aboutData, error: aboutError } = await supabase
        .from("about")
        .select("*")
        .single();

      if (aboutError) throw aboutError;

      const { data: imagesData, error: imagesError } = await supabase
        .from("images")
        .select("*")
        .eq("section", "about")
        .order("created_at", { ascending: true });

      if (imagesError) throw imagesError;

      if (aboutData) {
        const imageItems =
          imagesData?.map((img, index) => ({
            id: `image-${index}`,
            url: img.url,
          })) || [];

        setContent({
          ...aboutData,
          images: imageItems.map((item) => item.url),
        });
        setPreviewUrls(imageItems);
      }
    } catch (error) {
      console.error("Error cargando contenido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `about/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      setContent((prev) => ({
        ...prev,
        images: [...prev.images, publicUrl],
      }));
      setPreviewUrls((prev) => [
        ...prev,
        { id: `image-${Date.now()}`, url: publicUrl },
      ]);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
    }
  };

  const handleImageDelete = async (url: string) => {
    try {
      const path = url.split("/").pop();
      if (!path) return;

      await supabase.storage.from("images").remove([`about/${path}`]);
      await supabase.from("images").delete().eq("url", url);

      setContent((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img !== url),
      }));
      setPreviewUrls((prev) => prev.filter((item) => item.url !== url));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error eliminando imagen:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Guardar el contenido principal
      const { error: aboutError } = await supabase.from("about").upsert({
        id: content.id,
        title: content.title,
        content: content.content,
        updated_at: new Date().toISOString(),
      });

      if (aboutError) throw aboutError;

      // Por ahora, solo actualizamos las URLs de las imágenes
      const { error: imagesError } = await supabase
        .from("images")
        .delete()
        .eq("section", "about")
        .then(() =>
          supabase.from("images").insert(
            previewUrls.map((item) => ({
              url: item.url,
              section: "about",
              alt: `Imagen ${item.id}`,
            }))
          )
        );

      if (imagesError) throw imagesError;

      setHasUnsavedChanges(false);
      alert("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error guardando cambios:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMultipleImageUpload = async (files: FileList) => {
    setIsSaving(true);
    setError(null);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `about-${Date.now()}-${Math.random()}.${fileExt}`;
        const filePath = `about/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("images").getPublicUrl(filePath);

        // Insertar en la tabla images
        await supabase.from("images").insert({
          url: publicUrl,
          section: "about",
          alt: file.name.split(".")[0],
        });

        return { id: `image-${Date.now()}`, url: publicUrl };
      });

      const newItems = await Promise.all(uploadPromises);
      console.log(
        "Nuevas URLs:",
        newItems.map((item) => item.url)
      ); // Para debug

      // Actualizar estados
      setContent((prev) => ({
        ...prev,
        images: [...prev.images, ...newItems.map((item) => item.url)],
      }));
      setPreviewUrls((prev) => [...prev, ...newItems]);

      await handleSave();
    } catch (error) {
      console.error("Error subiendo imágenes:", error);
      setError(
        error instanceof Error ? error.message : "Error al subir imágenes"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(previewUrls);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPreviewUrls(items);
    setContent((prev) => ({
      ...prev,
      images: items.map((item) => item.url),
    }));
    setHasUnsavedChanges(true);
  };

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500">
        {error}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Cargando...</div>
    );
  }

  return (
    <AuthCheck>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-bg-secondary font-bevietnam">
            Editar Información General
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Título */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) => {
                setContent({ ...content, title: e.target.value });
                setHasUnsavedChanges(true);
              }}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none font-bevietnam"
            />
          </div>

          {/* Editor de contenido */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium">Contenido</label>
            </div>
            <CustomQuillEditor
              value={content.content}
              onChange={(value) => {
                setContent({ ...content, content: value });
                setHasUnsavedChanges(true);
              }}
              className="h-64"
            />
          </div>

          {/* Gestor de imágenes */}
          <div>
            <label className="block text-sm font-medium mb-2">Imágenes</label>

            {/* Grid de imágenes existentes */}
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="images" direction="horizontal">
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4"
                    style={{ display: "grid" }}
                  >
                    {previewUrls.map((item, index) => (
                      <Draggable
                        key={item.id}
                        draggableId={item.id}
                        index={index}
                      >
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="relative group cursor-move"
                            style={{ ...provided.draggableProps.style }}
                          >
                            <img
                              src={item.url}
                              alt={`Imagen ${index + 1}`}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => handleImageDelete(item.url)}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <HiTrash className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            {/* Zona de drop para nuevas imágenes */}
            <label className="flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-accent-blue focus:outline-none">
              <span className="flex items-center space-x-2">
                <HiUpload className="w-6 h-6 text-gray-600" />
                <span className="font-medium text-gray-600">
                  Arrastra las imágenes aquí o haz clic para seleccionar
                </span>
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0)
                    handleMultipleImageUpload(files);
                }}
              />
            </label>
            <p className="mt-2 text-sm text-gray-500">
              Puedes seleccionar múltiples imágenes a la vez
            </p>
          </div>
        </div>

        {/* Preview Section */}
        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-bold text-bg-secondary font-bevietnam mb-6">
            Vista previa
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Contenido */}
              <div>
                <h2 className="text-2xl font-bold text-bg-secondary font-bevietnam mb-4">
                  {content.title || "Título"}
                </h2>
                <div
                  className="prose prose-lg"
                  dangerouslySetInnerHTML={{ __html: content.content || "" }}
                />
              </div>

              {/* Imágenes */}
              <div className="grid grid-cols-2 gap-4">
                {previewUrls.map((item, index) => (
                  <img
                    key={item.id}
                    src={item.url}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Botón de guardar */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-colors ${
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
      </div>
    </AuthCheck>
  );
}
