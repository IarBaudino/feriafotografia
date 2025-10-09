"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  getCollection,
  getDocumentsWithFilter,
  removeDuplicateImages,
} from "@/lib/firestore-helpers";
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
  // Imágenes para mostrar en el dashboard
  exhibitionImages: any[];
  editionImages: any[];
  teamImages: any[];
  eventImages: any[];
  aboutImages: any[];
}

export default function DashboardPage() {
  console.log("DashboardPage: Componente renderizado");

  const [stats, setStats] = useState<Stats>({
    daily: 0,
    weekly: 0,
    monthly: 0,
    yearly: 0,
    totalExhibitions: 0,
    totalEditions: 0,
    totalTeamMembers: 0,
    totalEvents: 0,
    exhibitionImages: [],
    editionImages: [],
    teamImages: [],
    eventImages: [],
    aboutImages: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  console.log("DashboardPage: Estado actual", { isLoading, stats });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    console.log("DashboardPage: Iniciando carga de estadísticas");
    try {
      setIsLoading(true);
      console.log("DashboardPage: Cargando colecciones...");

      // Cargar estadísticas de contenido
      const [exhibitionsData, editionsData, teamData, eventsData] =
        await Promise.all([
          getCollection("exhibitions"),
          getCollection("editions"),
          getCollection("team_members"),
          getCollection("events"),
        ]);

      // Cargar imágenes para cada sección
      console.log("DashboardPage: Cargando imágenes...");
      const [
        exhibitionImagesData,
        editionImagesData,
        teamImagesData,
        eventImagesData,
        aboutImagesData,
      ] = await Promise.all([
        getDocumentsWithFilter("images", "section", "exhibitions"),
        getDocumentsWithFilter("images", "section", "editions"),
        getDocumentsWithFilter("images", "section", "team"),
        getDocumentsWithFilter("images", "section", "events"),
        getDocumentsWithFilter("images", "section", "about"),
      ]);

      // Filtrar duplicados en cada colección de imágenes
      const uniqueExhibitionImages = removeDuplicateImages(
        exhibitionImagesData || []
      );
      const uniqueEditionImages = removeDuplicateImages(
        editionImagesData || []
      );

      console.log(
        "Dashboard Ediciones: Imágenes antes del filtro:",
        editionImagesData?.length || 0
      );
      console.log(
        "Dashboard Ediciones: Imágenes después del filtro:",
        uniqueEditionImages.length
      );
      console.log(
        "Dashboard Ediciones: URLs de imágenes:",
        uniqueEditionImages.map((img) => ({
          id: img.id,
          url: img.url,
          section_id: img.section_id,
          alt: img.alt,
        }))
      );
      const uniqueTeamImages = removeDuplicateImages(teamImagesData || []);
      const uniqueEventImages = removeDuplicateImages(eventImagesData || []);
      const uniqueAboutImages = removeDuplicateImages(aboutImagesData || []);

      console.log("DashboardPage: Imágenes procesadas", {
        exhibitions: uniqueExhibitionImages.length,
        editions: uniqueEditionImages.length,
        team: uniqueTeamImages.length,
        events: uniqueEventImages.length,
        about: uniqueAboutImages.length,
      });

      console.log("DashboardPage: Datos cargados", {
        exhibitions: exhibitionsData?.length || 0,
        editions: editionsData?.length || 0,
        team: teamData?.length || 0,
        events: eventsData?.length || 0,
      });

      // Log detallado de cada colección
      console.log("DashboardPage: Detalles de exposiciones:", exhibitionsData);
      console.log("DashboardPage: Detalles de ediciones:", editionsData);
      console.log("DashboardPage: Detalles de equipo:", teamData);
      console.log("DashboardPage: Detalles de eventos:", eventsData);

      // Aquí podrías cargar visitas reales de la tabla page_views
      // Pero si no hay datos, los contadores quedarán en cero
      const newStats = {
        daily: 0, // Siempre cero hasta que haya datos reales
        weekly: 0,
        monthly: 0,
        yearly: 0,
        totalExhibitions: exhibitionsData?.length || 0,
        totalEditions: editionsData?.length || 0,
        totalTeamMembers: teamData?.length || 0,
        totalEvents: eventsData?.length || 0,
        exhibitionImages: uniqueExhibitionImages,
        editionImages: uniqueEditionImages,
        teamImages: uniqueTeamImages,
        eventImages: uniqueEventImages,
        aboutImages: uniqueAboutImages,
      };

      console.log("DashboardPage: Actualizando estadísticas", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("DashboardPage: Error cargando estadísticas:", error);
    } finally {
      console.log(
        "DashboardPage: Finalizando carga, estableciendo isLoading: false"
      );
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
    console.log("DashboardPage: Mostrando pantalla de carga");
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

  console.log("DashboardPage: Renderizando contenido principal");
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

      {/* Galería de Imágenes */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-bg-secondary mb-4 font-bevietnam">
          Galería de Imágenes
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Exposiciones */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-md font-bold mb-3 text-bg-secondary">
              Exposiciones ({stats.exhibitionImages.length} imágenes)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {stats.exhibitionImages.slice(0, 6).map((img, index) => (
                <div
                  key={index}
                  className="aspect-square relative overflow-hidden rounded"
                >
                  <img
                    src={img.url}
                    alt={`Exposición ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Ediciones */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-md font-bold mb-3 text-bg-secondary">
              Ediciones ({stats.editionImages.length} imágenes)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {stats.editionImages.slice(0, 6).map((img, index) => (
                <div
                  key={index}
                  className="aspect-square relative overflow-hidden rounded"
                >
                  <img
                    src={img.url}
                    alt={`Edición ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Equipo */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-md font-bold mb-3 text-bg-secondary">
              Equipo ({stats.teamImages.length} imágenes)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {stats.teamImages.slice(0, 6).map((img, index) => (
                <div
                  key={index}
                  className="aspect-square relative overflow-hidden rounded"
                >
                  <img
                    src={img.url}
                    alt={`Miembro ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Eventos */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-md font-bold mb-3 text-bg-secondary">
              Eventos ({stats.eventImages.length} imágenes)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {stats.eventImages.slice(0, 6).map((img, index) => (
                <div
                  key={index}
                  className="aspect-square relative overflow-hidden rounded"
                >
                  <img
                    src={img.url}
                    alt={`Evento ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* About */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-md font-bold mb-3 text-bg-secondary">
              About ({stats.aboutImages.length} imágenes)
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {stats.aboutImages.slice(0, 6).map((img, index) => (
                <div
                  key={index}
                  className="aspect-square relative overflow-hidden rounded"
                >
                  <img
                    src={img.url}
                    alt={`About ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
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
