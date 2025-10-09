"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange } from "@/lib/firebase-auth";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  console.log("AuthCheck: Componente renderizado");

  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  console.log("AuthCheck: Estado actual", {
    isLoading,
    isAuthenticated,
    pathname,
  });

  useEffect(() => {
    console.log("AuthCheck: Iniciando verificación de autenticación");
    // Solo usar Firebase Auth - no localStorage

    // Escuchar cambios de autenticación de Firebase
    const unsubscribe = onAuthChange((user) => {
      console.log("AuthCheck: onAuthChange callback ejecutado", {
        user: user?.email,
      });

      if (user) {
        console.log("AuthCheck: Usuario autenticado en Firebase:", user.email);
        setIsAuthenticated(true);
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem(
          "admin_user",
          JSON.stringify({ email: user.email })
        );
      } else {
        console.log("AuthCheck: Usuario no autenticado en Firebase");
        setIsAuthenticated(false);
        localStorage.removeItem("admin_authenticated");
        localStorage.removeItem("admin_user");
        router.push("/admin/login");
      }

      console.log("AuthCheck: Estableciendo isLoading: false");
      setIsLoading(false);
    });

    return () => {
      console.log("AuthCheck: Limpiando listener de autenticación");
      unsubscribe();
    };
  }, [router, pathname]);

  if (isLoading) {
    console.log("AuthCheck: Mostrando pantalla de carga");
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  console.log("AuthCheck: Renderizando children");
  return <>{children}</>;
}
