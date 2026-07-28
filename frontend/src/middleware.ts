import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 1. Crear el cliente de Supabase para leer la sesión en la petición
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 2. Obtener el usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || 
                      request.nextUrl.pathname.startsWith("/register");
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  // 3. Redireccionar si no está autenticado e intenta ir al dashboard
  if (isDashboardRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 4. Redireccionar si YA está autenticado e intenta ir a login o registro
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

// Proteger únicamente las rutas de autenticación y el dashboard
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};