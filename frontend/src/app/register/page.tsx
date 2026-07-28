"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Activity, ArrowRight, Lock, Mail, Building } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        throw new Error(authError?.message || "Error al crear la cuenta");
      }

      // 2. Crear la Organización B2B/B2C en la base de datos
      const { error: orgError } = await supabase.from("organizations").insert({
        name: companyName,
        owner_id: authData.user.id,
      });

      if (orgError) {
        throw new Error(orgError.message);
      }

      // Redireccionar al Dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Ocurrió un error en el registro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-sentinel-dark flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-sentinel-emerald mb-3">
            <Shield className="w-7 h-7 absolute" />
            <Activity className="w-5 h-5 text-sentinel-emerald z-10" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Crear cuenta en PC Sentinel</h1>
          <p className="text-sm text-sentinel-slate mt-1">Comienza a monitorear tus computadoras en minutos</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Nombre de Empresa o Usuario
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="Ej. Mi Agencia o Mi PC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sentinel-emerald transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sentinel-emerald transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sentinel-emerald transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-sentinel-emerald hover:bg-emerald-400 text-slate-950 font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/login" className="text-sentinel-emerald font-semibold hover:underline">
              Iniciar Sesión
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}