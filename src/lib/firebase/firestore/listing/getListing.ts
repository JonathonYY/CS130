import { db } from "../../config";
import { doc, getDoc } from "firebase/firestore";
import { GetListingOutput } from "../types";

export default async function getListing(doc_id: string) {
    const docRef = doc(db, "listings", doc_id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
        throw new Error("No listing exists for given id");
    }
    const result = docSnapshot.data();

    delete result.ratings;
    delete result.reporters;

    result.id = doc_id;

    return result;
}
