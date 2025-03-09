import { NextResponse } from "next/server";
import deleteListing from "@/lib/firebase/firestore/listing/deleteListing";
import { PatchListingData } from "@/lib/firebase/firestore/types";
import getListing from "@/lib/firebase/firestore/listing/getListing";
import patchListing from "@/lib/firebase/firestore/listing/patchListing"
import { logger } from "@/lib/monitoring/config";
import { getUidFromAuthorizationHeader } from "../../util";

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
  const start = performance.now();
  try {
    // check for user token — user from auth session must exist
    const authorizationHeader = req.headers.get("authorization");
    await getUidFromAuthorizationHeader(authorizationHeader);

    // get URL parameter listing_id
    const listing_id: string = (await params).listing_id;

    const result = await getListing(listing_id);
    return NextResponse.json({ data: result, error: null});
  } catch (e: unknown) {
    logger.increment('GET_specific_listing_API_failure');
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  } finally {
    const end = performance.now();
    logger.log(`GET /api/listing/{listing_id} in ${end - start} ms`);
  }
}

/*
 * Update a Listing by id
 *
 * Params:
 *  listing_id: id of the Listing to get
 * Request body:
 *  title?: title of the Listing
 *  price?: price of the Listing
 *  condition?: condition of the Listing
 *  category?: category of the Listing
 *  description?: description of the Listing
 *  selected_buyer_id?: id of the selected buyer
 *  potential_buyer_ids?: list of ids of potential buyers
 *  image_paths?: list of paths to images for the Listing
 * Return:
 *  data: the updated Listing object corresponding to the requested id
 *  error: error or null
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ listing_id: string }> }
) {
  const start = performance.now();
  try {
    // check for user token — user from auth session must exist
    const authorizationHeader = req.headers.get("authorization");
    await getUidFromAuthorizationHeader(authorizationHeader);

    // get URL parameter listing_id
    const listing_id = (await params).listing_id;

    // get updated listing data from req body
    const data: PatchListingData = await req.json();

    // validate input for only valid fields
    Object.keys(data).forEach((key) => {
      if (![
        'title',
        'price',
        'condition',
        'category',
        'description',
        'selected_buyer',
        'potential_buyers',
        'image_paths'
      ].includes(key)) {
        throw new Error('invalid listing field');
      }
    });

    if (Object.keys(data).includes('price') && data['price'] < 0) {
      throw new Error('price must be nonnegative');
    }

    if (data.selected_buyer && data.selected_buyer != '') {
      logger.increment('productMatch');
    } else if (data.selected_buyer && data.selected_buyer == ''){
      logger.decrement('productMatch');
    }

    if (data.potential_buyers && data.potential_buyers.length >= 1) {
      logger.increment('interestedBuyers');
    }

    const result = await patchListing(listing_id, data);
    return NextResponse.json({ data: result, error: null});
  } catch (e: unknown) {
    logger.increment('PATCH_listing_API_failure');
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error"});
    }
  } finally {
    const end = performance.now();
    logger.log(`PATCH /api/listing/{listing_id} in ${end - start} ms`);
  }
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
  const start = performance.now();
  try {
    // get URL parameter listing_id
    const listing_id = (await params).listing_id;

    // get user id from req body
    const {user_id} = await req.json();

    // check for user token — user from auth session must exist
    const authorizationHeader = req.headers.get("authorization");
    const uid = await getUidFromAuthorizationHeader(authorizationHeader);
    if (uid != user_id) {
      throw new Error("Provided user_id must match authenticated user");
    }

    if (user_id === undefined) {
      throw new Error("User not provided");
    }

    const ret_id: string = await deleteListing(listing_id, user_id);

    return NextResponse.json({ data: { listing_id: ret_id }, error: null });
  } catch (e: unknown) {
    logger.increment('DELETE_listing_API_failure');
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  } finally {
    const end = performance.now();
    logger.log(`DELETE /api/listing/{listing_id} in ${end - start} ms`);
  }
}
