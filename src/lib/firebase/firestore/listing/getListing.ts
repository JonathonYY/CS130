import { db } from "../../config";
import { collection, getDoc, doc, getDocs } from "firebase/firestore";

export default async function getListing(doc_id: string) {
    let result;
    let error = null;

    const docRef = doc(db, "listings", doc_id);
    try {
        result = await getDoc(docRef);

        if (result.exists()) {
            result = result.data();
            console.log("Document data: ", result.data());
        } else {
            console.log("No document exists");
        }
    } catch (err) {
        error = err;
    }

    return { result, error };
}