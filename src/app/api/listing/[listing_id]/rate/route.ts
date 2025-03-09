import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { getDoc, doc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { Listing, User } from "@/lib/firebase/firestore/types";
import { logger } from "@/lib/monitoring/config";
import { getUidFromAuthorizationHeader } from "../../../util";

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
  const start = performance.now();
  try {
    // get URL parameter listing_id
    const listing_id = (await params).listing_id;

    // get user and rating data from req body
    const { user_id, rating } = await req.json();

    // check for user token — user from auth session must exist
    const authorizationHeader = req.headers.get("authorization");
    const uid = await getUidFromAuthorizationHeader(authorizationHeader);
    if (uid != user_id) {
      throw new Error("Provided user_id must match authenticated user");
    }

    // check rating is provided and valid
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error("Must provide a rating between 1 and 5");
    }

    if (user_id === undefined) {
      throw new Error("User not provided");
    }

    // Reference to listing in firestore
    const listingRef = doc(db, 'listings', listing_id);
    const listingSnapshot = await getDoc(listingRef);

    if (!listingSnapshot.exists()) {
      throw new Error("Listing not found");
    }

    const listingData = listingSnapshot.data() as Listing;
    if (!listingData) {
      throw new Error("Listing data invalid");
    }

    // extract relevant fields
    const {owner, selected_buyer, ratings} = listingData;
    if (![owner, selected_buyer].includes(user_id)) {
      throw new Error("User cannot rate this listing");
    }

    // update relevant user's rating score
    if (user_id === owner) {
      // update the buyer (seller is rating)
      const buyerRef = doc(db, 'users', selected_buyer);
      const buyerSnapshot = await getDoc(buyerRef);

      if (!buyerSnapshot.exists()) {
        throw new Error("Selected buyer not found");
      }

      const buyerData = buyerSnapshot.data() as User;
      if (buyerData) {
        if (user_id in ratings) {
          // update existing rating
          await updateDoc(buyerRef, { cum_buyer_rating: increment(rating - ratings[user_id]) });
        } else {
          // add new rating
          await updateDoc(buyerRef, { cum_buyer_rating: increment(rating), completed_purchases: increment(1) });
        }
      } else {
        throw new Error("Selected buyer data invalid");
      }
    } else if (user_id === selected_buyer) {
      // update the seller (buyer is rating)
      const sellerRef = doc(db, 'users', owner);
      const sellerSnapshot = await getDoc(sellerRef);

      if (!sellerSnapshot.exists()) {
        throw new Error("Owner not found");
      }

      const sellerData = sellerSnapshot.data() as User;
      if (sellerData) {
        if (user_id in ratings) {
          // update existing rating
          await updateDoc(sellerRef, { cum_seller_rating: increment(rating - ratings[user_id]) });
        } else {
          // add new rating
          await updateDoc(sellerRef, { cum_seller_rating: increment(rating), completed_sales: increment(1) });
        }
      } else {
        throw new Error("Owner data invalid");
      }
    }

    ratings[user_id] = rating;

    await updateDoc(listingRef, { ratings: ratings, updated: serverTimestamp() });

    return NextResponse.json({ data: { listing_id: listing_id }, error: null });
  } catch (e: unknown) {
    logger.increment('PATCH_rate_listing_API_failure');
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  } finally {
    const end = performance.now();
    logger.log(`PATCH /api/listing/{listing_id}/rate in ${end - start} ms`);
  }
}
