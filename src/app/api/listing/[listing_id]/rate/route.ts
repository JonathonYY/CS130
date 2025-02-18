import { NextResponse } from "next/server";

/*
 * Rate Listing by id
 * If the user who rates the listing is the owner, then it will modify the buyer's rating
 * If the user who rates the listing is the selected buyer, then it will modify the seller's rating
 *
 * Params:
 *  listing_id: id of the Listing to rate
 * Request body:
 *  user_id: id of the User who submitted the rating
 *  rating: rating for the specified Listing in range [1-5]
 * Return:
 *  data: id of the updated Listing
 *  error: error or null
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ listing_id: string }> }
) {
  // get URL parameter listing_id
  const listing_id = (await params).listing_id;

  // get user and rating data from req body
  const data = await req.json();

  // TODO: update User/Listing in db

  return NextResponse.json({ data: { listing_id: listing_id }, error: null });
}
