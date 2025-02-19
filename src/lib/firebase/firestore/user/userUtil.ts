import { db } from "../../config";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User, newUser } from "../types";

export async function addUser(
  first: string,
  last: string,
  email_address: string,
  user_id: string,
  pfp?: string): Promise<string> {
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

export async function getUser(user_id: string): Promise<User> {
  // check if User exists
  const ref = doc(db, "users", user_id);
  const data = await getDoc(ref);
  if (!data.exists()) {
    throw new Error("user does not exist");
  }

  const user = data.data() as User;
  if (!user) {
    throw new Error("user data invalid");
  }
  user.id = ref.id;

  return user;
}
