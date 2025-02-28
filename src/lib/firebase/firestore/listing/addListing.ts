import { db } from "../../config";
import { doc, collection, getDoc, addDoc, updateDoc, serverTimestamp, Timestamp, arrayUnion } from "firebase/firestore";
import { User, Listing, AddListingData } from "../types";

export default async function addListing(data: AddListingData) {
  // get user from user_id
  const userRef = doc(db, "users", data.user_id);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("No user exists for given id");
  }
  const user_data = userSnapshot.data() as User;

  // create listing
  const listing_data: Listing = {
    updated: serverTimestamp() as Timestamp,
    title: data.title.toLowerCase(),
    price: data.price,
    condition: data.condition.toLowerCase(),
    category: data.category.toLowerCase(),
    description: data.description,
    owner: data.user_id, // owner (seller) user_id
    owner_name: `${user_data.first} ${user_data.last}`.toLowerCase(),
    owner_pfp: user_data.pfp,
    seller_rating: user_data.completed_sales
                    ? user_data.cum_seller_rating / user_data.completed_sales
                    : 3.5, // default rating of 3.5
    selected_buyer: "", // buyer user_id
    potential_buyers: [], // user_ids of potential buyers
    reporters: [], // user_ids of reporters
    ratings: {}, // strings are user_ids mapped to number ratings
    image_paths: data.image_paths, // list of paths to imgs
  };

  const docRef = await addDoc(collection(db, "listings"), listing_data);
  const listing_id = docRef.id;

  const ref = doc(db, "users", data.user_id);
  await updateDoc(ref, { active_listings: arrayUnion(listing_id) });

  const result = { listing_id: listing_id };
  return result;
}
