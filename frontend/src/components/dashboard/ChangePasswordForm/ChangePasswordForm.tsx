"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export function ChangePasswordForm() {
  const supabase = createClient();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "La contraseña debe tener al menos 6 caracteres." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Las contraseñas no coinciden." });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage({ type: "success", text: "¡Contraseña actualizada con éxito!" });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorText = err instanceof Error ? err.message : "Error al actualizar contraseña";
      setMessage({ type: "error", text: errorText });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-4">
      <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
        <Lock className="w-5 h-5 text-sentinel-emerald" />
        Seguridad de la Cuenta
      </h2>

      {message && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handlePasswordChange} className="space-y-4 pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Nueva Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sentinel-emerald transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sentinel-emerald transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-sentinel-emerald" />
          ) : (
            <Lock className="w-4 h-4 text-sentinel-emerald" />
          )}
          <span>{loading ? "Guardando..." : "Actualizar Contraseña"}</span>
        </button>
      </form>
    </div>
  );
}

export default ChangePasswordForm;