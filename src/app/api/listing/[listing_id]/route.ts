import { NextResponse } from "next/server";
import {db} from "@/lib/firebase/config";
import { User, Listing, newListing } from "@/lib/firebase/firestore/types";
import { getDoc, doc, updateDoc, arrayRemove, deleteDoc } from "firebase/firestore";

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
    const {owner, potential_buyers} = listingData;

    if (user_id === owner) {
      const ownerRef = doc(db, 'users', owner);
      const ownerSnapshot = await getDoc(ownerRef);
      if (!ownerSnapshot.exists()) {
        // do not throw an error from API call, but log problem
        console.error(`owner ${owner} not found`);
      }
      const ownerData = ownerSnapshot.data() as User;
      if (ownerData) {
        await updateDoc(ownerRef, { active_listings: arrayRemove(listing_id) });
      } else {
        // do not throw an error from API call, but log problem
        console.error(`owner ${owner} data invalid`);
      }
      await Promise.all(potential_buyers.map(async (buyer) => {
        const buyerRef = doc(db, 'users', buyer);
        const buyerSnapshot = await getDoc(buyerRef);
        if (!buyerSnapshot.exists()) {
          // do not throw an error from API call, but log problem
          console.error(`potential buyer ${buyer} not found`);
        }
        const buyerData = buyerSnapshot.data() as User;
        if (buyerData) {
          await updateDoc(buyerRef, { interested_listings: arrayRemove(listing_id) });
        } else {
          // do not throw an error from API call, but log problem
          console.error(`owner ${owner} data invalid`);
        }
      }));
    } else {
      throw new Error("Unauthorized user");
    }

    await deleteDoc(listingRef);

    return NextResponse.json({ data: { listing_id: listing_id }, error: null });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  }
}
