import { db } from "../../config";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { PatchListingData } from "../types";

export default async function patchListing(doc_id: string, data: Partial<PatchListingData>) {
    const docRef = doc(db, "listings", doc_id);
    // add timestamp to data
    let update_data = data as { [key: string] : any };
    update_data['updated'] = serverTimestamp();

    // make query-able fields lowercase
    ['title', 'condition', 'category', 'owner_name'].forEach((elem) => {
        if (elem in update_data) {
            update_data[elem] = update_data[elem].toLowerCase();
        }
    });

    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
        throw new Error("No listing exists for given id");
    }

    await updateDoc(docRef, update_data)
    const docSnapshot2 = await getDoc(docRef);

    if (!docSnapshot2.exists()) {
        throw new Error("No listing exists for given id");
    }

    const result = docSnapshot2.data();
    delete result.ratings;
    delete result.reporters;

    return result;
}
