import { db } from "../../config";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { User, newUser, AddUserRequest, UpdateUserRequest } from "../types";

export async function addUser(data: AddUserRequest): Promise<string> {
  // check if User exists
  const ref = doc(db, "users", data.user_id);
  const result = await getDoc(ref);
  if (!result.exists()) {
    // create new User object
    const user: User = newUser();
    user.first = data.first;
    user.last = data.last;
    user.email_address = data.email_address
    if (data.pfp) {
      user.pfp = data.pfp;
    }

    // set new User in db
    await setDoc(ref, user);
  }

  return ref.id;
}

export async function getUser(user_id: string): Promise<User> {
  // get User from db
  const ref = doc(db, "users", user_id);
  const result = await getDoc(ref);

  // check if User exists
  if (!result.exists()) {
    throw new Error("user does not exist");
  }

  const user: User = result.data() as User;
  user.id = ref.id;

  return user;
}

export async function updateUser(user_id: string, data: UpdateUserRequest): Promise<User> {
  // set updated User in db
  const ref = doc(db, "users", user_id);
  await updateDoc(ref, data as {[key: string]: any});

  // get updated User for return
  const result = await getDoc(ref);
  const user = result.data() as User;

  return user;
}

export async function deleteUser(user_id: string): Promise<string> {
  // delete User in db
  const ref = doc(db, "users", user_id);
  await deleteDoc(ref);

  return ref.id;
}
