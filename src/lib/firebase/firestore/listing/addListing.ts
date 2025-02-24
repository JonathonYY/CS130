import { db } from "../../config";
import { doc, collection, getDoc, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { User, Listing, AddListingData } from "../types";

export default async function addListing(data: AddListingData) {
  let result;
  let error = null;

  try {
    // get user from user_id
    let userRef = doc(db, "users", data.user_id);
    let user = await getDoc(userRef);
    let user_data: User

    if (user.exists()) {
      user_data = user.data() as User;
    } else {
      throw new Error("No user exists for given id");
    }

    // create listing
    let listing_data: Listing = {
      updated: serverTimestamp() as Timestamp,
      title: data.title,
      price: data.price,
      condition: data.condition,
      category: data.category,
      description: data.description,
      owner: data.user_id, // owner (seller) user_id
      selected_buyer: "", // buyer user_id
      potential_buyers: [], // user_ids of potential buyers
      reporters: [], // user_ids of reporters
      ratings: {}, // strings are user_ids mapped to number ratings
      image_paths: data.image_paths, // list of paths to imgs
      owner_pfp: user_data.pfp,
      owner_name: `${user_data.first} ${user_data.last}`,
      seller_rating: user_data.cum_seller_rating,
    }

    const docRef = await addDoc(collection(db, "listings"), listing_data);

    result = { listing_id: docRef.id };
  } catch (err) {
    error = err;
  }

  return { result, error };
}