"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import AuthCheck from "@/components/Auth/AuthCheck";
import { HiPlus, HiPencil, HiTrash, HiCheck } from "react-icons/hi2";

interface Event {
  id?: string;
  created_at?: string;
  type: string;
  date: string;
  end_date: string;
  location: string;
  description: string;
  short_description?: string;
  image_url?: string;
  organizer?: string;
  link?: string;
  category_name: string;
  instructor?: string; // Para talleres/workshops
  speaker?: string; // Para charlas/conferencias
}

interface Category {
  id: string;
  name: string;
}

export default function AdminAgendaPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
  });
  const [showPastEvents, setShowPastEvents] = useState(true);

  useEffect(() => {
    loadCategories();
    loadEvents();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("category_name")
        .not("category_name", "is", null);

      if (error) throw error;

      // Usar Array.from en lugar de spread operator con Set
      const uniqueCategories = Array.from(
        new Set(data.map((event) => event.category_name))
      );

      setCategories(
        uniqueCategories.map((name) => ({
          id: name,
          name: name,
        }))
      );
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error cargando eventos:", error);
    }
  };

  // Función para verificar si un evento ya pasó
  const isEventPast = (eventDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Resetear a inicio del día
    const eventDateObj = new Date(eventDate);
    return eventDateObj < today;
  };

  const handleCreate = () => {
    setCurrentEvent({
      type: "",
      date: new Date().toISOString().split("T")[0],
      end_date: "19:00",
      description: "",
      location: "",
      category_name: "",
      link: "",
    });
    setIsEditing(true);
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    if (!currentEvent) return;
    setIsSaving(true);

    try {
      const { id, created_at, ...eventData } = currentEvent; // Excluir id y created_at

      if (id) {
        // Actualizar evento existente
        const { error } = await supabase
          .from("events")
          .update(eventData)
          .eq("id", id);
        if (error) throw error;
      } else {
        // Crear nuevo evento
        const { error } = await supabase.from("events").insert([eventData]);
        if (error) throw error;
      }

      loadEvents();
      setIsEditing(false);
      setCurrentEvent(null);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error guardando evento:", error);
      alert("Error al guardar el evento");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este evento?")) return;

    try {
      const { error } = await supabase.from("events").delete().eq("id", id);

      if (error) throw error;
      loadEvents();
    } catch (error) {
      console.error("Error eliminando evento:", error);
      alert("Error al eliminar el evento");
    }
  };

  const handleSaveCategory = async () => {
    try {
      if (!newCategory.name) return;

      const categoryName = newCategory.name; // Asegurar que es string

      setCategories([...categories, { id: categoryName, name: categoryName }]);

      setCurrentEvent((prev) =>
        prev ? { ...prev, category_name: categoryName } : null
      );

      setIsNewCategory(false);
      setNewCategory({ name: "" });
    } catch (error) {
      console.error("Error creando categoría:", error);
      alert("Error al crear la categoría");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentEvent) return;

    try {
      // Crear un nombre único para el archivo
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      // Subir el archivo a Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from("images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener la URL pública
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      // Actualizar el evento con la URL de la imagen
      setCurrentEvent({
        ...currentEvent,
        image_url: publicUrl,
      });
      setHasUnsavedChanges(true);
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error al subir la imagen");
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-8 pt-8">
            <h1 className="text-3xl font-bevietnam font-bold text-bg-secondary">
              Administrar Agenda
            </h1>
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-accent-blue focus:outline-none"
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={showPastEvents}
                  onChange={(e) => setShowPastEvents(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">Mostrar eventos pasados</span>
              </label>
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-opacity-90"
              >
                <HiPlus className="w-5 h-5" />
                Nuevo Evento
              </button>
            </div>
          </div>

          {isEditing && currentEvent ? (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Título del Evento
                </label>
                <input
                  type="text"
                  value={currentEvent.type}
                  onChange={(e) => {
                    setCurrentEvent({
                      ...currentEvent,
                      type: e.target.value,
                    });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Categoría
                </label>
                <div className="flex gap-4 items-start">
                  {isNewCategory ? (
                    <div className="w-full space-y-4">
                      <input
                        type="text"
                        placeholder="Nombre de la categoría"
                        value={newCategory.name}
                        onChange={(e) =>
                          setNewCategory({
                            ...newCategory,
                            name: e.target.value,
                          })
                        }
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setIsNewCategory(false);
                            setNewCategory({ name: "" });
                          }}
                          className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveCategory}
                          disabled={!newCategory.name}
                          className="px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-opacity-90 disabled:bg-gray-200 disabled:text-gray-500"
                        >
                          Guardar Categoría
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <select
                        value={currentEvent.category_name}
                        onChange={(e) => {
                          setCurrentEvent({
                            ...currentEvent,
                            category_name: e.target.value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="flex-1 p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                      >
                        <option value="">Selecciona una categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setIsNewCategory(true)}
                        className="px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-opacity-90"
                      >
                        Nueva Categoría
                      </button>
                    </>
                  )}
                </div>
              </div>

              {currentEvent.category_name === "talleres" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Instructor
                  </label>
                  <input
                    type="text"
                    value={currentEvent.instructor || ""}
                    onChange={(e) => {
                      setCurrentEvent({
                        ...currentEvent,
                        instructor: e.target.value,
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                  />
                </div>
              )}

              {currentEvent.category_name === "charlas" && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Ponente
                  </label>
                  <input
                    type="text"
                    value={currentEvent.speaker || ""}
                    onChange={(e) => {
                      setCurrentEvent({
                        ...currentEvent,
                        speaker: e.target.value,
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={currentEvent.date}
                    onChange={(e) => {
                      setCurrentEvent({
                        ...currentEvent,
                        date: e.target.value,
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hora</label>
                  <input
                    type="time"
                    value={currentEvent.end_date}
                    onChange={(e) => {
                      setCurrentEvent({
                        ...currentEvent,
                        end_date: e.target.value,
                      });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={currentEvent.location}
                    onChange={(e) => {
                      setCurrentEvent({
                        ...currentEvent,
                        location: e.target.value,
                      });
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
                  value={currentEvent.description}
                  onChange={(e) => {
                    setCurrentEvent({
                      ...currentEvent,
                      description: e.target.value,
                    });
                    setHasUnsavedChanges(true);
                  }}
                  rows={4}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Link del Evento (opcional)
                </label>
                <input
                  type="url"
                  placeholder="https://ejemplo.com/evento"
                  value={currentEvent.link || ""}
                  onChange={(e) => {
                    setCurrentEvent({
                      ...currentEvent,
                      link: e.target.value,
                    });
                    setHasUnsavedChanges(true);
                  }}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Si no hay link, no se mostrará en la vista pública
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Imagen del Evento
                </label>
                <div className="flex items-center gap-4">
                  {currentEvent.image_url ? (
                    <div className="relative w-32 h-32">
                      <img
                        src={currentEvent.image_url}
                        alt={currentEvent.type}
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setCurrentEvent({
                            ...currentEvent,
                            image_url: "",
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer text-center p-4"
                      >
                        <HiPlus className="w-8 h-8 mx-auto text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Subir imagen
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 border-t pt-8">
                <h2 className="text-xl font-bold text-bg-secondary font-bevietnam mb-6">
                  Vista previa
                </h2>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="aspect-[4/3] overflow-hidden rounded-lg mb-6">
                    {currentEvent.image_url && (
                      <img
                        src={currentEvent.image_url}
                        alt={currentEvent.type}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="max-w-3xl">
                    <h3 className="text-2xl font-bold text-bg-secondary mb-4">
                      {currentEvent.type}
                    </h3>
                    <div className="flex gap-4 text-accent-blue mb-4">
                      <p>{new Date(currentEvent.date).toLocaleDateString()}</p>
                      <p>{currentEvent.end_date}</p>
                      <p>{currentEvent.location}</p>
                    </div>
                    {currentEvent.instructor && (
                      <p className="text-accent-green mb-2">
                        Instructor: {currentEvent.instructor}
                      </p>
                    )}
                    {currentEvent.speaker && (
                      <p className="text-accent-green mb-2">
                        Ponente: {currentEvent.speaker}
                      </p>
                    )}
                    <p className="text-gray-600">{currentEvent.description}</p>
                    {currentEvent.link && (
                      <div className="mt-4">
                        <a
                          href={currentEvent.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 font-medium"
                        >
                          Link del evento
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-8">
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
                  <HiCheck className="w-5 h-5" />
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events
                .filter((event) => {
                  const isPast = isEventPast(event.date);
                  return showPastEvents || !isPast;
                })
                .map((event) => {
                  const isPast = isEventPast(event.date);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`bg-white rounded-xl overflow-hidden shadow-lg ${
                        isPast ? "opacity-60" : ""
                      }`}
                    >
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-bold text-bg-secondary font-bevietnam">
                            {event.type}
                          </h3>
                          {isPast && (
                            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
                              Pasado
                            </span>
                          )}
                        </div>
                        <div className="flex gap-4 text-accent-blue text-sm mb-4">
                          <p>{new Date(event.date).toLocaleDateString()}</p>
                          <p>{event.end_date}</p>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {event.location}
                        </p>
                        <p className="text-sm text-text-primary/80 mb-4 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setCurrentEvent(event);
                              setIsEditing(true);
                            }}
                            className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                          >
                            <HiPencil className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(event.id || "")}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <HiTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </AuthCheck>
  );
}
