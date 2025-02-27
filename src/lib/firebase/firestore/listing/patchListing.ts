import { db } from "../../config";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { PatchListingData } from "../types";

export default async function patchListing(doc_id: string, data: PatchListingData) {
    const docRef = doc(db, "listings", doc_id);
    // add timestamp to data
    let update_data = data as { [key: string] : any }
    update_data['updated'] = serverTimestamp();

    // update each entry
    await updateDoc(docRef, update_data)

    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
        const result = docSnapshot.data();
        return result;
    } else {
        throw new Error("No listing exists for given id");
    }
}