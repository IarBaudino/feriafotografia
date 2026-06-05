"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { HiSave } from "react-icons/hi";
import AuthCheck from "@/components/Auth/AuthCheck";

interface CallsContent {
  id?: string;
  is_active: boolean;
  deadline: string;
  location: string;
  form_link: string;
  title: string;
  description: string;
  created_at?: string;
}

export default function CallsPage() {
  const [content, setContent] = useState<CallsContent>({
    id: undefined,
    is_active: true,
    deadline: "",
    location: "",
    form_link: "",
    title: "Convocatoria Abierta",
    description: "¡Participa en la próxima edición de la Feria de Fotografía!",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadCallsContent();
  }, []);

  const loadCallsContent = async () => {
    try {
      const { data, error } = await supabase.from("calls").select("*").single();

      if (error) throw error;
      if (data) {
        console.log("Datos cargados:", data);
        setContent({
          ...data,
          is_active: data.is_active || false,
        });
      }
    } catch (error) {
      console.error("Error cargando contenido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const dataToSave = {
        id: content.id,
        is_active: Boolean(content.is_active),
        deadline: content.deadline,
        location: content.location || null,
        form_link: content.form_link,
        title: content.title,
        description: content.description,
      };

      console.log("Estado actual:", content);
      console.log("Datos a guardar:", dataToSave);

      const { data, error } = await supabase
        .from("calls")
        .upsert(dataToSave)
        .select();

      if (error) throw error;
      console.log("Datos guardados:", data);

      setHasUnsavedChanges(false);
      alert("Cambios guardados correctamente");
    } catch (error) {
      console.error("Error guardando cambios:", error);
      alert("Error al guardar los cambios");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">Cargando...</div>
    );
  }

  return (
    <AuthCheck>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-bg-secondary font-bevietnam mb-6">
          Editar Convocatoria
        </h1>

        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Estado de la convocatoria */}
          <div className="mb-6">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={content.is_active}
                onChange={(e) => {
                  setContent({ ...content, is_active: e.target.checked });
                  setHasUnsavedChanges(true);
                }}
                className="form-checkbox h-5 w-5 text-accent-green"
              />
              <span className="text-sm font-medium">Convocatoria activa</span>
            </label>
          </div>

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
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
            />
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Descripción
            </label>
            <textarea
              value={content.description}
              onChange={(e) => {
                setContent({ ...content, description: e.target.value });
                setHasUnsavedChanges(true);
              }}
              rows={3}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
            />
          </div>

          {/* Fecha límite */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Fecha límite
            </label>
            <input
              type="date"
              value={content.deadline}
              onChange={(e) => {
                setContent({ ...content, deadline: e.target.value });
                setHasUnsavedChanges(true);
              }}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
            />
          </div>

          {/* Lugar */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Lugar</label>
            <input
              type="text"
              value={content.location}
              onChange={(e) => {
                setContent({ ...content, location: e.target.value });
                setHasUnsavedChanges(true);
              }}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
            />
          </div>

          {/* URL del formulario */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              URL del formulario
            </label>
            <input
              type="url"
              value={content.form_link}
              onChange={(e) => {
                setContent({ ...content, form_link: e.target.value });
                setHasUnsavedChanges(true);
              }}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
            />
          </div>
        </div>

        {/* Vista previa */}
        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-bold text-bg-secondary font-bevietnam mb-6">
            Vista previa
          </h2>
          <div className="bg-bg-secondary rounded-lg p-8">
            {content.is_active ? (
              <div className="bg-bg-primary rounded-lg p-8">
                <h3 className="text-2xl font-bevietnam font-bold mb-4 text-bg-secondary">
                  {content.title}
                </h3>
                <p className="text-text-primary font-bevietnam font-normal mb-6">
                  {content.description}
                </p>
                <div className="space-y-4">
                  <p className="font-bevietnam font-thin italic">
                    Fecha límite:{" "}
                    <span className="font-bevietnam italic">{content.deadline}</span>
                  </p>
                  <p className="font-bevietnam font-thin italic">
                    Lugar: <span className="text-thin">{content.location}</span>
                  </p>
                </div>
                <a
                  href={content.form_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-bg-secondary text-bg-primary px-6 py-3 rounded-lg 
                           hover:bg-accent-blue transition-colors duration-300 mt-6 font-bevietnam font-bold"
                >
                  Inscríbete aquí
                </a>
              </div>
            ) : (
              <div className="bg-bg-primary rounded-lg p-8">
                <p className="text-text-primary text-center text-lg font-bevietnam font-normal">
                  No hay convocatorias abiertas en este momento.
                  <br />
                  <span className="font-bevietnam italic">
                    ¡Mantente atento a nuestras redes sociales para futuras
                    convocatorias!
                  </span>
                </p>
              </div>
            )}
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
