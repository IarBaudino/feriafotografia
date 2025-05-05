"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminAgendaPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState([]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
      }
    };

    checkUser();
    // Aquí cargarías los eventos desde Supabase
  }, [router]);

  return (
    <main className="min-h-screen p-8 pt-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-bg-secondary">
          Gestión de Agenda
        </h1>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Volver al Dashboard
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <button className="bg-bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90 mb-4">
          Agregar Nuevo Evento
        </button>

        {/* Aquí irá la lista de eventos */}
        <div className="mt-4">
          <p>Lista de eventos (en desarrollo)</p>
        </div>
      </div>
    </main>
  );
}
