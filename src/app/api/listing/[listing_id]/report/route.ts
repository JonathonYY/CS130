import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { getDoc, doc, updateDoc, arrayUnion, serverTimestamp, Timestamp } from "firebase/firestore";
import { Listing, User } from "@/lib/firebase/firestore/types";
import deleteListing from "@/lib/firebase/firestore/listing/deleteListing";

const time_threshold = 60000; // number of milliseconds required since last report attempt
const removal_threshold = 5; // number of reports required to autodelete listing

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

    const {reporters, owner} = listingData;

    if (reporters.includes(user_id)) {
      throw new Error("User already reported listing");
    }

    const reporterRef = doc(db, 'users', user_id);
    const reporterSnapshot = await getDoc(reporterRef);

    if (!reporterSnapshot.exists()) {
      throw new Error("User not found");
    }

    const reporterData = reporterSnapshot.data() as User;
    if (!reporterData) {
      throw new Error("User data invalid");
    }

    const {last_reported} = reporterData;

    const new_timestamp = Timestamp.now();
    if (new_timestamp.toMillis() - last_reported.toMillis() < time_threshold) {
      throw new Error("User must wait to report another listing");
    }
    await updateDoc(reporterRef, {last_reported: new_timestamp});

    if (reporters.length + 1 >= removal_threshold) {
      deleteListing(listing_id, owner);
    } else {
      await updateDoc(listingRef, { reporters: arrayUnion(user_id), updated: serverTimestamp() });
    }

    return NextResponse.json({ data: { listing_id: listing_id }, error: null });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  }
}
