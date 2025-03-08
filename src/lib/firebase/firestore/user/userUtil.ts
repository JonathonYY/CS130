import { db } from "../../config";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, arrayRemove } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { User, Listing } from "../types";
import deleteListing from "../listing/deleteListing";
import { logger } from "@/lib/monitoring/config";
import { storage } from "@/lib/firebase/config";
import { extractFilePath } from "@/lib/util";

export async function addUser(user_id: string, user: User): Promise<string> {
  // create User in db if not exists
  const ref = doc(db, "users", user_id);
  const result = await getDoc(ref);
  if (!result.exists()) {
    await setDoc(ref, user);
  }

  return ref.id;
}

// Gets the User associated with user_id from Firestore. Throws an error if User does not exist.
export async function getUser(user_id: string): Promise<User> {
  // get User from db
  const ref = doc(db, "users", user_id);
  const result = await getDoc(ref);

  // check if User exists
  if (!result.exists()) {
    throw new Error("user does not exist");
  }

  const user: User = result.data() as User;
  return user;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateUser(user_id: string, data: { [key: string]: any }): Promise<User> {
  // get user to check if it exists
  const orig_user = await getUser(user_id);
  if ('pfp' in data && orig_user.pfp && data['pfp'] != orig_user.pfp) {
    const file_path = extractFilePath(orig_user.pfp);
    const img_ref = ref(storage, file_path);
    deleteObject(img_ref).then(() => {
      logger.decrement('uploadedFiles');
    }).catch(() => {
      logger.warn(`Error deleting ${file_path}`);
    });
  }

  // set updated User in db
  const user_ref = doc(db, "users", user_id);
  await updateDoc(user_ref, Object.assign({}, data));

  // get updated User for return
  const result = await getDoc(user_ref);
  
  const user: User = result.data() as User;
  return user;
}

export async function deleteUser(user_id: string): Promise<string> {
  logger.log(`deleteUser: ${user_id}`);
  // get user and check if it exists
  const user: User = await getUser(user_id);

  // delete user_id from all interested listings
  await Promise.all(user.interested_listings.map(async (listing_id) => {
    // get interested listing
    const listingRef = doc(db, 'listings', listing_id);
    const result = await getDoc(listingRef);
    if (!result.exists()) {
      // warn instead of error so that remaining cleanup operation continues
      logger.warn(`listing ${listing_id} not found when deleting user ${user_id} from interested listings`);
    } else {
      // remove user_id from relevant fields
      const listing: Listing = result.data() as Listing;
      await updateDoc(listingRef, {
        "potential_buyers": arrayRemove(user_id),
        "selected_buyer": listing.selected_buyer === user_id ? "" : listing.selected_buyer,
      });
    }
  }));

  // delete all active listings owned by User with user_id
  await Promise.all(user.active_listings.map(async (listing_id) => {
    try {
      await deleteListing(listing_id, user_id);
    } catch (e: unknown) {
      logger.warn(`${(e as Error).message} when deleting listing ${listing_id} from active listings of user ${user_id}`)
    }
  }));

  // delete User's pfp if it exists
  if (user.pfp) {
    const file_path = extractFilePath(user.pfp);
    const img_ref = ref(storage, file_path);
    deleteObject(img_ref).then(() => {
      logger.decrement('uploadedFiles');
    }).catch(() => {
      logger.warn(`Error deleting ${file_path}`);
    });
  }

  // delete User in db
  const userRef = doc(db, "users", user_id);
  await deleteDoc(userRef);

  return userRef.id;
}
