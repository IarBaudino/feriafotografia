"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";
import { HiUpload, HiTrash, HiSave } from "react-icons/hi";
import { motion } from "framer-motion";
import Quill from "quill";
import CustomQuillEditor from "@/components/Editor/CustomQuillEditor";
import AuthCheck from "@/components/Auth/AuthCheck";

// Editor de texto rico (Quill) cargado dinámicamente
const QuillEditor = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <div className="h-64 bg-gray-100 rounded animate-pulse" />,
});

import "react-quill/dist/quill.snow.css";

interface AboutContent {
  id?: number;
  title: string;
  content: string;
  images: string[];
}

// Configuración de Quill
const modules = {
  toolbar: {
    container: [
      [
        {
          font: [
            "bevietnam", // Nuestra fuente principal
            "joly", // Nuestra fuente decorativa
            "sans-serif",
            "serif",
            "monospace",
          ],
        },
      ],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image", "clean"],
    ],
  },
};

const formats = [
  "font",
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "list",
  "bullet",
  "align",
  "link",
  "image",
];

// Estilos personalizados para Quill
const quillStyles = {
  ".ql-editor": {
    fontFamily: "var(--font-bevietnam)",
  },
  ".ql-font-bevietnam": {
    fontFamily: "var(--font-bevietnam) !important",
  },
  ".ql-font-joly": {
    fontFamily: "var(--font-joly) !important",
  },
  ".ql-editor h1, .ql-editor h2, .ql-editor h3": {
    fontFamily: "var(--font-bevietnam)",
    color: "#1F2937",
  },
};

// Registrar los formatos personalizados de fuentes
const Font = Quill.import("formats/font");
Font.whitelist = ["bevietnam", "joly", "serif", "sans-serif", "monospace"];
Quill.register(Font, true);

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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

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
      const { data, error } = await supabase.from("about").select("*").single();

      if (error) throw error;
      if (data) {
        setContent(data);
        setPreviewUrls(data.images || []);
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
      setPreviewUrls((prev) => [...prev, publicUrl]);
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
      setPreviewUrls((prev) => prev.filter((img) => img !== url));

      await handleSave();
    } catch (error) {
      console.error("Error eliminando imagen:", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from("about").upsert({
        ...content,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error guardando cambios:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMultipleImageUpload = async (files: FileList) => {
    setIsSaving(true);
    setError(null);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) throw new Error("No autenticado");

      const uploadPromises = Array.from(files).map(async (file) => {
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

        const { error: dbError } = await supabase.from("images").insert({
          url: publicUrl,
          alt: file.name.split(".")[0],
          section: "about",
        });

        if (dbError) throw dbError;

        return publicUrl;
      });

      const newUrls = await Promise.all(uploadPromises);

      setContent((prev) => ({
        ...prev,
        images: [...prev.images, ...newUrls],
      }));
      setPreviewUrls((prev) => [...prev, ...newUrls]);

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
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-accent-green text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            <HiSave className="w-5 h-5" />
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Título */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={content.title}
              onChange={(e) =>
                setContent({ ...content, title: e.target.value })
              }
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none font-bevietnam"
            />
          </div>

          {/* Editor de contenido */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Contenido</label>
            <CustomQuillEditor
              value={content.content}
              onChange={(value) => setContent({ ...content, content: value })}
              className="h-64"
            />
          </div>

          {/* Gestor de imágenes */}
          <div>
            <label className="block text-sm font-medium mb-2">Imágenes</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              {previewUrls.map((url, index) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="relative group"
                >
                  <img
                    src={url}
                    alt={`Imagen ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleImageDelete(url)}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>

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
      </div>
    </AuthCheck>
  );
}
