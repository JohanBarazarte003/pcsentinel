import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // 1. Verificar si quien hace la petición es Super Admin
    const { data: adminOrg } = await supabaseAdmin
      .from("organizations")
      .select("is_super_admin")
      .eq("owner_id", user.id)
      .single();

    if (!adminOrg?.is_super_admin) {
      return NextResponse.json({ error: "Acceso denegado: Se requieren permisos de Super Admin" }, { status: 403 });
    }

    const { targetOrgId, newAccountType } = await request.json();

    if (!targetOrgId || !newAccountType) {
      return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
    }

    // 2. Actualizar el plan de la organización seleccionada
    const { error } = await supabaseAdmin
      .from("organizations")
      .update({ account_type: newAccountType })
      .eq("id", targetOrgId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Plan actualizado con éxito a '${newAccountType}'` });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Error actualizando plan", details: errorMessage }, { status: 500 });
  }
}