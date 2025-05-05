"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { HiUsers, HiClock, HiCalendar, HiChartBar } from "react-icons/hi";

interface Stats {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // Aquí cargarías las estadísticas reales desde tu base de datos
    // Por ahora usamos datos de ejemplo
    setStats({
      daily: 145,
      weekly: 1023,
      monthly: 4521,
      yearly: 52480,
    });
  };

  const statCards = [
    {
      title: "Visitas Hoy",
      value: stats.daily,
      icon: HiUsers,
      color: "bg-bg-secondary",
    },
    {
      title: "Esta Semana",
      value: stats.weekly,
      icon: HiClock,
      color: "bg-accent-green",
    },
    {
      title: "Este Mes",
      value: stats.monthly,
      icon: HiCalendar,
      color: "bg-accent-blue",
    },
    {
      title: "Este Año",
      value: stats.yearly,
      icon: HiChartBar,
      color: "bg-text-primary",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-bg-secondary font-bevietnam mb-6">
        Panel de Control
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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
              </div>
              <card.icon className="w-6 h-6 opacity-80" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-bg-secondary">
            Actividad Reciente
          </h2>
          <div className="h-40 flex items-center justify-center text-gray-400">
            Contenido próximamente
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm">
          <h2 className="text-lg font-bold mb-4 text-bg-secondary">
            Estadísticas Generales
          </h2>
          <div className="h-40 flex items-center justify-center text-gray-400">
            Contenido próximamente
          </div>
        </div>
      </div>
    </div>
  );
}
