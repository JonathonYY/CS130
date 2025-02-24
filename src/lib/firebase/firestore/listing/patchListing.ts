import { db } from "../../config";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { PatchListingData } from "../types";

export default async function patchListing(doc_id: string, data: PatchListingData) {
    let result;
    let error = null;

    const docRef = doc(db, "listings", doc_id);
    try {
        // add timestamp to data
        let update_data = data as { [key: string] : any }
        update_data['updated'] = serverTimestamp();

        // update each entry
        await updateDoc(docRef, update_data)

        result = await getDoc(docRef);

        if (result.exists()) {
            result = result.data();
        } else {
            throw new Error("No listing exists for given id");
        }
    } catch (err) {
        error = err;
    }

    return { result, error };
}