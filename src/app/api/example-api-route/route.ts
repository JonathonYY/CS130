import { NextResponse } from "next/server";

// To handle a GET request to /api
export async function GET(request: Request) {
  // Do whatever you want

  return NextResponse.json({ message: "Hello World" }, { status: 200 });
}

// To handle a POST request to /api
export async function POST(request: Request) {
  // Get the request JSON
  const requestData = await request.json();
  console.log(requestData);

  // Do whatever you want

  return NextResponse.json(
    { message: "Post Request Received!", jsonData: requestData },
    { status: 200 }
  );
}

// Same logic to add a `PUT`, `DELETE`...
