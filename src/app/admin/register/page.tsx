"use client";
import React from "react";
import { useState, useEffect } from "react";
// Migrado a Firebase
import { useRouter } from "next/navigation";

// Configuración local para evitar problemas de importación
const AUTHORIZED_EMAILS: string[] = ["feriadefotografia@gmail.com"];
const PASSWORD_MIN_LENGTH = 6;

const isEmailAuthorized = (email: string): boolean => {
  return AUTHORIZED_EMAILS.includes(email.toLowerCase());
};

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasUsers, setHasUsers] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar si ya hay una sesión activa en Firebase
    const checkSession = async () => {
      try {
        const { onAuthChange } = await import("@/lib/firebase-auth");
        onAuthChange((user) => {
          if (user && isEmailAuthorized(user.email || "")) {
            setHasUsers(true);
            setError(
              "Ya existe una cuenta de administrador activa. No se pueden crear más cuentas."
            );
          }
        });
      } catch (error) {
        console.error("Error verificando sesión:", error);
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validaciones
    if (!isEmailAuthorized(email)) {
      setError(
        "Este email no está autorizado para crear una cuenta de administrador"
      );
      setLoading(false);
      return;
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(
        `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
      );
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    try {
      console.log("Intentando crear cuenta con:", email);

      // Registrar usuario con Firebase
      const { createUserWithEmailAndPassword } = await import("firebase/auth");
      const { auth } = await import("@/lib/firebase-auth");
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      if (userCredential.user) {
        setSuccess("Cuenta creada exitosamente. Redirigiendo al dashboard...");
        setTimeout(() => {
          router.replace("/admin/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Error de registro:", error);
      setError(
        error instanceof Error ? error.message : "Error al crear la cuenta"
      );
    } finally {
      setLoading(false);
    }
  };

  if (hasUsers) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-bg-secondary mb-6 text-center">
            Registro no disponible
          </h1>
          <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg mb-6">
            {error}
          </div>
          <button
            onClick={() => router.push("/admin/login")}
            className="w-full py-2 px-4 bg-bg-secondary text-white rounded hover:bg-opacity-90 transition-colors"
          >
            Ir al login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-bg-secondary mb-6 text-center">
          Crear cuenta de administrador
        </h1>

        <p className="text-gray-600 mb-6 text-center">
          Solo emails autorizados pueden crear cuentas de administrador.
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 text-green-600 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:ring-2 focus:ring-bg-secondary focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-bg-secondary focus:outline-none pr-10"
                placeholder={`Mínimo ${PASSWORD_MIN_LENGTH} caracteres`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium mb-1"
            >
              Confirmar contraseña
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-bg-secondary focus:outline-none pr-10"
                placeholder="Repite la contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-bg-secondary text-white rounded hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            👤
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <button
              onClick={() => router.push("/admin/login")}
              className="text-bg-secondary hover:underline"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
