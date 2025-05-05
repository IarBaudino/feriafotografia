"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import AuthCheck from "@/components/Auth/AuthCheck";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  image_url: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentMember, setCurrentMember] = useState<Partial<TeamMember>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    const { data, error } = await supabase.from("team").select("*");
    if (data) setMembers(data);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `team/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file);

    if (!uploadError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(filePath);

      setCurrentMember({ ...currentMember, image_url: publicUrl });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentMember.id) {
      // Update
      await supabase
        .from("team")
        .update(currentMember)
        .eq("id", currentMember.id);
    } else {
      // Insert
      await supabase.from("team").insert(currentMember);
    }

    loadTeamMembers();
    setIsEditing(false);
    setCurrentMember({});
  };

  return (
    <AuthCheck>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-bevietnam">
            Gestión del Equipo
          </h1>
          <button
            onClick={() => {
              setCurrentMember({});
              setIsEditing(true);
            }}
            className="bg-bg-secondary text-white px-4 py-2 rounded-lg"
          >
            Agregar Miembro
          </button>
        </div>

        {/* Lista de miembros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      await supabase.from("team").delete().eq("id", member.id);
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

        {/* Modal de edición */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {currentMember.id ? "Editar" : "Agregar"} Miembro
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Formulario aquí */}
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthCheck>
  );
}
