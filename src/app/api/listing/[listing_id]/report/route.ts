import { NextResponse } from "next/server";
import {db} from "@/lib/firebase/config";
import {getDoc, doc, updateDoc, arrayUnion} from "firebase/firestore";
import { Listing } from "@/lib/firebase/firestore/types";

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
  try {
    // get URL parameter listing_id
    const listing_id = (await params).listing_id;

    // get reporter data from req body
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

    const {reporters} = listingData;

    if (reporters.includes(user_id)) {
      throw new Error("User already reported listing");
    }

    await updateDoc(listingRef, {reporters: arrayUnion(user_id)});

    return NextResponse.json({ data: { listing_id: listing_id }, error: null });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  }
}
