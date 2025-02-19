import { NextResponse } from "next/server";
import { newListing, PatchListingData } from "@/lib/firebase/firestore/types";
import getListing from "@/lib/firebase/firestore/listing/getListing";
import patchListing from "@/lib/firebase/firestore/listing/patchListing"

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
  const listing_id: string = (await params).listing_id;

  try {
    let { result, error } = await getListing(listing_id)
    return NextResponse.json({ data: result, error: error });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message});
    } else {
      return NextResponse.json({ data: null, error: "unknown error"});
    }
  }
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

  try {
    // get updated listing data from req body
    const data: PatchListingData = await req.json();

    let { result, error }  = await patchListing(listing_id, data)
    return NextResponse.json({ data: result, error: error });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message});
    } else {
      return NextResponse.json({ data: null, error: "unknown error"});
    }
  }
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
