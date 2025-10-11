"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange } from "@/lib/firebase-auth";
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
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log("AdminLayout: Iniciando verificación de autenticación");
    // Escuchar cambios de autenticación de Firebase
    const unsubscribe = onAuthChange((user) => {
      console.log("AdminLayout: onAuthChange callback ejecutado", {
        user: user?.email,
        pathname,
      });

      if (user) {
        console.log(
          "AdminLayout: Usuario autenticado en Firebase:",
          user.email
        );
        setIsAuthenticated(true);
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem(
          "admin_user",
          JSON.stringify({ email: user.email })
        );
        console.log("AdminLayout: Estado actualizado - isAuthenticated: true");
      } else {
        console.log("AdminLayout: Usuario no autenticado en Firebase");
        setIsAuthenticated(false);
        localStorage.removeItem("admin_authenticated");
        localStorage.removeItem("admin_user");
        if (
          pathname !== "/admin/login" &&
          pathname !== "/admin/register" &&
          pathname !== "/admin/reset"
        ) {
          console.log("AdminLayout: Redirigiendo a login");
          router.push("/admin/login");
        }
      }
      console.log("AdminLayout: Estableciendo isLoading: false");
      setIsLoading(false);
    });

    return () => {
      console.log("AdminLayout: Limpiando listener de autenticación");
      unsubscribe();
    };
  }, [router, pathname]);

  useEffect(() => {
    trackPageView(window.location.pathname);
  }, []);

  console.log("AdminLayout: Estado actual", {
    isLoading,
    isAuthenticated,
    pathname,
  });

  if (isLoading) {
    console.log("AdminLayout: Mostrando pantalla de carga");
    return (
      <div className="flex justify-center items-center h-screen bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-bg-secondary font-bevietnam">
            Verificando autenticación...
          </p>
        </div>
      </div>
    );
  }

  if (
    !isAuthenticated &&
    pathname !== "/admin/login" &&
    pathname !== "/admin/register" &&
    pathname !== "/admin/reset"
  ) {
    console.log(
      "AdminLayout: Usuario no autenticado, mostrando pantalla de redirección"
    );
    return (
      <div className="flex justify-center items-center h-screen bg-bg-primary">
        <div className="text-center">
          <p className="text-bg-secondary font-bevietnam mb-4">
            Redirigiendo al login...
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-accent-blue mx-auto"></div>
        </div>
      </div>
    );
  }

  console.log("AdminLayout: Renderizando contenido principal");

  // Páginas que no deben mostrar el layout de administración
  const publicPages = ["/admin/login", "/admin/register", "/admin/reset"];
  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header móvil */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-bg-secondary shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold font-bevietnam text-white">
            Panel Admin
          </h1>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-white hover:bg-white/10 rounded-md transition-colors"
            aria-label="Menú"
          >
            {isSidebarOpen ? (
              <HiX className="w-6 h-6" />
            ) : (
              <HiMenu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar Desktop */}
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

      {/* Sidebar Móvil */}
      {isSidebarOpen && (
        <>
          {/* Overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Menu móvil */}
          <aside className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-bg-secondary z-50">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-5 border-b border-white/10 flex items-center justify-between">
                <h1 className="text-lg font-bold font-bevietnam text-white">
                  Panel de Administración
                </h1>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <HiX className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto py-4">
                <nav className="px-4 space-y-2">
                  {sidebarItems.map((item) => (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                        pathname === item.path
                          ? "bg-accent-blue text-bg-secondary font-bold"
                          : "text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <div>
                        <div className="text-sm font-bevietnam">
                          {item.title}
                        </div>
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
                        const { signOutUser } = await import(
                          "@/lib/firebase-auth"
                        );
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
        </>
      )}

      {/* Main Content */}
      <div className="md:pl-64 pt-16 md:pt-0">
        <main className="container mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
