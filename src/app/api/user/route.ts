import { NextResponse } from "next/server";
// import addUser from "@/lib/firebase/firestore/user/addUser";

const { v4: uuidv4 } = require('uuid');

// POST new user
export async function POST(req: Request) {
  const data = await req.json();
  console.log(data);

  const user: User = {
    "first": data.first_name,
    "last": data.last_name,
    "email_address": data.email_address,
    "active_listings": [],
    "completed_sales": 0,
    "completed_purchases": 0,
    "buyer_rating": 0,
    "seller_rating": 0,
    "pfp": data.pfp, // need to handle picture upload
    "id": uuidv4(),
  };
  console.log(user)

  // insert user in db
  //const { result, error } = await addUser(dataToInsert);
  const result = null; // status? inserted user?
  const error = null;
  return NextResponse.json({ result, error });
}
