"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { onAuthChange } from "@/lib/firebase-auth";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar si hay un usuario autenticado en localStorage
        const isAuth = localStorage.getItem("admin_authenticated") === "true";
        const user = localStorage.getItem("admin_user");

        if (isAuth && user) {
          console.log("Usuario autenticado:", JSON.parse(user));
          setIsAuthenticated(true);
        } else {
          console.log("Usuario no autenticado, redirigiendo a login");
          router.push("/admin/login");
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        router.push("/admin/login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Escuchar cambios de autenticación de Firebase
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        console.log("Usuario autenticado en Firebase:", user.email);
        setIsAuthenticated(true);
        localStorage.setItem("admin_authenticated", "true");
        localStorage.setItem(
          "admin_user",
          JSON.stringify({ email: user.email })
        );
      } else {
        console.log("Usuario no autenticado en Firebase");
        setIsAuthenticated(false);
        localStorage.removeItem("admin_authenticated");
        localStorage.removeItem("admin_user");
        router.push("/admin/login");
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent-blue"></div>
      </div>
    );
  }

  return <>{children}</>;
}
