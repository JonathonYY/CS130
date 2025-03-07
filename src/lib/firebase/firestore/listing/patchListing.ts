import { db } from "../../config";
import { doc, updateDoc, getDoc, serverTimestamp, arrayUnion, arrayRemove } from "firebase/firestore";
import { PatchListingData } from "../types";
import { updateUser } from "../user/userUtil";

export default async function patchListing(doc_id: string, data: Partial<PatchListingData>) {
    const docRef = doc(db, "listings", doc_id);
    const docSnapshot = await getDoc(docRef);
    if (!docSnapshot.exists()) {
        throw new Error("No listing exists for given id");
    }

    // add timestamp to data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const update_data = Object.assign({}, data as { [key: string] : any });
    update_data['updated'] = serverTimestamp();

    // make query-able fields lowercase
    ['title', 'condition', 'category', 'owner_name'].forEach((elem) => {
        if (elem in update_data) {
            update_data[elem] = update_data[elem].toLowerCase();
        }
    });
    // force native array type
    if ('image_paths' in update_data) {
        update_data['image_paths'] = [...update_data['image_paths']];
    }

    if ('potential_buyers' in update_data) {
        update_data['potential_buyers'] = [...update_data['potential_buyers']];
        const old_potential_buyers = docSnapshot.data().potential_buyers;
        const added_buyers = update_data['potential_buyers'].filter((user_id: string) => !old_potential_buyers.includes(user_id));
        await Promise.all(added_buyers.map(async (user_id: string) => {
            await updateUser(user_id, { interested_listings: arrayUnion(doc_id) });
        }));
        const removed_buyers = old_potential_buyers.filter((user_id: string) => !update_data['potential_buyers'].includes(user_id));
        await Promise.all(removed_buyers.map(async (user_id: string) => {
            await updateUser(user_id, { interested_listings: arrayRemove(doc_id) });
        }));
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
