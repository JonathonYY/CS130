import { NextResponse } from "next/server";
import {db} from "@/lib/firebase/config";
import {getDoc, doc, updateDoc} from "firebase/firestore";
import { Listing, User } from "@/lib/firebase/firestore/types";

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
  try {
    // get URL parameter listing_id
    const listing_id = (await params).listing_id;

    // get user and rating data from req body
    const { user_id, rating } = await req.json();

    // check rating is provided and valid
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      throw new Error("Must provide a rating between 1 and 5");
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
          const newCumRating = (buyerData?.cum_buyer_rating  ?? 0 ) - ratings[user_id] + rating;
          await updateDoc(buyerRef, { cum_buyer_rating: newCumRating });
        } else {
          // add new rating
          const newCumRating = (buyerData?.cum_buyer_rating ?? 0) + rating;
          const numSales = (buyerData?.completed_purchases ?? 0) + 1;
          await updateDoc(buyerRef, { cum_buyer_rating: newCumRating, completed_purchases: numSales });
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
          const newCumRating = (sellerData?.cum_seller_rating  ?? 0 ) - ratings[user_id] + rating;
          await updateDoc(sellerRef, { cum_seller_rating: newCumRating });
        } else {
          // add new rating
          const newCumRating = (sellerData?.cum_seller_rating ?? 0) + rating;
          const numSales = (sellerData?.completed_sales ?? 0) + 1;
          await updateDoc(sellerRef, { cum_seller_rating: newCumRating, completed_sales: numSales });
        }
      } else {
        throw new Error("Owner data invalid");
      }
    }

    ratings[user_id] = rating;

    await updateDoc(listingRef, {ratings: ratings});

    return NextResponse.json({ data: { listing_id: listing_id }, error: null });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message});
    } else {
      return NextResponse.json({ data: null, error: "unknown error"});
    }
  }
}
