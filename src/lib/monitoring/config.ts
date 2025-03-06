import { Logger } from "./Logger";

const counters = [
  'getAllListings',
  'searchListings',
  'slowSearchListings',
  'userCreation',
  'userDeletion',
  'listingCreation',
  'listingDeletion',
  'productMatch',
  'interestedBuyers',
  'deleteReportedListing',
  'uploadedFiles',
  'POST_image_API_failure',
  'POST_user_API_failure',
  'GET_specific_user_API_failure',
  'PATCH_user_API_failure',
  'DELETE_user_API_failure',
  'POST_listing_API_failure',
  'GET_listings_API_failure',
  'GET_specific_listing_API_failure',
  'PATCH_listing_API_failure',
  'DELETE_listing_API_failure',
  'PATCH_report_listing_API_failure',
  'PATCH_rate_listing_API_failure'
]

export const logger = new Logger(counters);
