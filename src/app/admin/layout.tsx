"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
// Autenticación simplificada - sin Supabase
import {
  HiCalendar,
  HiPhotograph,
  HiCollection,
  HiInformationCircle,
  HiUserGroup,
  HiDocumentText,
  HiMenu,
  HiX,
  HiEye,
  HiUser,
} from "react-icons/hi";
import Link from "next/link";
import { trackPageView } from "@/lib/analytics";

const sidebarItems = [
  {
    title: "Portada",
    description: "Configurar imagen/video principal",
    icon: HiEye,
    path: "/admin/portada",
  },
  {
    title: "Agenda Cultural",
    description: "Gestiona eventos y cursos",
    icon: HiCalendar,
    path: "/admin/agenda",
  },
  {
    title: "Exposiciones",
    description: "Galerías virtuales",
    icon: HiPhotograph,
    path: "/admin/exposiciones",
  },
  {
    title: "Ediciones",
    description: "Ediciones anteriores",
    icon: HiCollection,
    path: "/admin/ediciones",
  },
  {
    title: "About",
    description: "Información general",
    icon: HiInformationCircle,
    path: "/admin/about",
  },
  {
    title: "Team",
    description: "Gestión del equipo",
    icon: HiUserGroup,
    path: "/admin/team",
  },
  {
    title: "Convocatorias",
    description: "Gestión de convocatorias",
    icon: HiDocumentText,
    path: "/admin/convocatorias",
  },
  {
    title: "Mi Perfil",
    description: "Gestionar cuenta y contraseña",
    icon: HiUser,
    path: "/admin/profile",
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  const checkAuth = async () => {
    try {
      // Autenticación simplificada - permitir acceso directo
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Error checking auth:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated && pathname !== "/admin/login") {
    return null;
  }

  // Páginas que no deben mostrar el layout de administración
  const publicPages = ["/admin/login", "/admin/register", "/admin/reset"];
  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-5 border-b border-white/10">
            <h1 className="text-lg font-bold font-bevietnam text-white">
              Panel de Administración
            </h1>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav className="px-4 space-y-2">
              {sidebarItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                    pathname === item.path
                      ? "bg-accent-blue text-bg-secondary font-bold"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <div>
                    <div className="text-sm font-bevietnam">{item.title}</div>
                    <div className="text-xs text-white/70">
                      {item.description}
                    </div>
                  </div>
                </Link>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className="border-t border-white/10">
            <div className="p-5">
              <button
                onClick={async () => {
                  try {
                    // Cerrar sesión en Firebase
                    const { signOutUser } = await import("@/lib/firebase-auth");
                    await signOutUser();

                    // Limpiar localStorage
                    localStorage.removeItem("admin_authenticated");
                    localStorage.removeItem("admin_user");

                    // Redirigir al home
                    window.location.href = "/";
                  } catch (error) {
                    console.error("Error al cerrar sesión:", error);
                    // Limpiar localStorage de todas formas
                    localStorage.removeItem("admin_authenticated");
                    localStorage.removeItem("admin_user");
                    window.location.href = "/";
                  }
                }}
                className="w-full px-4 py-2 text-sm text-white bg-accent-green rounded-md hover:bg-opacity-90 transition-colors"
              >
                Cerrar Sesión
              </button>
              <p className="text-xs text-white/70 text-center mt-4">
                © 2024 Feria Fotografía
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:pl-64">
        <main className="container mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
