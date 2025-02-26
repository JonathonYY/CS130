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
    const user: { [key: string]: any } = await getUser(user_id);
    user.id = user_id;
    delete user.last_reported;

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
 *  first?: first name
 *  last?: last name
 *  phone_number?: phone number
 *  pfp?: path to pfp image
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

    // validate input for only valid fields
    Object.keys(data).forEach((key) => {
      if (!['first', 'last', 'phone_number', 'pfp'].includes(key)) {
        throw new Error('invalid user field');
      }
    })

    const user: { [key: string]: any } = await updateUser(user_id, data);
    user.id = user_id;
    delete user.last_reported;

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
