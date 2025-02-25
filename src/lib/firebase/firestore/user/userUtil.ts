import { db } from "../../config";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { User } from "../types";

export async function addUser(user_id: string, user: User): Promise<string> {
  // create User in db if not exists
  const ref = doc(db, "users", user_id);
  const result = await getDoc(ref);
  if (!result.exists()) {
    await setDoc(ref, user);
  }

  return ref.id;
}

// Gets the User associated with user_id from Firestore. Throws an error if User does not exist.
export async function getUser(user_id: string): Promise<User> {
  // get User from db
  const ref = doc(db, "users", user_id);
  const result = await getDoc(ref);

  // check if User exists
  if (!result.exists()) {
    throw new Error("user does not exist");
  }

  const user: User = result.data() as User;
  return user;
}

export async function updateUser(user_id: string, data: { [key: string]: any }): Promise<User> {
  // get user to check if it exists
  await getUser(user_id);

  // set updated User in db
  const ref = doc(db, "users", user_id);
  await updateDoc(ref, data);

  // get updated User for return
  const result = await getDoc(ref);
  
  const user: User = result.data() as User;
  return user;
}

export async function deleteUser(user_id: string): Promise<string> {
  // get user to check if it exists
  await getUser(user_id);

  // delete User in db
  const ref = doc(db, "users", user_id);

  // TODO: should delete all listings in active_listings and remove user_id from potential_buyers in all interested_listings
  await deleteDoc(ref);

  return ref.id;
}
