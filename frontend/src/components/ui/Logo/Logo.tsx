import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  showTagline?: boolean;
  showLink?: boolean;
  className?: string;
}

export function Logo({
  showTagline = true,
  showLink = true,
  className = "",
}: LogoProps) {
  const content = (
    <div className={`flex items-center gap-1 group ${className}`}>
      
      {/* 
        Contenedor del Escudo con Zoom Automático (scale-150) 
        para eliminar el espacio transparente sobrante de la imagen
      */}
      <div className="relative shrink-0 flex items-center justify-center w-12 h-12 overflow-hidden">
        <Image
          src="/shield-logo.png"
          alt="PC Sentinel Escudo Oficial"
          width={180}
          height={180}
          priority
          className="w-14 h-14 object-contain scale-225 transition-transform group-hover:scale-175"
        />
      </div>

      {/* Texto de la Marca Pegado y Prominente */}
      <div className="flex flex-col justify-center leading-none pl-1">
        <span className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-1">
          PC <span className="text-sentinel-emerald">Sentinel</span>
        </span>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] tracking-widest text-sentinel-slate font-bold uppercase mt-1">
            Monitoreo • Protección
          </span>
        )}
      </div>

    </div>
  );

  if (showLink) {
    return (
      <Link href="/" className="inline-block transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}