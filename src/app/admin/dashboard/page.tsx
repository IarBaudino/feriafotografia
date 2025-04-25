"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <main className="min-h-screen p-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-bg-secondary">Dashboard Admin</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Contenido About</h2>
          <button className="bg-bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90">
            Editar About
          </button>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Agenda Cultural</h2>
          <button className="bg-bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90">
            Gestionar Eventos
          </button>
        </div>
      </div>
    </main>
  );
} 