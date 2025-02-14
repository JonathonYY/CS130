import { NextResponse } from "next/server";
// import [some backend call] from "@/lib/firebase/firestore/user/[something]";

// GET user by id
export async function GET(
    req: Request,
    { params }: { params: Promise<{ user_id: string }> }
  ) {
    // get the URL parameter user_id
    const user_id = (await params).user_id;
    console.log(user_id);

    // getUser from db
    // return new user and status

    return NextResponse.json({ user_id: user_id }, { status: 200 });
  }

// PATCH user by id
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  // get the URL parameter user_id
  const user_id = (await params).user_id;
  console.log(user_id);

  // get update params from body
  const data = await req.json();
  console.log(data);

  // modify user in db
  // return modified user and status

  return NextResponse.json({ user_id: user_id }, { status: 200 });
}

// DELETE user by id
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ user_id: string }> }
) {
  // get the URL parameter user_id
  const user_id = (await params).user_id;
  console.log(user_id);

  // delete user in db
  // return status

  return NextResponse.json({ status: 200 });
}
