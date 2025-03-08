import {db} from "@/lib/firebase/config";
import { User, Listing } from "@/lib/firebase/firestore/types";
import { getDoc, doc, updateDoc, arrayRemove, deleteDoc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase/config";
import { logger } from "@/lib/monitoring/config";
import { extractFilePath } from "@/lib/util";

export default async function deleteListing(listing_id: string, user_id: string): Promise<string> {
  logger.log(`deleteListing ${listing_id} called by user ${user_id}`);
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
  const {owner, potential_buyers, image_paths} = listingData;

  if (user_id === owner) {
    // confirm existence of users before updating to avoid errors
    const ownerRef = doc(db, 'users', owner);
    const ownerSnapshot = await getDoc(ownerRef);
    if (!ownerSnapshot.exists()) {
      // do not throw an error, but log problem
      logger.warn(`owner ${owner} not found`);
    } else {
      const ownerData = ownerSnapshot.data() as User;
      if (ownerData) {
        await updateDoc(ownerRef, { active_listings: arrayRemove(listing_id) });
      } else {
        // do not throw an error, but log problem
        logger.warn(`owner ${owner} data invalid`);
      }
    }
    await Promise.all(potential_buyers.map(async (buyer) => {
      const buyerRef = doc(db, 'users', buyer);
      const buyerSnapshot = await getDoc(buyerRef);
      if (!buyerSnapshot.exists()) {
        // do not throw an error, but log problem
        logger.warn(`potential buyer ${buyer} not found`);
      } else {
        const buyerData = buyerSnapshot.data() as User;
        if (buyerData) {
          await updateDoc(buyerRef, { interested_listings: arrayRemove(listing_id) });
        } else {
          // do not throw an error, but log problem
          logger.warn(`potential buyer ${buyer} data invalid`);
        }
      }
    }));
    // remove image files from storage
    await Promise.all(image_paths.map(async (img_path: string) => {
      const file_path = extractFilePath(img_path);
      const img_ref = ref(storage, file_path);
      deleteObject(img_ref).then(() => {
        logger.decrement('uploadedFiles');
      }).catch(() => {
        logger.warn(`Error deleting ${file_path}`);
      });
    }))
  } else {
    throw new Error("Unauthorized user");
  }

  await deleteDoc(listingRef);

  logger.increment('listingDeletion');
  return listing_id;
}
