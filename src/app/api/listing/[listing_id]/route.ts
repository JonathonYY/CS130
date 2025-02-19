import { NextResponse } from "next/server";
import { newListing } from "@/lib/firebase/firestore/types";
import deleteListing from "@/lib/firebase/firestore/listing/deleteListing";
import getListing from "@/lib/firebase/firestore/listing/getListing";

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

  let result = await getListing(listing_id)

  return NextResponse.json(result);
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
 *  user_id: id of the User deleting listing
 * Return:
 *  data: id of the deleted Listing
 *  error: error or null
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ listing_id: string }> }
) {
  try {
    // get URL parameter listing_id
    const listing_id = (await params).listing_id;

    // get user id from req body
    const {user_id} = await req.json();

    if (user_id === undefined) {
      throw new Error("User not provided");
    }

    const ret_id: string = await deleteListing(listing_id, user_id);

    return NextResponse.json({ data: { listing_id: ret_id }, error: null });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  }
}
