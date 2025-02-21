import { NextResponse } from "next/server";
import { User } from "@/lib/firebase/firestore/types";
import { POST } from "../user/route";
import { GET, PATCH, DELETE } from "../user/[user_id]/route";

// mock firestore methods
jest.mock('@/lib/firebase/firestore/user/userUtil');

describe("User API", () => {
  it('should correctly handle GET request with mock data', async () => {
    // mock req object
    const mockReq = new Request('http://localhost/', {
        method: 'GET',
    });
    // mock params
    const user_id = "123456789";
    const mockParams = Promise.resolve({ user_id: user_id });

    const response: NextResponse = await GET(mockReq, { params: mockParams });
    const jsonResponse = await response.json();
    const user: User = jsonResponse.data;

    expect(jsonResponse.error).toBe(null);
    expect(user.id).toEqual(user_id);
  });
});
