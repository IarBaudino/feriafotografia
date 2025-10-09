"use client";
import { useState, useEffect } from "react";
import { HiSave } from "react-icons/hi";
import AuthCheck from "@/components/Auth/AuthCheck";
import {
  getCollection,
  addDocument,
  updateDocument,
} from "@/lib/firestore-helpers";

interface CallsContent {
  id?: string;
  is_active: boolean;
  deadline: string;
  feria_date?: string;
  location: string;
  form_link: string;
  title: string;
  description: string;
  horario?: string;
  created_at?: string;
}

export default function CallsPage() {
  const [content, setContent] = useState<CallsContent>({
    id: undefined,
    is_active: true,
    deadline: "",
    feria_date: "",
    location: "",
    form_link: "",
    title: "Convocatoria Abierta",
    description: "¡Participa en la próxima edición de la Feria de Fotografía!",
    horario: "",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadCallsContent();
  }, []);

  const loadCallsContent = async () => {
    try {
      const data = await getCollection("calls");

      if (data && data.length > 0) {
        const callData = data[0] as any;
        setContent({
          id: callData.id,
          is_active: callData.is_active || false,
          deadline: callData.deadline?.toDate
            ? callData.deadline.toDate().toISOString().split("T")[0]
            : callData.deadline || "",
          feria_date: callData.feria_date?.toDate
            ? callData.feria_date.toDate().toISOString().split("T")[0]
            : callData.feria_date || "",
          location: callData.location || "",
          form_link: callData.form_link || "",
          title: callData.title || "Convocatoria Abierta",
          description: callData.description || "",
          horario: callData.horario || "",
        });
      }
    } catch (error) {
      console.error("❌ Error cargando contenido:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const callsData = {
        is_active: Boolean(content.is_active),
        deadline: content.deadline ? new Date(content.deadline) : null,
        feria_date: content.feria_date ? new Date(content.feria_date) : null,
        location: content.location || null,
        form_link: content.form_link || "",
        title: content.title,
        description: content.description,
        horario: content.horario || null,
        updated_at: new Date(),
      };

      if (content.id) {
        // Actualizar convocatoria existente
        await updateDocument("calls", content.id, callsData);
      } else {
        // Crear nueva convocatoria
        const newId = await addDocument("calls", {
          ...callsData,
          created_at: new Date(),
        });
        setContent({ ...content, id: newId });
      }

      setHasUnsavedChanges(false);
      alert("Cambios guardados correctamente");
      await loadCallsContent();
    } catch (error) {
      console.error("❌ Error guardando cambios:", error);
      alert(`Error al guardar los cambios: ${error}`);
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

          {/* Fecha límite de inscripción */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Fecha límite de inscripción
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

          {/* Fecha de la feria */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Fecha de la feria
            </label>
            <input
              type="date"
              value={content.feria_date}
              onChange={(e) => {
                setContent({ ...content, feria_date: e.target.value });
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

          {/* Horario */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Horario de la feria
            </label>
            <input
              type="text"
              value={content.horario}
              onChange={(e) => {
                setContent({ ...content, horario: e.target.value });
                setHasUnsavedChanges(true);
              }}
              placeholder="Ej: 10:00 - 18:00 hs"
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
                <div
                  className="text-text-primary font-bevietnam font-normal mb-6"
                  dangerouslySetInnerHTML={{
                    __html: content.description,
                  }}
                />
                <div className="space-y-4">
                  <p className="font-bevietnam font-thin italic">
                    Fecha límite de inscripción:{" "}
                    <span className="font-joly italic">{content.deadline}</span>
                  </p>
                  <p className="font-bevietnam font-thin italic">
                    Fecha de la feria:{" "}
                    <span className="font-joly italic">
                      {content.feria_date || "Por confirmar"}
                    </span>
                  </p>
                  <p className="font-bevietnam font-thin italic">
                    Lugar: <span className="text-thin">{content.location}</span>
                  </p>
                  <p className="font-bevietnam font-thin italic">
                    Horario:{" "}
                    <span className="font-joly italic">
                      {content.horario || "Por confirmar"}
                    </span>
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
                  La convocatoria está cerrada.
                </p>
                <p className="font-joly italic text-accent-blue mt-4 text-center">
                  ¡Te esperamos en la feria para disfrutar de todas las
                  actividades!
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
