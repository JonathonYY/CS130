import { NextResponse } from "next/server";
import { newListing } from "@/lib/firebase/firestore/types";

/*
 * Get a Listing by id
 *
 * Params:
 *  listing_id: id of the Listing to get
 * Request body:
 *  None
 * Return:
 *  data: the Listing object corresponding to the requested id
 *  error: error or null
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ listing_id: string }> }
) {
  // get URL parameter listing_id
  const listing_id = (await params).listing_id;

  // TODO: get Listing from db

  return NextResponse.json({ data: newListing(), error: null });
}

/*
 * Update a Listing by id
 *
 * Params:
 *  listing_id: id of the Listing to get
 * Request body:
 *  title: title of the Listing
 *  price: price of the Listing
 *  condition: condition of the Listing
 *  category: category of the Listing
 *  description: description of the Listing
 *  selected_buyer_id: id of the selected buyer
 *  potential_buyer_ids: list of ids of potential buyers
 *  image_paths: list of paths to images for the Listing
 * Return:
 *  data: the updated Listing object corresponding to the requested id
 *  error: error or null
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ listing_id: string }> }
) {
  // get URL parameter listing_id
  const listing_id = (await params).listing_id;

  // get updated listing data from req body
  const data = await req.json();

  // TODO: update listing in db

  return NextResponse.json({ data: newListing(), error: null });
}

/*
 * Delete a Listing by id
 *
 * Params:
 *  listing_id: id of the Listing to get
 * Request body:
 *  None
 * Return:
 *  data: id of the deleted Listing
 *  error: error or null
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ listing_id: string }> }
) {
  // get URL parameter listing_id
  const listing_id = (await params).listing_id;

  // TODO: delete listing in db

  return NextResponse.json({ data: { listing_id: listing_id }, error: null });
}
