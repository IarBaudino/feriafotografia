"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { HiSave, HiTrash, HiUpload } from "react-icons/hi";
import { motion } from "framer-motion";
import CustomQuillEditor from "@/components/Editor/CustomQuillEditor";
import AuthCheck from "@/components/Auth/AuthCheck";

interface AboutContent {
  id?: number;
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
        setContent({
          ...aboutData,
          images: imagesData?.map((img) => img.url) || [],
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

        return publicUrl;
      });

      const newImageUrls = await Promise.all(uploadPromises);
      setContent((prev) => ({
        ...prev,
        images: [...prev.images, ...newImageUrls],
      }));
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error subiendo imágenes:", error);
      alert("Error al subir las imágenes");
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageDelete = async (imageUrl: string) => {
    try {
      // Extraer el nombre del archivo de la URL
      const fileName = imageUrl.split("/").pop();
      if (fileName) {
        const { error: storageError } = await supabase.storage
          .from("images")
          .remove([`about/${fileName}`]);

        if (storageError) throw storageError;
      }

      // Eliminar de la base de datos
      const { error: dbError } = await supabase
        .from("images")
        .delete()
        .eq("url", imageUrl);

      if (dbError) throw dbError;

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
      if (!aboutId) {
        // Si no existe, crear el registro
        const { data: aboutData, error: aboutError } = await supabase
          .from("about")
          .insert({
            title: content.title,
            content: content.content,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (aboutError) throw aboutError;
        aboutId = aboutData.id;
      } else {
        const { error: aboutError } = await supabase.from("about").upsert({
          id: aboutId,
          title: content.title,
          content: content.content,
          updated_at: new Date().toISOString(),
        });
        if (aboutError) throw aboutError;
      }

      // Guardar imágenes en la base de datos
      if (aboutId) {
        for (const imageUrl of content.images) {
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
              alt: `Imagen de ${content.title}`,
              section: "about",
              section_id: aboutId,
            });
            if (imageError) throw imageError;
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

                  {/* Grid de imágenes */}
                  {content.images.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {content.images.map((imageUrl, index) => (
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
                      ))}
                    </div>
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
                <div className="grid grid-cols-2 gap-4">
                  {content.images.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={imageUrl}
                        alt={`Imagen ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
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
