import { NextResponse } from "next/server";

/*
 * Report a Listing by id
 *
 * Params:
 *  listing_id: id of the Listing to get
 * Request body:
 *  user_id: id of the User reporter
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

  // get reporter data from req body
  const data = await req.json();

  // TODO: update listing in db

  return NextResponse.json({ data: { listing_id: listing_id }, error: null });
}
