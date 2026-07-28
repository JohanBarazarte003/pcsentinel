"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Shield, Activity, ArrowRight, Lock, Mail, User, Building2, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [accountType, setAccountType] = useState<"personal" | "business">("personal");
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

      // 2. Crear la Organización con el tipo de cuenta (Personal o Empresa)
      const { error: orgError } = await supabase.from("organizations").insert({
        name: companyName || (accountType === "personal" ? "Mi PC Personal" : "Mi Empresa"),
        owner_id: authData.user.id,
        account_type: accountType,
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
    <div className="min-h-screen bg-sentinel-dark flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-xl">
        
        {/* Header Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-sentinel-emerald mb-3">
            <Shield className="w-7 h-7 absolute" />
            <Activity className="w-5 h-5 text-sentinel-emerald z-10" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Crear cuenta en PC Sentinel</h1>
          <p className="text-sm text-sentinel-slate mt-1">Elige cómo deseas monitorear tus equipos</p>
        </div>

        {/* Card Contenedora */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          
          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-6">
            
            {/* Selector de Tipo de Cuenta: B2C vs B2B */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Tipo de Cuenta
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Opción B2C: Personal / Gamer / Freelancer */}
                <div
                  onClick={() => setAccountType("personal")}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between relative ${
                    accountType === "personal"
                      ? "bg-emerald-500/10 border-sentinel-emerald text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {accountType === "personal" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-sentinel-emerald text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="p-2.5 bg-slate-800 rounded-lg w-fit text-sentinel-emerald mb-3">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Uso Personal (B2C)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Ideal para Gamers, Freelancers y Estudiantes (1 a 3 PCs). Monitorea temperaturas y SSD.
                    </p>
                  </div>
                </div>

                {/* Opción B2B: Empresa / Pyme / Agencia */}
                <div
                  onClick={() => setAccountType("business")}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex flex-col justify-between relative ${
                    accountType === "business"
                      ? "bg-emerald-500/10 border-sentinel-emerald text-white"
                      : "bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  {accountType === "business" && (
                    <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-sentinel-emerald text-slate-950 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <div className="p-2.5 bg-slate-800 rounded-lg w-sentinel-emerald text-sentinel-emerald mb-3">
                    <Building2 className="w-5 h-5 text-sentinel-emerald" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Empresa / Pyme (B2B)</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Para Agencias y Empresas (5 a 50+ laptops). Gestión de flotas, reportes y alertas en lote.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Campo Nombre */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {accountType === "personal" ? "Nombre de tu Equipo / Perfil" : "Nombre de la Empresa"}
              </label>
              <input
                type="text"
                required
                placeholder={accountType === "personal" ? "Ej. Mi Laptop Setup" : "Ej. Agencia Digital S.A."}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sentinel-emerald transition-colors"
              />
            </div>

            {/* Email */}
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

            {/* Contraseña */}
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
              className="w-full py-3.5 px-4 bg-sentinel-emerald hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
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