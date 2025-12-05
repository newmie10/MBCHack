import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { ChatMessage } from "@/types/market";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const getMessage = (value: unknown) => {
  if (value instanceof Error) return value.message;
  if (typeof value === "string") return value;
  return "Chat error";
};

export async function GET(req: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 400 },
    );
  }

  const { searchParams } = new URL(req.url);
  const marketId = searchParams.get("marketId");
  if (!marketId) {
    return NextResponse.json(
      { error: "marketId is required" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .select("id, market_id, nickname, body, created_at")
      .eq("market_id", marketId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const mapped: ChatMessage[] =
      data?.map((row) => ({
        id: row.id,
        marketId: row.market_id,
        nickname: row.nickname ?? "anon",
        body: row.body ?? "",
        createdAt: row.created_at,
      })) ?? [];

    return NextResponse.json({ messages: mapped });
  } catch (error) {
    console.error("Chat GET failed", error);
    return NextResponse.json(
      { error: getMessage(error) },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const marketId = body?.marketId;
  const nickname = (body?.nickname || "anon").toString().slice(0, 24);
  const message = (body?.message || "").toString().slice(0, 500);

  if (!marketId || !message) {
    return NextResponse.json(
      { error: "marketId and message are required" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await supabase
      .from("messages")
      .insert({
        market_id: marketId,
        nickname,
        body: message,
      })
      .select("id, market_id, nickname, body, created_at")
      .single();

    if (error) throw error;

    const mapped: ChatMessage = {
      id: data.id,
      marketId: data.market_id,
      nickname: data.nickname ?? "anon",
      body: data.body ?? "",
      createdAt: data.created_at,
    };

    return NextResponse.json({ message: mapped });
  } catch (error) {
    console.error("Chat POST failed", error);
    return NextResponse.json(
      { error: getMessage(error) },
      { status: 500 },
    );
  }
}

