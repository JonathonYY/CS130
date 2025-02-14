import { NextResponse } from "next/server";
import { db } from "../../../../../../lib/firebase/config";
import { getDoc, doc, updateDoc, DocumentReference } from "firebase/firestore";

interface RatingRequestBody {
    rating: number;
}

interface ListingData {
    listing_id: string;
    title: string;
    price: number;
    condition: string;
    category: string;
    description: string;
    owner: DocumentReference;
    selected_buyer: string;
    potential_buyers: [string];
    transaction_status: boolean;
    reporters: [string];
    ratings: { [user_id: string]: number };
    image_paths: [string];
}

// GET listing with matching ID
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ listing_id: string, user_id: string }> }
  ) {
    try {
        // get the URL parameters, listing_id, user_id
        const {listing_id, user_id } = await params;

        // Parse request body to get the rating
        const { rating }: RatingRequestBody = await request.json();

        // Check rating is provided and valid
        if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be a number between 1 and 5'}, {status: 400});
        }

        // References to listing and user in Firestore
        const listingRef = doc(db, 'listings', listing_id);
        const listingSnapshot = await getDoc(listingRef);

        if (!listingSnapshot.exists()) {
            return NextResponse.json({error: 'Listing not found'}, {status:404});
        }

        const listingData = listingSnapshot.data() as ListingData;
        const ratings = listingData?.ratings || {};

        // update or add the rating in the map
        ratings[user_id] = rating;

        // update the listing in Firestore
        await updateDoc(listingRef, { ratings: ratings })

        // TODO: Update buyer/seller respectively for ratings

        return NextResponse.json({ message: "Rating updated." }, { status: 200 });
    } catch (error) {
        console.error('Error updating rating:', error)
        return NextResponse.json({error: 'Internal Server Error'}, {status: 500});
    }
}