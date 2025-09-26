"use client";
import { useState, useEffect } from "react";
// Autenticación simplificada - sin Supabase
import { motion } from "framer-motion";
import AuthCheck from "@/components/Auth/AuthCheck";
import { HiPlus } from "react-icons/hi2";

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

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      setIsLoading(true);
      console.log("Cargando miembros del equipo...");
      const { data, error } = await // Firebase: getCollection("team_members").select("*");

      console.log("Datos recibidos:", data);
      console.log("Error:", error);

      if (error) throw error;
      setMembers(data || []);
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

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `team/${fileName}`;

    const { error: uploadError } = await // Cloudinary: TODO implementar
      .from("images")
      .upload(filePath, file);

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = // Cloudinary: TODO implementar.from("images").getPublicUrl(filePath);

      setCurrentMember({ ...currentMember, image_url: publicUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Intentando guardar:", currentMember);

      if (
        !currentMember.name ||
        !currentMember.role ||
        !currentMember.image_url
      ) {
        alert("Por favor completa los campos requeridos");
        return;
      }

      if (currentMember.id) {
        // Update
        const { data, error } = await supabase
          .from("team_members")
          .update(currentMember)
          .eq("id", currentMember.id)
          .select();

        if (error) throw error;
        console.log("Miembro actualizado:", data);
      } else {
        // Insert
        const { data, error } = await supabase
          .from("team_members")
          .insert(currentMember)
          .select();

        if (error) throw error;
        console.log("Nuevo miembro agregado:", data);
      }

      loadTeamMembers();
      setIsEditing(false);
      setCurrentMember({});
    } catch (error) {
      console.error("Error guardando miembro:", error);
      alert("Error al guardar el miembro");
    }
  };

  const handleCreate = () => {
    setCurrentMember({});
    setIsEditing(true);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen bg-bg-primary">
        <div className="container mx-auto px-6 py-8">
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-8 pt-8">
            <h1 className="text-3xl font-bevietnam font-bold text-bg-secondary">
              Administrar Equipo
            </h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-opacity-90"
            >
              <HiPlus className="w-5 h-5" />
              Nuevo Miembro
            </button>
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
                      onChange={(e) =>
                        setCurrentMember({
                          ...currentMember,
                          name: e.target.value,
                        })
                      }
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
                      onChange={(e) =>
                        setCurrentMember({
                          ...currentMember,
                          role: e.target.value,
                        })
                      }
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
                        onChange={(e) =>
                          setCurrentMember({
                            ...currentMember,
                            instagram: e.target.value,
                          })
                        }
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
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-accent-green text-white rounded-lg hover:bg-opacity-90"
                    >
                      {currentMember.id ? "Guardar Cambios" : "Agregar Miembro"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              // Grid de miembros
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
                        }}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Editar
                      </button>
                      <button
                        onClick={async () => {
                          if (confirm("¿Estás seguro?")) {
                            await supabase
                              .from("team_members")
                              .delete()
                              .eq("id", member.id);
                            loadTeamMembers();
                          }
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthCheck>
  );
}
