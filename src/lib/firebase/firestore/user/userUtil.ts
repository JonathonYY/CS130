import { db } from "../../config";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, arrayRemove } from "firebase/firestore";
import { User, Listing } from "../types";
import deleteListing from "../listing/deleteListing";

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

export async function updateUser(user_id: string, data: { [key: string]: any }): Promise<User> {
  // get user to check if it exists
  await getUser(user_id);

  // set updated User in db
  const ref = doc(db, "users", user_id);
  await updateDoc(ref, data);

  // get updated User for return
  const result = await getDoc(ref);
  
  const user: User = result.data() as User;
  return user;
}

export async function deleteUser(user_id: string): Promise<string> {
  // get user and check if it exists
  const user: User = await getUser(user_id);

  // delete user_id from all interested listings
  await Promise.all(user.interested_listings.map(async (listing_id) => {
    // get interested listing
    const listingRef = doc(db, 'listings', listing_id);
    const result = await getDoc(listingRef);
    if (!result.exists()) {
      // warn instead of error so that remaining cleanup operation continues
      console.warn(`listing ${listing_id} not found when deleting user ${user_id} from interested listings`);
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
      console.warn(`${(e as Error).message} when deleting listing ${listing_id} from active listings of user ${user_id}`)
    }
  }));

  // delete User in db
  const ref = doc(db, "users", user_id);
  await deleteDoc(ref);

  return ref.id;
}
