"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { HiSave, HiPlus, HiTrash, HiPencil } from "react-icons/hi";
import AuthCheck from "@/components/Auth/AuthCheck";
import {
  getCollection,
  getDocument,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firestore-helpers";
import { Program, ProgramDay, ProgramActivity, PROGRAM_CATEGORIES } from "@/lib/program-types";

interface Edicion {
  id: string;
  title: string;
  date: string;
  location: string;
}

export default function ProgramaPage() {
  const [ediciones, setEdiciones] = useState<Edicion[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [currentProgram, setCurrentProgram] = useState<Program | null>(null);
  const [selectedEditionId, setSelectedEditionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [edicionesData, programsData] = await Promise.all([
        getCollection("editions"),
        getCollection("programs"),
      ]);

      // Ordenar ediciones por fecha descendente y convertir fechas
      const sortedEdiciones = edicionesData
        .sort((a: any, b: any) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB.getTime() - dateA.getTime();
        })
        .map((edicion: any) => ({
          ...edicion,
          date: edicion.date?.toDate
            ? edicion.date.toDate().toISOString().split("T")[0]
            : edicion.date instanceof Date
            ? edicion.date.toISOString().split("T")[0]
            : typeof edicion.date === "string"
            ? edicion.date.split("T")[0]
            : edicion.date,
        }));

      setEdiciones(sortedEdiciones);
      setPrograms(programsData);

      // Si hay programas, cargar el más reciente
      if (programsData.length > 0) {
        // Ordenar programas por fecha de actualización
        const sortedPrograms = programsData.sort((a: any, b: any) => {
          const dateA = a.updated_at?.toDate
            ? a.updated_at.toDate()
            : a.created_at?.toDate
            ? a.created_at.toDate()
            : new Date(0);
          const dateB = b.updated_at?.toDate
            ? b.updated_at.toDate()
            : b.created_at?.toDate
            ? b.created_at.toDate()
            : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        const latestProgram = sortedPrograms[0];
        // Convertir fechas de Firestore Timestamps a Date
        const processedProgram: Program = {
          ...latestProgram,
          days: (latestProgram as any).days?.map((day: any) => ({
            ...day,
            date: day.date?.toDate
              ? day.date.toDate()
              : day.date instanceof Date
              ? day.date
              : day.date
              ? new Date(day.date)
              : null,
          })) || [],
        } as Program;
        setCurrentProgram(processedProgram);
        setSelectedEditionId((latestProgram as Program).edition_id || "");
      }
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditionChange = async (editionId: string) => {
    setSelectedEditionId(editionId);
    
    // Buscar si ya existe un programa para esta edición
    const existingProgram = programs.find((p) => p.edition_id === editionId);
    
    if (editionId) {
      if (existingProgram) {
        // Cargar programa existente
        const fullProgram = await getDocument("programs", existingProgram.id!);
        // Convertir fechas de Firestore Timestamps a Date
        const processedProgram: Program = {
          ...fullProgram,
          days: (fullProgram as any).days?.map((day: any) => ({
            ...day,
            date: day.date?.toDate
              ? day.date.toDate()
              : day.date instanceof Date
              ? day.date
              : day.date
              ? new Date(day.date)
              : null,
          })) || [],
        } as Program;
        setCurrentProgram(processedProgram);
      } else {
        // Crear nuevo programa basado en la edición
        const edition = ediciones.find((e) => e.id === editionId);
        if (edition) {
          const newProgram: Program = {
            edition_id: editionId,
            title: edition.title,
            date_range: "",
            location: edition.location,
            note: "",
            days: [],
          };
          setCurrentProgram(newProgram);
        }
      }
      setHasUnsavedChanges(true);
    }
  };

  const handleAddDay = () => {
    if (!currentProgram) return;
    
    const dayNumber = currentProgram.days.length + 1;
    const newDay: ProgramDay = {
      day_number: dayNumber,
      date: new Date(),
      date_label: "",
      activities: [],
    };
    
    setCurrentProgram({
      ...currentProgram,
      days: [...currentProgram.days, newDay],
    });
    setHasUnsavedChanges(true);
  };

  const handleDeleteDay = (dayIndex: number) => {
    if (!currentProgram) return;
    
    const updatedDays = currentProgram.days.filter((_, index) => index !== dayIndex);
    // Renumerar días
    const renumberedDays = updatedDays.map((day, index) => ({
      ...day,
      day_number: index + 1,
    }));
    
    setCurrentProgram({
      ...currentProgram,
      days: renumberedDays,
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateDay = (dayIndex: number, field: keyof ProgramDay, value: any) => {
    if (!currentProgram) return;
    
    const updatedDays = [...currentProgram.days];
    updatedDays[dayIndex] = {
      ...updatedDays[dayIndex],
      [field]: value,
    };
    
    setCurrentProgram({
      ...currentProgram,
      days: updatedDays,
    });
    setHasUnsavedChanges(true);
  };

  const handleAddActivity = (dayIndex: number) => {
    if (!currentProgram) return;
    
    const newActivity: ProgramActivity = {
      category: "OTROS",
      time: "",
      title: "",
      description: "",
      location: "",
      link: "",
      coordinator: "",
    };
    
    const updatedDays = [...currentProgram.days];
    updatedDays[dayIndex].activities.push(newActivity);
    
    setCurrentProgram({
      ...currentProgram,
      days: updatedDays,
    });
    setHasUnsavedChanges(true);
  };

  const handleDeleteActivity = (dayIndex: number, activityIndex: number) => {
    if (!currentProgram) return;
    
    const updatedDays = [...currentProgram.days];
    updatedDays[dayIndex].activities = updatedDays[dayIndex].activities.filter(
      (_, index) => index !== activityIndex
    );
    
    setCurrentProgram({
      ...currentProgram,
      days: updatedDays,
    });
    setHasUnsavedChanges(true);
  };

  const handleUpdateActivity = (
    dayIndex: number,
    activityIndex: number,
    field: keyof ProgramActivity,
    value: any
  ) => {
    if (!currentProgram) return;
    
    const updatedDays = [...currentProgram.days];
    updatedDays[dayIndex].activities[activityIndex] = {
      ...updatedDays[dayIndex].activities[activityIndex],
      [field]: value,
    };
    
    setCurrentProgram({
      ...currentProgram,
      days: updatedDays,
    });
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!currentProgram) {
      alert("Por favor crea un programa primero");
      return;
    }

    if (!currentProgram.title || !currentProgram.date_range || !currentProgram.location) {
      alert("Por favor completa al menos el título, rango de fechas y lugar");
      return;
    }

    setIsSaving(true);
    try {
      const programData = {
        edition_id: selectedEditionId || "",
        title: currentProgram.title,
        date_range: currentProgram.date_range,
        location: currentProgram.location,
        note: currentProgram.note || "",
        days: currentProgram.days.map((day) => ({
          ...day,
          date:
            day.date instanceof Date || day.date === null
              ? day.date
              : day.date
              ? new Date(day.date)
              : null,
        })),
        updated_at: new Date(),
      };

      if (currentProgram.id) {
        // Actualizar programa existente
        await updateDocument("programs", currentProgram.id, programData);
      } else {
        // Crear nuevo programa
        const newId = await addDocument("programs", {
          ...programData,
          created_at: new Date(),
        });
        setCurrentProgram({ ...currentProgram, id: newId });
      }

      setHasUnsavedChanges(false);
      alert("Programa guardado correctamente");
      await loadData();
    } catch (error) {
      console.error("Error guardando programa:", error);
      alert(`Error al guardar: ${error}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!currentProgram?.id) {
      alert("No hay un programa guardado para eliminar.");
      return;
    }

    const confirmDelete = window.confirm(
      "¿Seguro que deseas eliminar esta programación? Esta acción no se puede deshacer."
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await deleteDocument("programs", currentProgram.id);
      alert("Programación eliminada correctamente");
      setCurrentProgram(null);
      setSelectedEditionId("");
      setHasUnsavedChanges(false);
      await loadData();
    } catch (error) {
      console.error("Error eliminando programa:", error);
      alert(`Error al eliminar la programación: ${error}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDateForLabel = (date: Date | string): string => {
    const d = date instanceof Date ? date : new Date(date);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                   'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`;
  };

  if (isLoading) {
    return (
      <AuthCheck>
        <div className="flex justify-center items-center h-64">Cargando...</div>
      </AuthCheck>
    );
  }

  return (
    <AuthCheck>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-bg-secondary font-bevietnam mb-6">
          Gestión de Programación
        </h1>

        {/* Selector de Edición o Crear Nuevo */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium mb-2">
            Seleccionar Edición (Opcional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Si la edición aún no existe, puedes crear el programa manualmente sin seleccionar una edición.
          </p>
          <select
            value={selectedEditionId}
            onChange={(e) => handleEditionChange(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none mb-3"
          >
            <option value="">-- Crear programa nuevo (sin edición) --</option>
            {ediciones.map((edicion) => (
              <option key={edicion.id} value={edicion.id}>
                {edicion.title} - {edicion.date}
              </option>
            ))}
          </select>
          
          {!selectedEditionId && (
            <button
              onClick={() => {
                // Crear nuevo programa vacío
                const newProgram: Program = {
                  edition_id: "",
                  title: "",
                  date_range: "",
                  location: "",
                  note: "",
                  days: [],
                };
                setCurrentProgram(newProgram);
                setHasUnsavedChanges(true);
              }}
              className="w-full px-4 py-2 bg-accent-green text-white rounded hover:bg-opacity-90"
            >
              Crear Programa Nuevo
            </button>
          )}
        </div>

        {currentProgram && (
          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-bg-secondary font-bevietnam mb-4">
                Información General
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <input
                    type="text"
                    value={currentProgram.title}
                    onChange={(e) =>
                      setCurrentProgram({ ...currentProgram, title: e.target.value })
                    }
                    onBlur={() => setHasUnsavedChanges(true)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Rango de Fechas
                  </label>
                  <input
                    type="text"
                    value={currentProgram.date_range}
                    onChange={(e) =>
                      setCurrentProgram({ ...currentProgram, date_range: e.target.value })
                    }
                    onBlur={() => setHasUnsavedChanges(true)}
                    placeholder="Ej: 7 y 8 de noviembre de 2025"
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Lugar</label>
                  <input
                    type="text"
                    value={currentProgram.location}
                    onChange={(e) =>
                      setCurrentProgram({ ...currentProgram, location: e.target.value })
                    }
                    onBlur={() => setHasUnsavedChanges(true)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nota</label>
                  <textarea
                    value={currentProgram.note || ""}
                    onChange={(e) =>
                      setCurrentProgram({ ...currentProgram, note: e.target.value })
                    }
                    onBlur={() => setHasUnsavedChanges(true)}
                    placeholder="Ej: Todas las charlas, exposiciones y la feria editorial son gratuitas."
                    rows={2}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Días y Actividades */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-bg-secondary font-bevietnam">
                  Días y Actividades
                </h2>
                <button
                  onClick={handleAddDay}
                  className="flex items-center gap-2 px-4 py-2 bg-accent-green text-white rounded hover:bg-opacity-90"
                >
                  <HiPlus className="w-5 h-5" />
                  Agregar Día
                </button>
              </div>

              {currentProgram.days.map((day, dayIndex) => (
                <div key={dayIndex} className="border rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Fecha del Día {day.day_number}
                        </label>
                        <input
                          type="date"
                          value={
                            day.date instanceof Date
                              ? day.date.toISOString().split("T")[0]
                              : typeof day.date === "string" && day.date
                              ? day.date.split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const newDate = new Date(e.target.value);
                            handleUpdateDay(dayIndex, "date", newDate);
                            handleUpdateDay(dayIndex, "date_label", formatDateForLabel(newDate));
                          }}
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Etiqueta de Fecha
                        </label>
                        <input
                          type="text"
                          value={day.date_label}
                          onChange={(e) =>
                            handleUpdateDay(dayIndex, "date_label", e.target.value)
                          }
                          placeholder="Ej: Viernes 7 de noviembre"
                          className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteDay(dayIndex)}
                      className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <HiTrash className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Actividades del día */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-bg-secondary">
                        Actividades del Día {day.day_number}
                      </h3>
                      <button
                        onClick={() => handleAddActivity(dayIndex)}
                        className="flex items-center gap-1 px-3 py-1 bg-accent-blue text-white rounded text-sm hover:bg-opacity-90"
                      >
                        <HiPlus className="w-4 h-4" />
                        Agregar Actividad
                      </button>
                    </div>

                    {day.activities.map((activity, activityIndex) => (
                      <div
                        key={activityIndex}
                        className="bg-gray-50 rounded p-4 border border-gray-200"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Categoría
                            </label>
                            <select
                              value={
                                PROGRAM_CATEGORIES.includes(
                                  (activity.category || "") as any
                                )
                                  ? activity.category || ""
                                  : ""
                              }
                              onChange={(e) =>
                                handleUpdateActivity(
                                  dayIndex,
                                  activityIndex,
                                  "category",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-accent-blue focus:outline-none mb-2"
                            >
                              <option value="">-- Selecciona una categoría --</option>
                              {PROGRAM_CATEGORIES.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                            <label className="block text-xs font-medium mb-1">
                              O escribe una nueva categoría
                            </label>
                            <input
                              type="text"
                              value={activity.category || ""}
                              onChange={(e) =>
                                handleUpdateActivity(
                                  dayIndex,
                                  activityIndex,
                                  "category",
                                  e.target.value
                                )
                              }
                              placeholder="Ej: Mesa redonda"
                              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-accent-blue focus:outline-none"
                            />
                            <p className="text-[11px] text-gray-500 mt-1">
                              Puedes elegir una categoría sugerida o escribir una personalizada.
                            </p>
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Hora</label>
                            <input
                              type="text"
                              value={activity.time}
                              onChange={(e) =>
                                handleUpdateActivity(
                                  dayIndex,
                                  activityIndex,
                                  "time",
                                  e.target.value
                                )
                              }
                              placeholder="Ej: 15:00"
                              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-accent-blue focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-medium mb-1">Título</label>
                          <input
                            type="text"
                            value={activity.title}
                            onChange={(e) =>
                              handleUpdateActivity(
                                dayIndex,
                                activityIndex,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Ej: Conversatorio Intercarreras de Fotografía Regionales"
                            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-accent-blue focus:outline-none"
                          />
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-medium mb-1">
                            Descripción (opcional)
                          </label>
                          <textarea
                            value={activity.description || ""}
                            onChange={(e) =>
                              handleUpdateActivity(
                                dayIndex,
                                activityIndex,
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Ej: Participan Cátedra de Fotografía UNLP, IMDAFTA y CEPEAC 1 de La Plata."
                            rows={2}
                            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-accent-blue focus:outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Ubicación (opcional)
                            </label>
                            <input
                              type="text"
                              value={activity.location || ""}
                              onChange={(e) =>
                                handleUpdateActivity(
                                  dayIndex,
                                  activityIndex,
                                  "location",
                                  e.target.value
                                )
                              }
                              placeholder="Ej: 📍 Centro de Arte UNLP, Auditorio"
                              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-accent-blue focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">
                              Coordinador/a (opcional)
                            </label>
                            <input
                              type="text"
                              value={activity.coordinator || ""}
                              onChange={(e) =>
                                handleUpdateActivity(
                                  dayIndex,
                                  activityIndex,
                                  "coordinator",
                                  e.target.value
                                )
                              }
                              placeholder="Ej: Luciana Demichelis"
                              className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-accent-blue focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium mb-1">
                            Link a Formulario (opcional)
                          </label>
                          <input
                            type="url"
                            value={activity.link || ""}
                            onChange={(e) =>
                              handleUpdateActivity(
                                dayIndex,
                                activityIndex,
                                "link",
                                e.target.value
                              )
                            }
                            placeholder="https://forms.gle/..."
                            className="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-accent-blue focus:outline-none"
                          />
                        </div>

                        <button
                          onClick={() => handleDeleteActivity(dayIndex, activityIndex)}
                          className="mt-2 flex items-center gap-1 text-red-500 text-sm hover:text-red-700"
                        >
                          <HiTrash className="w-4 h-4" />
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {currentProgram.days.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No hay días agregados. Haz clic en "Agregar Día" para comenzar.
                </p>
              )}
            </div>

            {/* Botones de acciones */}
            <div className="flex flex-wrap justify-end gap-3">
              {currentProgram?.id && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 px-5 py-3 rounded-md border border-red-200 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <HiTrash className="w-5 h-5" />
                  {isDeleting ? "Eliminando..." : "Eliminar Programación"}
                </button>
              )}
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
                {isSaving ? "Guardando..." : "Guardar Programa"}
              </button>
            </div>
          </div>
        )}

        {!currentProgram && selectedEditionId && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
            <p className="text-yellow-800">
              No se encontró programa para esta edición. Se creará uno nuevo al guardar.
            </p>
          </div>
        )}
      </div>
    </AuthCheck>
  );
}

