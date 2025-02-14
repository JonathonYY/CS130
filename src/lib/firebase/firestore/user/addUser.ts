import { db } from "../../config";
import { doc, setDoc } from "firebase/firestore";

export default async function addUser(data: User) {
  let error = null;
  try{
    const ref = doc(db, "users", data.id);
    await setDoc(ref, data);
  } catch (e) {
    error = Error("Could not create new user");
  }
  return error;
}
