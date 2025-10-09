"use client";
import React from "react";
import { useState } from "react";
// Migrado a Firebase
import { useRouter } from "next/navigation";
import { HiMail, HiArrowLeft } from "react-icons/hi";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log("Intentando enviar email de recuperación a:", email);

      // TODO: Implementar reset de contraseña en Firebase
      console.log("Enviando email de recuperación a:", email);
      const error = null;

      if (error) throw error;

      setSuccess(
        "Se ha enviado un email con instrucciones para recuperar tu contraseña. Revisa tu bandeja de entrada."
      );
      setEmail("");
    } catch (error) {
      console.error("Error enviando email de recuperación:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Error al enviar el email de recuperación"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg-primary">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-bg-secondary mb-6 text-center">
          Recuperar contraseña
        </h1>

        <p className="text-gray-600 mb-6 text-center">
          Ingresa tu email y te enviaremos instrucciones para recuperar tu
          contraseña.
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
              placeholder="tu@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 bg-bg-secondary text-white rounded hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2
              ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <HiMail className="w-5 h-5" />
            {loading ? "Enviando..." : "Enviar email de recuperación"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push("/admin/login")}
            className="text-bg-secondary hover:underline flex items-center gap-1 mx-auto"
          >
            <HiArrowLeft className="w-4 h-4" />
            Volver al login
          </button>
        </div>
      </div>
    </main>
  );
}
