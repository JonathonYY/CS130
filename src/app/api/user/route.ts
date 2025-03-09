import { NextResponse } from "next/server";
import { User, newUser, AddUserRequest } from "@/lib/firebase/firestore/types";
import { addUser } from "@/lib/firebase/firestore/user/userUtil";
import { logger } from "@/lib/monitoring/config";
import { getUidFromAuthorizationHeader } from "../util";

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
  const start = performance.now();
  try {
    // get new user data from req body
    const data: AddUserRequest = await req.json();
    const { user_id, first, last, email_address } = data;

    // check for user token — user from auth session must exist
    const authorizationHeader = req.headers.get("authorization");
    const uid = await getUidFromAuthorizationHeader(authorizationHeader);
    if (uid != user_id) {
      throw new Error("Provided user_id must match authenticated user");
    }

    // validate input for required fields
    if (!first || !last || !email_address || !user_id) {
      throw new Error("missing required fields");
    }

    const user: User = newUser();
    user.first = first;
    user.last = last;
    user.email_address = email_address;

    const id: string = await addUser(user_id, user);

    logger.increment('userCreation');

    return NextResponse.json({ data: { user_id: id }, error: null });
  } catch (e: unknown) {
    logger.increment('POST_user_API_failure');
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message});
    } else {
      return NextResponse.json({ data: null, error: "unknown error"});
    }
  } finally {
    const end = performance.now();
    logger.log(`POST /api/user in ${end - start} ms`);
  }
}
