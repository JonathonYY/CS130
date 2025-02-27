import { db } from "../../config";
import { doc, getDoc } from "firebase/firestore";

export default async function getListing(doc_id: string) {
    const docRef = doc(db, "listings", doc_id);
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
        const data = docSnapshot.data();

        const desired_fields = [
            "updated",
            "title",
            "price",
            "condition",
            "category",
            "description",
            "owner",
            "owner_name",
            "owner_pfp",
            "seller_rating",
            "selected_buyer",
            "potential_buyers",
            "image_paths"
        ];
        let result: any = {};
        desired_fields.forEach(field => {
            if (data.hasOwnProperty(field)) {  // Check if the object contains the field
                result[field] = data[field];
            }
            else {
                throw new Error("Missing field.");
            }
        });

        return result;
    } else {
        throw new Error("No listing exists for given id");
    }
}