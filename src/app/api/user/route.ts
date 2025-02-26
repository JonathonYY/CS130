import { NextResponse } from "next/server";
import { User, newUser, AddUserRequest } from "@/lib/firebase/firestore/types";
import { addUser } from "@/lib/firebase/firestore/user/userUtil";

/*
 * Create new User
 * NOP if User already exists.
 *
 * Params:
 *  None
 * Request body:
 *  user_id: global id of a User
 *  first: first name
 *  last: last name,
 *  email_address: email address
 * Return:
 *  data: id of the new User generated by firestore
 *  error: error or null
 */
export async function POST(req: Request) {
  try {
    // get new user data from req body
    const data: AddUserRequest = await req.json();
    const { user_id, first, last, email_address } = data;

    // validate input for required fields
    if (!first || !last || !email_address || !user_id) {
      throw new Error("missing required fields");
    }

    const user: User = newUser();
    user.first = first;
    user.last = last;
    user.email_address = email_address;

    const id: string = await addUser(user_id, user);

    return NextResponse.json({ data: { user_id: id }, error: null });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message});
    } else {
      return NextResponse.json({ data: null, error: "unknown error"});
    }
  }
}
