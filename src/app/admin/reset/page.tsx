"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Obtener el token del hash de la URL
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const accessToken = hash.split("access_token=")[1]?.split("&")[0];
      if (accessToken) {
        // Guardar el token para usarlo en el reset
        localStorage.setItem("resetToken", accessToken);
      }
    }
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2000);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-bg-secondary mb-6 text-center">
          Restablecer Contraseña
        </h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success ? (
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4">
            ¡Contraseña actualizada! Redirigiendo al login...
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1"
              >
                Nueva Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-bg-secondary focus:outline-none"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-bg-secondary text-white rounded hover:bg-opacity-90 transition-colors"
            >
              Actualizar Contraseña
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
