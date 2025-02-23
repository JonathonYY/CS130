import {db} from "@/lib/firebase/config";
import { User, Listing } from "@/lib/firebase/firestore/types";
import { getDoc, doc, updateDoc, arrayRemove, deleteDoc } from "firebase/firestore";

export default async function deleteListing(listing_id: string, user_id: string): Promise<string> {
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
    // confirm existence of users before updating to avoid errors
    const ownerRef = doc(db, 'users', owner);
    const ownerSnapshot = await getDoc(ownerRef);
    if (!ownerSnapshot.exists()) {
      // do not throw an error, but log problem
      console.error(`owner ${owner} not found`);
    } else {
      const ownerData = ownerSnapshot.data() as User;
      if (ownerData) {
        await updateDoc(ownerRef, { active_listings: arrayRemove(listing_id) });
      } else {
        // do not throw an error, but log problem
        console.error(`owner ${owner} data invalid`);
      }
    }
    await Promise.all(potential_buyers.map(async (buyer) => {
      const buyerRef = doc(db, 'users', buyer);
      const buyerSnapshot = await getDoc(buyerRef);
      if (!buyerSnapshot.exists()) {
        // do not throw an error, but log problem
        console.error(`potential buyer ${buyer} not found`);
      } else {
        const buyerData = buyerSnapshot.data() as User;
        if (buyerData) {
          await updateDoc(buyerRef, { interested_listings: arrayRemove(listing_id) });
        } else {
          // do not throw an error, but log problem
          console.error(`owner ${owner} data invalid`);
        }
      }
    }));
  } else {
    throw new Error("Unauthorized user");
  }

  await deleteDoc(listingRef);

  return listing_id;
}
