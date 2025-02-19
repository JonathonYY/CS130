import { db } from "../../config";
import { doc, getDoc } from "firebase/firestore";

export default async function getListing(doc_id: string) {
    let result;
    let error = null;

    const docRef = doc(db, "listings", doc_id);
    try {
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