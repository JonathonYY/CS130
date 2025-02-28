// __tests__/image.test.ts
import { POST } from "./route"; // Adjust the path as needed
import { NextResponse } from "next/server";

describe("/api/image", () => {
  it("should return an error if no image is provided", async () => {
    // Create a mock request object
    const mockRequest = {
      formData: () => Promise.resolve(new FormData()), // Mock formData
    } as any;

    // Call the API route's POST function
    const response = await POST(mockRequest);

    // Check response to be NextResponse
    expect(response).toBeInstanceOf(NextResponse);

    //if you want to check that the response is json, you can do this.
    const { data, error } = await response.json();
    expect(data).toBe(null);
    expect(error).toBe("No image provided");
  });
});
