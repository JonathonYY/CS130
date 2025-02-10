import { db } from "../../config";
import { collection, addDoc } from "firebase/firestore";

// defining a typescript type for data
interface DataToInsert {
  name: string;
  description: string;
}

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
