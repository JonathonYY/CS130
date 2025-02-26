import { Timestamp } from "firebase/firestore";

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
  owner_pfp: string,
  owner_name: string, // owner first + last
  seller_rating: number // snapshot from listing creation/update
}

export interface User {
  first: string,
  last: string,
  email_address: string,
  phone_number: string, // empty string if not provided (default to email)
  active_listings: string[], // listing_ids owned by seller
  interested_listings: string[], // listing_ids owned by buyer
  completed_sales: number, // number of completed sales
  completed_purchases: number, // number of completed purchases
  cum_buyer_rating: number, // cumulative buyer rating count
  cum_seller_rating: number, // cumulative seller rating count
  last_reported: Timestamp,
  pfp: string, // path to profile picture img
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
    "owner_pfp": "",
    "owner_name": "",
    "seller_rating": 0
  };
}

export function newUser(): User {
  return {
    "first": "",
    "last": "",
    "email_address": "",
    "phone_number": "",
    "active_listings": [],
    "interested_listings": [],
    "completed_sales": 0,
    "completed_purchases": 0,
    "cum_buyer_rating": 0,
    "cum_seller_rating": 0,
    "last_reported": Timestamp.fromMillis(0),
    "pfp": "",
  };
}

export interface AddUserRequest {
  user_id: string,
  first: string,
  last: string,
  email_address: string,
}

export interface UpdateUserRequest {
  first?: string,
  last?: string,
  phone_number?: string,
  pfp?: string,
}
