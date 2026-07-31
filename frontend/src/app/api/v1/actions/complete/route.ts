import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { actionId, status, resultMessage } = await request.json();

    if (!actionId || !status) {
      return NextResponse.json({ error: "Parámetros incompletos" }, { status: 400 });
    }

    await supabaseAdmin
      .from("action_commands")
      .update({
        status: status,
        result_message: resultMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", actionId);

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ error: "Error procesando respuesta de remediación" }, { status: 500 });
  }
}