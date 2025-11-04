"use client";
import { useState, useEffect } from "react";
import { HiSave } from "react-icons/hi";
import AuthCheck from "@/components/Auth/AuthCheck";
import {
  getCollection,
  getDocument,
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
    // Función de depuración para listar todas las convocatorias
    debugListAllCalls();
  }, []);

  // Función de depuración para ver todas las convocatorias
  const debugListAllCalls = async () => {
    try {
      const allCalls = await getCollection("calls");
      console.log("📋 TODAS LAS CONVOCATORIAS EN LA BASE DE DATOS:");
      console.log(`Total: ${allCalls.length}`);
      allCalls.forEach((call: any, index: number) => {
        console.log(`\n${index + 1}. ID: ${call.id}`);
        console.log(`   - Título: ${call.title || "Sin título"}`);
        console.log(`   - Activa: ${call.is_active}`);
        console.log(`   - Form Link: ${call.form_link || "Sin link"}`);
        console.log(
          `   - Updated: ${
            call.updated_at?.toDate
              ? call.updated_at.toDate().toISOString()
              : call.updated_at || "N/A"
          }`
        );
        console.log(
          `   - Created: ${
            call.created_at?.toDate
              ? call.created_at.toDate().toISOString()
              : call.created_at || "N/A"
          }`
        );
      });
    } catch (error) {
      console.error("Error al listar convocatorias:", error);
    }
  };

  const loadCallsContent = async (specificId?: string) => {
    try {
      let callData: any = null;

      // Si tenemos un ID específico (pasado como parámetro o del estado), cargar directamente esa convocatoria
      const idToLoad = specificId || content.id;
      if (idToLoad) {
        try {
          callData = await getDocument("calls", idToLoad);
        } catch (error) {
          console.warn(
            "No se pudo cargar la convocatoria por ID, buscando en toda la colección:",
            error
          );
        }
      }

      // Si no encontramos la convocatoria por ID, buscar en toda la colección
      if (!callData) {
        const data = await getCollection("calls");

        if (data && data.length > 0) {
          // En el admin, SIEMPRE cargar la más reciente por updated_at (sin importar si está activa)
          // Esto asegura que siempre editemos la convocatoria que acabamos de modificar
          const sortedCalls = data.sort((a: any, b: any) => {
            const dateA = a.updated_at?.toDate
              ? a.updated_at.toDate()
              : a.created_at?.toDate
              ? a.created_at.toDate()
              : new Date(a.created_at || 0);
            const dateB = b.updated_at?.toDate
              ? b.updated_at.toDate()
              : b.created_at?.toDate
              ? b.created_at.toDate()
              : new Date(b.created_at || 0);
            return dateB.getTime() - dateA.getTime();
          });

          // Tomar siempre la más reciente (la que se editó por última vez)
          callData = sortedCalls[0];
        }
      }

      if (callData) {
        setContent({
          id: callData.id,
          is_active:
            callData.is_active === true || callData.is_active === false
              ? Boolean(callData.is_active)
              : false,
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
      // Guardar el ID actual antes de actualizar
      const currentId = content.id;

      // Asegurar que is_active se guarde como booleano explícito
      const isActiveValue =
        content.is_active === true || content.is_active === false
          ? Boolean(content.is_active)
          : false;

      console.log("💾 Guardando convocatoria:", {
        id: currentId,
        is_active: isActiveValue,
        form_link: content.form_link,
        title: content.title,
      });

      const callsData = {
        is_active: isActiveValue,
        deadline: content.deadline ? new Date(content.deadline) : null,
        feria_date: content.feria_date ? new Date(content.feria_date) : null,
        location: content.location || null,
        form_link: content.form_link || "",
        title: content.title,
        description: content.description,
        horario: content.horario || null,
        updated_at: new Date(),
      };

      let savedId = currentId;

      if (currentId) {
        // Actualizar convocatoria existente
        console.log("📝 Actualizando convocatoria existente:", currentId);
        await updateDocument("calls", currentId, callsData);
        console.log("✅ Convocatoria actualizada");
      } else {
        // Crear nueva convocatoria
        console.log("➕ Creando nueva convocatoria");
        savedId = await addDocument("calls", {
          ...callsData,
          created_at: new Date(),
        });
        console.log("✅ Convocatoria creada con ID:", savedId);
        setContent({ ...content, id: savedId });
      }

      setHasUnsavedChanges(false);
      alert("Cambios guardados correctamente");

      // Recargar SOLO la convocatoria que acabamos de guardar usando su ID
      if (savedId) {
        console.log("🔄 Recargando convocatoria con ID:", savedId);
        await loadCallsContent(savedId);

        // Verificar que se cargó correctamente
        try {
          const reloadedData = await getDocument("calls", savedId);
          console.log("✅ Datos recargados de Firestore:", {
            id: reloadedData?.id,
            is_active: reloadedData?.is_active,
            form_link: reloadedData?.form_link,
            title: reloadedData?.title,
          });
        } catch (error) {
          console.error("⚠️ Error al verificar datos recargados:", error);
        }
      }
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
