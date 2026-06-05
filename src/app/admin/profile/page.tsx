"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { HiSave, HiEye, HiEyeOff } from "react-icons/hi";
import AuthCheck from "@/components/Auth/AuthCheck";
import { AUTH_CONFIG } from "@/lib/auth-config";

export default function ProfilePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validaciones
    if (newPassword.length < AUTH_CONFIG.PASSWORD_MIN_LENGTH) {
      setMessage({
        type: "error",
        text: `La nueva contraseña debe tener al menos ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} caracteres`,
      });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden" });
      setLoading(false);
      return;
    }

    try {
      // Cambiar contraseña
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage({
        type: "success",
        text: "Contraseña actualizada correctamente",
      });

      // Limpiar formulario
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Error al cambiar la contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      // Forzar recarga para limpiar completamente la sesión
      window.location.href = "/admin/login";
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  return (
    <AuthCheck>
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-bg-secondary font-bevietnam mb-8">
          Mi Perfil
        </h1>

        {/* Información del usuario */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-bg-secondary mb-4">
            Información de la cuenta
          </h2>
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> {user?.email}
            </p>
            <p>
              <strong>Última sesión:</strong>{" "}
              {user?.last_sign_in_at
                ? new Date(user.last_sign_in_at).toLocaleString("es-ES")
                : "No disponible"}
            </p>
          </div>
        </div>

        {/* Cambiar contraseña */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-bg-secondary mb-6">
            Cambiar contraseña
          </h2>

          {message && (
            <div
              className={`p-4 rounded-lg mb-6 ${
                message.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-blue focus:outline-none pr-10"
                  placeholder={`Mínimo ${AUTH_CONFIG.PASSWORD_MIN_LENGTH} caracteres`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <HiEyeOff size={20} />
                  ) : (
                    <HiEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent-blue focus:outline-none pr-10"
                  placeholder="Repite la nueva contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <HiEyeOff size={20} />
                  ) : (
                    <HiEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 bg-accent-green text-white rounded-lg hover:bg-opacity-90 transition-colors ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <HiSave className="w-5 h-5" />
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </form>
        </div>
      </div>
    </AuthCheck>
  );
}
