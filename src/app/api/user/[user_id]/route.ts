import { NextResponse } from "next/server";
import { User, UpdateUserRequest } from "@/lib/firebase/firestore/types";
import { getUser, updateUser, deleteUser } from "@/lib/firebase/firestore/user/userUtil";

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
    const user_id: string = (await params).user_id;
    const user: User = await getUser(user_id);

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
 *  user_id: id of the User to update
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
  try {
    // get URL parameter user_id
    const user_id: string = (await params).user_id;

    // get updated user data from req body
    const data: UpdateUserRequest = await req.json();

    // validate input
    Object.keys(data).forEach((key) => {
      if (!['first', 'last', 'pfp'].includes(key)) {
        throw new Error('invalid user field');
      }
    })

    const user: User = await updateUser(user_id, data);

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
 * Delete a User by id
 *
 * Params:
 *  user_id: id of the User to delete
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
  try {
    // get URL parameter user_id
    const user_id: string = (await params).user_id;

    const id: string = await deleteUser(user_id);

    return NextResponse.json({ data: { user_id: id }, error: null });
  } catch (e: unknown) {
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  }
}
