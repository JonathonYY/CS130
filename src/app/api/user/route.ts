import { NextResponse } from "next/server";
import addUser from "@/lib/firebase/firestore/user/addUser";

const { v4: uuidv4 } = require('uuid');

// POST new user
export async function POST(req: Request) {
  const { first_name, last_name, email_address, pfp } = await req.json();
  if (!first_name || !last_name || !email_address || !pfp) {
    return NextResponse.json({ result: null, error: "Missing required fields" }, { status: 400 });
  }
  // console.log(first_name, last_name, email_address, pfp);

  const user: User = {
    "first": first_name,
    "last": last_name,
    "email_address": email_address,
    "active_listings": [],
    "completed_sales": 0,
    "completed_purchases": 0,
    "buyer_rating": 0,
    "seller_rating": 0,
    "pfp": pfp, // TODO: how to handle picture upload
    "id": uuidv4(),
  };
  // console.log(user)

  const error = await addUser(user);
  
  if (error) {
    return NextResponse.json({ result: null, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ result: user, error: null }, { status: 200 });
}
