import Link from "next/link";
import { ShieldCheck, Activity, TrendingUp, Shield } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-sentinel-dark">
      {/* Background Subtle Gradient Overlay */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-sentinel-emerald/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Copywriting */}
          <div className="lg:col-span-6 space-y-8">
            
            {/* Tag Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-sentinel-emerald tracking-wide">
              <span className="w-2 h-2 rounded-full bg-sentinel-emerald animate-pulse" />
              MICRO SAAS B2B & B2C
            </div>

            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Monitorea la salud de tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-sentinel-emerald to-emerald-300">computadoras</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-slate-400 max-w-xl font-normal leading-relaxed">
              PC Sentinel te ayuda a detectar problemas, prevenir fallos de hardware y mantener tus equipos siempre al 100%.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-semibold text-slate-900 bg-sentinel-emerald hover:bg-emerald-400 rounded-xl transition-all shadow-xl shadow-emerald-500/25 active:scale-95"
              >
                Comenzar gratis
              </Link>
              <Link
                href="#caracteristicas"
                className="inline-flex items-center justify-center px-6 py-3.5 text-base font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-xl transition-all"
              >
                Ver características
              </Link>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <ShieldCheck className="w-4 h-4 text-sentinel-emerald shrink-0" />
                <span>Protección temprana</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <Activity className="w-4 h-4 text-sentinel-emerald shrink-0" />
                <span>Monitoreo 24/7</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
                <TrendingUp className="w-4 h-4 text-sentinel-emerald shrink-0" />
                <span>Métricas en tiempo real</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Mockup Showcase */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Laptop Graphic Container */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-4 px-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-slate-500 ml-2 font-mono">PC Sentinel Monitor v1.0</span>
                </div>

                {/* Dashboard Screen Mockup */}
                <div className="relative bg-slate-950 rounded-xl p-6 border border-slate-800/80 aspect-[16/10] flex items-center justify-center">
                  
                  {/* Laptop Center Logo Pulse */}
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="relative p-6 rounded-full bg-slate-900/90 border border-slate-800">
                      <Shield className="w-16 h-16 text-slate-700" />
                      <Activity className="w-10 h-10 text-sentinel-emerald absolute inset-0 m-auto animate-pulse" />
                    </div>
                  </div>

                  {/* Floating Metrics Overlay Cards */}
                  <div className="absolute right-4 top-4 bottom-4 w-44 flex flex-col justify-center gap-3">
                    
                    {/* CPU Card */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md">
                      <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                        <span>CPU</span>
                        <span className="text-white font-bold">34%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-sentinel-emerald h-full w-[34%]" />
                      </div>
                    </div>

                    {/* Memoria Card */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md">
                      <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                        <span>Memoria</span>
                        <span className="text-white font-bold">62%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-sentinel-blue h-full w-[62%]" />
                      </div>
                    </div>

                    {/* Disco Card */}
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 backdrop-blur-md">
                      <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                        <span>Disco</span>
                        <span className="text-white font-bold">87%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-sentinel-danger h-full w-[87%]" />
                      </div>
                    </div>

                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}