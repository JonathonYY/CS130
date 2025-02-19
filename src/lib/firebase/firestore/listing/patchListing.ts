import { db } from "../../config";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { PatchListingData } from "../types";

export default async function patchListing(doc_id: string, data: PatchListingData) {
    let result;
    let error = null;

    const docRef = doc(db, "listings", doc_id);
    try {
        // update each entry
        await updateDoc(docRef, data as { [key: string] : any })

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