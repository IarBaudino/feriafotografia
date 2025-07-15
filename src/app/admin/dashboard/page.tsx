"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import {
  HiUsers,
  HiClock,
  HiCalendar,
  HiChartBar,
  HiPhotograph,
  HiDocumentText,
  HiUserGroup,
} from "react-icons/hi";

interface Stats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  totalExhibitions: number;
  totalEditions: number;
  totalTeamMembers: number;
  totalEvents: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    totalExhibitions: 0,
    totalEditions: 0,
    totalTeamMembers: 0,
    totalEvents: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      // Cargar estadísticas de contenido
      const [exhibitionsResult, editionsResult, teamResult, eventsResult] =
        await Promise.all([
          supabase.from("exhibitions").select("*", { count: "exact" }),
          supabase.from("editions").select("*", { count: "exact" }),
          supabase.from("team_members").select("*", { count: "exact" }),
          supabase.from("events").select("*", { count: "exact" }),
        ]);

      // Aquí podrías cargar visitas reales de la tabla page_views
      // Pero si no hay datos, los contadores quedarán en cero
      setStats({
        daily: 0, // Siempre cero hasta que haya datos reales
        weekly: 0,
        monthly: 0,
        yearly: 0,
        totalExhibitions: exhibitionsResult.count || 0,
        totalEditions: editionsResult.count || 0,
        totalTeamMembers: teamResult.count || 0,
        totalEvents: eventsResult.count || 0,
      });
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Visitas Hoy",
      value: stats.daily,
      icon: HiUsers,
      color: "bg-bg-secondary",
      description: "Visitas estimadas hoy",
    },
    {
      title: "Esta Semana",
      value: stats.weekly,
      icon: HiClock,
      color: "bg-accent-green",
      description: "Visitas estimadas esta semana",
    },
    {
      title: "Este Mes",
      value: stats.monthly,
      icon: HiCalendar,
      color: "bg-accent-blue",
      description: "Visitas estimadas este mes",
    },
    {
      title: "Este Año",
      value: stats.yearly,
      icon: HiChartBar,
      color: "bg-text-primary",
      description: "Visitas estimadas este año",
    },
  ];

  const contentCards = [
    {
      title: "Exposiciones",
      value: stats.totalExhibitions,
      icon: HiPhotograph,
      color: "bg-purple-500",
      description: "Exposiciones activas",
    },
    {
      title: "Ediciones",
      value: stats.totalEditions,
      icon: HiDocumentText,
      color: "bg-orange-500",
      description: "Ediciones registradas",
    },
    {
      title: "Miembros del Equipo",
      value: stats.totalTeamMembers,
      icon: HiUserGroup,
      color: "bg-pink-500",
      description: "Integrantes del equipo",
    },
    {
      title: "Eventos",
      value: stats.totalEvents,
      icon: HiCalendar,
      color: "bg-indigo-500",
      description: "Eventos programados",
    },
  ];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-bg-secondary font-bevietnam mb-6">
          Panel de Control
        </h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-bg-secondary font-bevietnam mb-6">
        Panel de Control
      </h1>

      {/* Estadísticas de Visitas */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-bg-secondary mb-4 font-bevietnam">
          Estadísticas de Visitas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${card.color} p-4 rounded-lg shadow-sm text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80 font-bevietnam">
                    {card.title}
                  </p>
                  <h2 className="text-xl font-bold mt-1 font-bevietnam">
                    {card.value.toLocaleString()}
                  </h2>
                  <p className="text-xs opacity-70 mt-1">{card.description}</p>
                </div>
                <card.icon className="w-6 h-6 opacity-80" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Estadísticas de Contenido */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-bg-secondary mb-4 font-bevietnam">
          Contenido del Sitio
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {contentCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 4) * 0.1 }}
              className={`${card.color} p-4 rounded-lg shadow-sm text-white`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80 font-bevietnam">
                    {card.title}
                  </p>
                  <h2 className="text-xl font-bold mt-1 font-bevietnam">
                    {card.value}
                  </h2>
                  <p className="text-xs opacity-70 mt-1">{card.description}</p>
                </div>
                <card.icon className="w-6 h-6 opacity-80" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-bg-secondary">
            Resumen de Actividad
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total de contenido:</span>
              <span className="font-semibold">
                {stats.totalExhibitions +
                  stats.totalEditions +
                  stats.totalTeamMembers +
                  stats.totalEvents}{" "}
                elementos
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Promedio diario estimado:
              </span>
              <span className="font-semibold">
                {stats.daily.toLocaleString()} visitas
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">
                Última actualización:
              </span>
              <span className="font-semibold">
                {new Date().toLocaleString("es-ES")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
