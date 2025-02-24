import { db } from "../../config";
import { getDocs, collection, query, limit, Timestamp, orderBy, startAt, endAt, where, or } from "firebase/firestore";
import { Listing } from "../types";

function transformListing(doc) {
  const data = doc.data() as Listing;

  return {
    updated: data.updated,
    title: data.title,
    price: data.price,
    condition: data.condition,
    category: data.category,
    description: data.description,
    owner_id: data.owner,
    thumbnail: (data.image_paths && data.image_paths.length > 0) ? data.image_paths[0] : "",
    owner_pfp: data.owner_pfp,
    owner_name: data.owner_name,
    seller_rating: data.seller_rating,
    id: doc.id
  };
}

export default async function getAllListings(req?: string, req_limit?: number, last_rating?: number, last_timestamp?: number) {
  let result;
  const listingsRef = collection(db, 'listings');

  const q_limit = (req_limit !== undefined && req_limit > 0) ? req_limit : 100; // if limit is not passed in, set to 100
  const prev_ts = (last_timestamp !== undefined) ? Timestamp.fromMillis(last_timestamp) : Timestamp.now();
  const prev_rating = (last_rating !== undefined) ? last_rating : 5.1;  // if no prior rating, start out of bounds

  if (req !== undefined) {
    // query provided
    // currently, only prefix-match on title; will add the rest of the matchers in next commit
    const q = query(listingsRef, orderBy('title'), limit(q_limit),
                    where('title', '>=', req.toLowerCase()),
                    where('title', '<=', req.toLowerCase()+"\uf8ff"));

    result = await getDocs(q);
    result = result.docs.map((doc) => (transformListing(doc)));
  } else {
    const q = query(listingsRef, orderBy('seller_rating', 'desc'), orderBy('updated', 'desc'), limit(q_limit), startAt(prev_rating, prev_ts));

    result = await getDocs(q);
    result = result.docs.map((doc) => (transformListing(doc)));
  }
  return result;
}
