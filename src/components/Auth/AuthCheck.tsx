"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        console.log("Estado de sesión:", session);

        // Si estamos en la página de login y hay sesión, redirigir al dashboard
        if (session && pathname === "/admin/login") {
          router.push("/admin/dashboard");
          return;
        }

        // Si no hay sesión y no estamos en login, redirigir a login
        if (!session && pathname !== "/admin/login") {
          router.push("/admin/login");
          return;
        }

        // Si hay sesión, verificar que siga siendo válida
        if (session) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          console.log("Sesión válida, usuario:", user?.email);
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        if (pathname !== "/admin/login") {
          router.push("/admin/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Cambio de estado de auth:", event, session?.user?.email);
      checkAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
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
