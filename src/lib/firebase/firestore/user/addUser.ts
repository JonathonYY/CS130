import { db } from "../../config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User, newUser } from "../types";

export default async function addUser(
  first: string,
  last: string,
  email_address: string,
  user_id: string,
  pfp?: string) {
    // check if User exists
    const ref = doc(db, "users", user_id);
    const data = await getDoc(ref);
    if (!data.exists()) {
      // create new User object
      const user: User = newUser();
      user.first = first;
      user.last = last;
      user.email_address = email_address
      if (pfp) {
        user.pfp = pfp;
      }

      // set User in db
      console.log("adding user to db");
      await setDoc(ref, user);
    }

    return ref.id;
}
