import { NextResponse } from "next/server";

// TODO: INPUT/OUTPUT SHAPE ARE NOT SET

export async function POST(req: Request) {
  return NextResponse.json({ data: { path: "" }, error: null });
}

export async function GET(req: Request) {
  return NextResponse.json({ data: { img: "" }, error: null });
}
