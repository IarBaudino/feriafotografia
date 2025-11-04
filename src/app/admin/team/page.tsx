"use client";
export const dynamic = 'force-dynamic';
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AuthCheck from "@/components/Auth/AuthCheck";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import {
  getCollection,
  addDocument,
  updateDocument,
  deleteDocument,
} from "@/lib/firestore-helpers";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  image_url: string;
  instagram?: string;
  website?: string;
  is_video?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      const data = await getCollection("team_members");

      if (data) {
        setMembers(data as TeamMember[]);
      }
    } catch (error) {
      console.error("Error cargando miembros:", error);
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("files", file);
      formData.append("folder", "feriafotografia/team");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success && data.urls && data.urls[0]) {
        setCurrentMember({ ...currentMember, image_url: data.urls[0] });
        setHasUnsavedChanges(true);
        alert("Imagen subida correctamente");
      } else {
        throw new Error(data.error || "Error desconocido");
      }
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error al subir la imagen");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (
        !currentMember.name ||
        !currentMember.role ||
        !currentMember.image_url
      ) {
        alert("Por favor completa los campos requeridos");
        return;
      }

      const memberData = {
        name: currentMember.name,
        role: currentMember.role,
        image_url: currentMember.image_url,
        instagram: currentMember.instagram || null,
        website: currentMember.website || null,
        is_video: currentMember.is_video || false,
      };

      if (currentMember.id) {
        // Actualizar miembro existente
        await updateDocument("team_members", currentMember.id, memberData);
        alert("Miembro actualizado correctamente");
      } else {
        // Crear nuevo miembro
        await addDocument("team_members", {
          ...memberData,
          created_at: new Date(),
        });
        alert("Miembro agregado correctamente");
      }

      await loadTeamMembers();
      setIsEditing(false);
      setCurrentMember({});
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error guardando miembro:", error);
      alert("Error al guardar el miembro");
    }
  };

  const handleCreate = () => {
    setCurrentMember({});
    setIsEditing(true);
    setHasUnsavedChanges(false);
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (
        !confirm(
          "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir sin guardar?"
        )
      ) {
        return;
      }
    }

    setCurrentMember({});
    setIsEditing(false);
    setHasUnsavedChanges(false);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-6 py-8">
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-8 pt-8">
            <h1 className="text-3xl font-bevietnam font-bold text-bg-secondary">
              {isEditing
                ? currentMember?.id
                  ? `Editar: ${currentMember.name || "Miembro"}`
                  : "Nuevo Miembro"
                : "Administrar Equipo"}
            </h1>
            {isEditing ? (
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver a la Lista
              </button>
            ) : (
              <button
                onClick={handleCreate}
                className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-opacity-90"
              >
                <HiPlus className="w-5 h-5" />
                Nuevo Miembro
              </button>
            )}
          </div>

          {/* Contenido principal */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            {isEditing && currentMember ? (
              // Formulario de edición
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-bg-secondary font-bevietnam mb-6">
                  {currentMember.id ? "Editar Miembro" : "Nuevo Miembro"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Imagen */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Foto
                    </label>
                    {currentMember.image_url && (
                      <img
                        src={currentMember.image_url}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg mb-2"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full"
                    />
                  </div>

                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Nombre
                    </label>
                    <input
                      type="text"
                      value={currentMember.name || ""}
                      onChange={(e) => {
                        setCurrentMember({
                          ...currentMember,
                          name: e.target.value,
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                      required
                    />
                  </div>

                  {/* Rol */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Rol
                    </label>
                    <input
                      type="text"
                      value={currentMember.role || ""}
                      onChange={(e) => {
                        setCurrentMember({
                          ...currentMember,
                          role: e.target.value,
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                      required
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Instagram (opcional)
                    </label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">@</span>
                      <input
                        type="text"
                        value={currentMember.instagram || ""}
                        onChange={(e) => {
                          setCurrentMember({
                            ...currentMember,
                            instagram: e.target.value,
                          });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sitio Web (opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://ejemplo.com o www.ejemplo.com"
                      value={currentMember.website || ""}
                      onChange={(e) => {
                        let website = e.target.value;

                        // Si el usuario ingresa una URL sin protocolo, agregar https://
                        if (
                          website &&
                          !website.startsWith("http://") &&
                          !website.startsWith("https://")
                        ) {
                          if (website.startsWith("www.")) {
                            website = "https://" + website;
                          } else if (
                            website.includes(".") &&
                            !website.startsWith("http")
                          ) {
                            website = "https://" + website;
                          }
                        }

                        setCurrentMember({
                          ...currentMember,
                          website: website,
                        });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-blue focus:outline-none"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Puedes ingresar con o sin https:// (se agregará
                      automáticamente)
                    </p>
                  </div>

                  {/* Botones */}
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Cancelar y Volver
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 bg-accent-green text-white rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                      {currentMember.id ? "Guardar Cambios" : "Agregar Miembro"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Grid de miembros
              <div>
                {isLoading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
                  </div>
                ) : members.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No hay miembros del equipo todavía.
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Haz clic en "Nuevo Miembro" para agregar uno.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {members.map((member) => (
                      <motion.div
                        key={member.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg shadow-md p-4"
                      >
                        <img
                          src={member.image_url}
                          alt={member.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="text-gray-600">{member.role}</p>
                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => {
                              setCurrentMember(member);
                              setIsEditing(true);
                              setHasUnsavedChanges(false);
                            }}
                            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <HiPencil className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={async () => {
                              if (
                                confirm(
                                  `¿Estás seguro de que quieres eliminar a ${member.name}?`
                                )
                              ) {
                                try {
                                  await deleteDocument(
                                    "team_members",
                                    member.id
                                  );
                                  alert("Miembro eliminado correctamente");
                                  await loadTeamMembers();
                                } catch (error) {
                                  console.error(
                                    "Error eliminando miembro:",
                                    error
                                  );
                                  alert("Error al eliminar el miembro");
                                }
                              }
                            }}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <HiTrash className="w-4 h-4" />
                            Eliminar
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
