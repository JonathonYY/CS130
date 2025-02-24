import { Timestamp } from "firebase/firestore";

export interface AddListingData {
  user_id: string,
  title: string,
  price: number,
  condition: string,
  category: string,
  description: string,
  image_paths: string[], // list of paths to imgs
}

export interface PatchListingData {
  title: string,
  price: number,
  condition: string,
  category: string,
  description: string,
  selected_buyer: string, // buyer user_id
  potential_buyers: string[], // user_ids of potential buyers
  image_paths: string[], // list of paths to imgs
}

export interface Listing {
  updated: Timestamp,
  title: string,
  price: number,
  condition: string,
  category: string,
  description: string,
  owner: string, // owner (seller) user_id
  selected_buyer: string, // buyer user_id
  potential_buyers: string[], // user_ids of potential buyers
  reporters: string[], // user_ids of reporters
  ratings: { [user_id: string]: number }, // strings are user_ids mapped to number ratings
  image_paths: string[], // list of paths to imgs
	owner_pfp: string
	owner_name: string // owner first + last
	seller_rating: number // snapshot at listing creation
}

export interface User {
  first: string,
  last: string,
  email_address: string,
  active_listings: string[], // listing_ids owned by seller
  interested_listings: string[], // listing_ids owned by buyer
  completed_sales: number, // number of completed sales
  completed_purchases: number, // number of completed purchases
  cum_buyer_rating: number, // cumulative buyer rating count
  cum_seller_rating: number, // cumulative seller rating count
  pfp: string, // path to profile picture img
  id: string, // firebase user_id
}

export function newListing(): Listing {
  return {
    "updated": Timestamp.now(),
    "title": "",
    "price": 0,
    "condition": "",
    "category": "",
    "description": "",
    "owner": "",
    "selected_buyer": "",
    "potential_buyers": [],
    "reporters": [],
    "ratings": {},
    "image_paths": [],
    "id": "",
  };
}

export function newUser(): User {
  return {
    "first": "",
    "last": "",
    "email_address": "",
    "active_listings": [],
    "interested_listings": [],
    "completed_sales": 0,
    "completed_purchases": 0,
    "cum_buyer_rating": 0,
    "cum_seller_rating": 0,
    "pfp": "",
    "id": "",
  };
}
