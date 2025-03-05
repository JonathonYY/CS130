import { NextResponse } from "next/server";
import { POST } from "../user/route";
import { GET, PATCH, DELETE } from "../user/[user_id]/route";

jest.mock("@/lib/firebase/config", () => ({
  ...jest.requireActual("@/lib/firebase/config.mock")
}));

async function clearFirestore() {
  const response = await fetch(
    `http://127.0.0.1:3001/emulator/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`,
    {
      method: 'DELETE',
    }
  );
  if (response.status !== 200) {
    throw new Error('Trouble clearing Emulator: ' + (await response.text()));
  }
}

describe("User integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearFirestore();
  });
  afterEach(async () => {
    clearFirestore();
  });
  it("should correctly handle User workflow", async () => {
    const user_id = "test_user_id";
    const user_param = Promise.resolve({ user_id: user_id });

    const req1 = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        'user_id': user_id,
        'first': 'test_first',
        'last': 'test_last',
        'email_address': 'test@g.ucla.edu',
      }),
    });
    const res1: NextResponse = await POST(req1);
    const json1 = await res1.json();
    const data1 = json1.data;
    const error1 = json1.error;

    expect(error1).toBe(null);
    expect(data1.user_id).toEqual(user_id);

    const req2 = new Request("http://localhost", {
      method: "GET",
    });
    const res2: NextResponse = await GET(req2, { params: user_param });
    const json2 = await res2.json();
    const data2 = json2.data;
    const error2 = json2.error;

    expect(error2).toBe(null);
    expect(data2).toEqual({
      first: 'test_first',
      last: 'test_last',
      email_address: 'test@g.ucla.edu',
      phone_number: '',
      active_listings: [],
      interested_listings: [],
      completed_sales: 0,
      completed_purchases: 0,
      cum_buyer_rating: 0,
      cum_seller_rating: 0,
      pfp: '',
      id: user_id,
    });

    const req3 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'first': 'test_first_patched',
        'last': 'test_last_patched',
        'pfp': 'pfp_patched',
        'phone_number': '123-456-7890'
      }),
    });
    const res3: NextResponse = await PATCH(req3, { params: user_param });
    const json3 = await res3.json();
    const data3 = json3.data;
    const error3 = json3.error;

    expect(error3).toBe(null);
    expect(data3).toEqual({
      first: 'test_first_patched',
      last: 'test_last_patched',
      email_address: 'test@g.ucla.edu',
      phone_number: '123-456-7890',
      active_listings: [],
      interested_listings: [],
      completed_sales: 0,
      completed_purchases: 0,
      cum_buyer_rating: 0,
      cum_seller_rating: 0,
      pfp: 'pfp_patched',
      id: user_id,
    });

    const req4 = new Request("http://localhost", {
      method: "GET",
    });
    const res4: NextResponse = await GET(req4, { params: user_param });
    const json4 = await res4.json();
    const data4 = json4.data;
    const error4 = json4.error;

    expect(error4).toBe(null);
    expect(data4).toEqual({
      first: 'test_first_patched',
      last: 'test_last_patched',
      email_address: 'test@g.ucla.edu',
      phone_number: '123-456-7890',
      active_listings: [],
      interested_listings: [],
      completed_sales: 0,
      completed_purchases: 0,
      cum_buyer_rating: 0,
      cum_seller_rating: 0,
      pfp: 'pfp_patched',
      id: user_id,
    });

    const req5 = new Request("http://localhost", {
      method: "DELETE",
    });
    const res5: NextResponse = await DELETE(req5, { params: user_param });
    const json5 = await res5.json();
    const data5 = json5.data;
    const error5 = json5.error;

    expect(error5).toBe(null);
    expect(data5.user_id).toEqual(user_id);

    const req6 = new Request("http://localhost", {
      method: "GET",
    });
    const res6: NextResponse = await GET(req6, { params: user_param });
    const json6 = await res6.json();
    const data6 = json6.data;
    const error6 = json6.error;

    expect(error6).toBe("user does not exist");
  });
  it("should correctly handle invalid User workflows", async () => {
    // post user
    // get wrong user
    // update wrong user
    // delete wrong user
  });
});
