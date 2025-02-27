import { db } from "../../config";
import { getDocs, collection, query, limit, Timestamp, orderBy, startAt, where, WhereFilterOp } from "firebase/firestore";
import { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";
import { Listing } from "../types";
import { SearchFields, parseInput, hasParams } from "./parseInput";

function transformListing(doc: QueryDocumentSnapshot<DocumentData, DocumentData>) {
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

  // process arguments for pagination
  const q_limit = (req_limit !== undefined && !Number.isNaN(req_limit) && req_limit > 0) ? req_limit : 100; // if limit is not passed in, set to 100
  const prev_ts = (last_timestamp !== undefined && !Number.isNaN(last_timestamp)) ? Timestamp.fromMillis(last_timestamp) : Timestamp.now();
  const prev_rating = (last_timestamp !== undefined && !Number.isNaN(last_rating)) ? last_rating : 5.1;  // if no prior rating, start out of bounds

  const parsed_req: SearchFields = parseInput(req);

  if (hasParams(parsed_req)) {
    const {search_str, category, condition, owner, cmp_op, price} = parsed_req;

    const q = query(listingsRef,
                    orderBy('seller_rating', 'desc'), // order response by rating, recency
                    orderBy('updated', 'desc'),
                    limit(q_limit),
                    startAt(prev_rating, prev_ts),
                    where('selected_buyer', '==', ""),
                    where('title', '>=', search_str),
                    where('title', '<=', search_str+"\uf8ff"),
                    where('category', '>=', category),
                    where('category', '<=', category+"\uf8ff"),
                    where('condition', '>=', condition),
                    where('condition', '<=', condition+"\uf8ff"),
                    where('owner_name', '>=', owner),
                    where('owner_name', '<=', owner+"\uf8ff"),
                    where('price', (cmp_op as WhereFilterOp), price)
                  );

    result = await getDocs(q);
    result = result.docs.map((doc) => (transformListing(doc)));
  } else {
    const q = query(listingsRef,
                    orderBy('seller_rating', 'desc'),
                    orderBy('updated', 'desc'),
                    limit(q_limit),
                    startAt(prev_rating, prev_ts),
                    where('selected_buyer', '==', ""));

    result = await getDocs(q);
    result = result.docs.map((doc) => (transformListing(doc)));
  }
  return result;
}
