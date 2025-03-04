import { db } from "../../config";
import { doc, getDoc } from "firebase/firestore";

export default async function getListing(doc_id: string) {
    const docRef = doc(db, "listings", doc_id);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
        throw new Error("No listing exists for given id");
    }
    let data = docSnapshot.data();

    delete data.ratings;
    delete data.reporters;

    data['id'] = doc_id;
    const result = data;

    result.id = doc_id;

    return result;
}
