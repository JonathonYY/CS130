import { NextResponse } from "next/server";
import { UpdateUserRequest } from "@/lib/firebase/firestore/types";
import { getUser, updateUser, deleteUser } from "@/lib/firebase/firestore/user/userUtil";
import { logger } from "@/lib/monitoring/config";

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
  const start = performance.now();
  try {
    // get URL parameter user_id
    const user_id: string = (await params).user_id;
    const user: { [key: string]: any } = await getUser(user_id);
    user.id = user_id;
    user.buyer_rating = user.completed_purchases ? user.cum_buyer_rating / user.completed_purchases : 3.5;
    user.seller_rating = user.completed_sales ? user.cum_seller_rating / user.completed_sales : 3.5;
    delete user.cum_buyer_rating;
    delete user.cum_seller_rating;
    delete user.completed_purchases;
    delete user.completed_sales;
    delete user.last_reported;

    return NextResponse.json({ data: user, error: null });
  } catch (e: unknown) {
    logger.increment('GET_specific_user_API_failure');
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  } finally {
    const end = performance.now();
    logger.log(`GET /api/user/{user_id} in ${end - start} ms`);
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
  const start = performance.now();
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
    user.buyer_rating = user.completed_purchases ? user.cum_buyer_rating / user.completed_purchases : 3.5;
    user.seller_rating = user.completed_sales ? user.cum_seller_rating / user.completed_sales : 3.5;
    delete user.cum_buyer_rating;
    delete user.cum_seller_rating;
    delete user.completed_purchases;
    delete user.completed_sales;
    delete user.last_reported;

    return NextResponse.json({ data: user, error: null });
  } catch (e: unknown) {
    logger.increment('PATCH_user_API_failure');
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  } finally {
    const end = performance.now();
    logger.log(`PATCH /api/user/{user_id} in ${end - start} ms`);
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
  const start = performance.now();
  try {
    // get URL parameter user_id
    const user_id: string = (await params).user_id;

    const id: string = await deleteUser(user_id);

    logger.increment('userDeletion');
    return NextResponse.json({ data: { user_id: id }, error: null });
  } catch (e: unknown) {
    logger.increment('DELETE_user_API_failure');
    if (e instanceof Error) {
      return NextResponse.json({ data: null, error: e.message });
    } else {
      return NextResponse.json({ data: null, error: "unknown error" });
    }
  } finally {
    const end = performance.now();
    logger.log(`DELETE /api/user/{user_id} in ${end - start} ms`)
  }
}
