import { NextResponse } from "next/server";
import { newUser } from "@/lib/firebase/firestore/types";
import { getUser } from "@/lib/firebase/firestore/user/userUtil";

/*
 * Get a User by id
 *
 * Params:
 *  user_id: id of the User to get
 * Request body:
 *  None
 * Return:
 *  data: the User object corresponding to the requested id
 *  error: error or null
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  try {
    // get URL parameter user_id
    const user_id = (await params).user_id;
    const user = await getUser(user_id);

    return NextResponse.json({ data: user, error: null });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  }
}

/*
 * Update a User by id
 *
 * Params:
 *  user_id: id of the User to get
 * Request body:
 *  first: first name [optional]
 *  last: last name [optional]
 *  pfp: path to pfp image [optional]
 * Return:
 *  data: the updated User object corresponding to the requested id
 *  error: error or null
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  // get URL parameter user_id
  const user_id = (await params).user_id;

  // get updated user data from req body
  const data = await req.json();

  // TODO: update user in db

  return NextResponse.json({ data: newUser(), error: null });
}

/*
 * Delete a User by id
 *
 * Params:
 *  user_id: id of the User to get
 * Request body:
 *  None
 * Return:
 *  data: id of the deleted User
 *  error: error or null
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  // get URL parameter user_id
  const user_id = (await params).user_id;

  // TODO: delete User in db

  return NextResponse.json({ data: { user_id: user_id }, error: null });
}
