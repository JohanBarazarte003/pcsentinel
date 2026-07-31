import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { planType } = await request.json(); // 'pro' ($4.99) o 'business' ($29.00)

    const amount = planType === "business" ? 29.00 : 4.99;
    const planName = planType === "business" ? "Plan Empresa (Flotas TI)" : "Plan Pro Gamer / Freelancer";
    const binancePayId = process.env.NEXT_PUBLIC_BINANCE_PAY_ID || "248192038";

    return NextResponse.json({
      success: true,
      amount: amount,
      currency: "USDT",
      planName: planName,
      binancePayId: binancePayId,
      merchantName: process.env.NEXT_PUBLIC_BINANCE_PAY_NAME || "PC Sentinel Cloud",
    });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "Error procesando pago con Binance", details: errorMessage }, { status: 500 });
  }
}