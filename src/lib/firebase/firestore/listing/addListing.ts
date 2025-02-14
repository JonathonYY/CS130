import { db } from "../../config";
import { collection, addDoc } from "firebase/firestore";

export default async function addListing(data: DataToInsert) {
  let result = null;
  let error = null;

  try {
    result = await addDoc(collection(db, "listings"), data);
  } catch (e) {
    error = e;
  }

  return { result, error };
}
