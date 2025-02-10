import { db } from "../../config";
import { getDocs, collection } from "firebase/firestore";

export default async function getAllListings() {
  let result,
    error = null;

  try {
    result = await getDocs(collection(db, "listings"));
    result = result.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
  } catch (err) {
    error = err;
  }

  return { result, error };
}
