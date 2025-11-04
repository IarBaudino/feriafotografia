"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import {
  getCollection,
  getDocumentsWithFilter,
  addDocument,
  updateDocument,
  deleteDocument,
  removeDuplicateImages,
} from "@/lib/firestore-helpers";
import { HiSave, HiTrash, HiUpload } from "react-icons/hi";
import { motion } from "framer-motion";
import CustomQuillEditor from "@/components/Editor/CustomQuillEditor";
import AuthCheck from "@/components/Auth/AuthCheck";
import PinterestGrid from "@/components/ui/PinterestGrid";

interface AboutContent {
  id?: string;
  title: string;
  content: string;
  images: string[];
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
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      const aboutDataArray = await getCollection("about");
      const aboutData =
        aboutDataArray && aboutDataArray.length > 0 ? aboutDataArray[0] : null;

      const imagesData = await getDocumentsWithFilter(
        "images",
        "section",
        "about"
      );

      // Filtrar duplicados
      const uniqueImages = removeDuplicateImages(imagesData || []);

      if (aboutData) {
        setContent({
          id: aboutData.id,
          title: (aboutData as any).title || "",
          content: (aboutData as any).content || "",
          images: uniqueImages.map((img: any) => img.url) || [],
        });
      }
    } catch (error) {
      console.error("Error cargando contenido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });
      formData.append("folder", "feriafotografia/about");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls) {
        // Agregar las nuevas URLs al estado local
        const newImages = [...content.images, ...data.urls];
        setContent({
          ...content,
          images: newImages,
        });
        setHasUnsavedChanges(true);
        alert(`${data.urls.length} imagen(es) subida(s) correctamente`);
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error subiendo imágenes:", error);
      alert("Error al subir las imágenes");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    try {
      // Buscar la imagen en Firebase
      const images = await getDocumentsWithFilter("images", "url", imageUrl);

      // Eliminar de la base de datos
      for (const img of images) {
        await deleteDocument("images", img.id);
      }

      // Actualizar estado local
      setContent((prev) => ({
        ...prev,
        images: prev.images.filter((url) => url !== imageUrl),
      }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      alert("Error al eliminar la imagen");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Guardar el contenido principal
      let aboutId = content.id;

      // Intentar actualizar si existe ID
      if (aboutId) {
        try {
          await updateDocument("about", aboutId, {
            title: content.title,
            content: content.content,
            updated_at: new Date(),
          });
        } catch (error) {
          console.log("Documento no existe, creando uno nuevo...");
          // Si falla la actualización, crear un nuevo documento
          aboutId = await addDocument("about", {
            title: content.title,
            content: content.content,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      } else {
        // Si no existe ID, crear el registro
        aboutId = await addDocument("about", {
          title: content.title,
          content: content.content,
          created_at: new Date(),
          updated_at: new Date(),
        });
      }

      // Guardar imágenes en la base de datos
      if (aboutId) {
        for (const imageUrl of content.images) {
          // Verificar si la imagen ya existe en la base de datos
          const existingImages = await getDocumentsWithFilter(
            "images",
            "url",
            imageUrl
          );

          if (existingImages.length === 0) {
            // Si no existe, insertarla
            await addDocument("images", {
              url: imageUrl,
              alt: `Imagen de ${content.title}`,
              section: "about",
              section_id: aboutId,
            });
          }
        }
      }

      setHasUnsavedChanges(false);
      alert("Cambios guardados correctamente");
      loadAboutContent();
    } catch (error) {
      console.error("Error guardando cambios:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-bg-primary">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-bg-secondary">Cargando...</p>
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  if (error) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-bg-primary">
          <div className="container mx-auto px-6 py-8">
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-red-500">{error}</p>
            </div>
          </div>
        </div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-bg-secondary mb-8 font-bevietnam">
                Editar Sección About
              </h1>

              <div className="space-y-6">
                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título
                  </label>
                  <input
                    type="text"
                    value={content.title}
                    onChange={(e) => {
                      setContent({ ...content, title: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue"
                  />
                </div>

                {/* Contenido */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contenido
                  </label>
                  <CustomQuillEditor
                    value={content.content}
                    onChange={(value) => {
                      setContent({ ...content, content: value });
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                {/* Subida de imágenes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes
                  </label>

                  {/* Área de upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4">
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
                      disabled={isUploading}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors"
                    >
                      {isUploading ? "Subiendo..." : "Seleccionar Imágenes"}
                    </label>
                  </div>

                  {/* Grid de imágenes estilo Pinterest */}
                  {content.images.length > 0 && (
                    <PinterestGrid
                      images={content.images.map((url, index) => ({
                        id: `about-${index}`,
                        url,
                        alt: `Imagen ${index + 1} de ${content.title}`,
                      }))}
                      className="mb-4"
                      showDeleteButtons={true}
                      onDeleteImage={handleImageDelete}
                    />
                  )}
                </div>

                {/* Botón de guardar */}
                <div className="flex justify-end pt-6">
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

      {/* Vista previa */}
      <div className="mt-12 border-t pt-8">
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
                dangerouslySetInnerHTML={{
                  __html: content.content || "",
                }}
              />
            </div>

            {/* Imágenes */}
            <div>
              <h3 className="text-lg font-bold text-bg-secondary font-bevietnam mb-4">
                Imágenes ({content.images.length})
              </h3>
              {content.images.length > 0 ? (
                <PinterestGrid
                  images={content.images.map((url, index) => ({
                    id: `preview-${index}`,
                    url,
                    alt: `Imagen ${index + 1} de ${content.title}`,
                  }))}
                />
              ) : (
                <p className="text-text-primary/60 font-bevietnam">
                  No hay imágenes cargadas
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
