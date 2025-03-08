import { Logger } from "./Logger";
import { deleteOldListings } from "../firebase/firestore/listing/deleteListing";
import { ToadScheduler, SimpleIntervalJob, AsyncTask, CronJob } from 'toad-scheduler';

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

const scheduler = new ToadScheduler()
const autodelete_task = new AsyncTask(
    'autodelete old listings',
    () => deleteOldListings(),
    (e: Error) => { logger.warn("failed to autodelete old listings"); },
);
const job = new CronJob({ cronExpression: "0 0 * * *" }, autodelete_task);
scheduler.addCronJob(job);
