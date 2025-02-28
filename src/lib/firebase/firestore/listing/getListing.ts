import { db } from "../../config";
import { doc, getDoc } from "firebase/firestore";

export default async function getListing(doc_id: string) {
    const docRef = doc(db, "listings", doc_id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
        let result = docSnapshot.data();

        delete result.ratings;
        delete result.reporters;

        return result;
    } else {
        throw new Error("No listing exists for given id");
    }
}
