import { NextResponse } from "next/server";
import getAllListings from "@/lib/firebase/firestore/listing/getAllListings";
import addListing from "@/lib/firebase/firestore/listing/addListing";

// GET all listings
export async function GET() {
  const { result, error } = await getAllListings();

  // TODO: Processing to only return listings that do not have a selected buyer
  return NextResponse.json({ result: result, error: error });
}

// POST a new listing
export async function POST(req: Request) {
  const dataToInsert = await req.json();
  const { result, error } = await addListing(dataToInsert);
  return NextResponse.json({ result, error });
}
