import { NextResponse } from "next/server";

// GET listing with matching ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ listing_id: string }> }
) {
  // get the URL parameter, listing_id
  const listing_id = (await params).listing_id;
  console.log(listing_id);

  return NextResponse.json({ listing_id: listing_id }, { status: 200 });
}
