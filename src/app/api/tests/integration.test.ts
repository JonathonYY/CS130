import { NextResponse } from "next/server";
import { POST as POST_user } from "../user/route";
import { GET as GET_user, PATCH as PATCH_user, DELETE as DELETE_user } from "../user/[user_id]/route";
import { POST as POST_img } from "../image/route";
import fs from "node:fs";

jest.mock("@/lib/firebase/config", () => ({
  ...jest.requireActual("@/lib/firebase/config.mock")
}));

async function clearFirestore() {
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST}/emulator/v1/projects/${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}/databases/(default)/documents`,
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
    // create user
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
    const res1: NextResponse = await POST_user(req1);
    const json1 = await res1.json();
    const data1 = json1.data;
    const error1 = json1.error;

    expect(error1).toBe(null);
    expect(data1.user_id).toEqual(user_id);

    // check user is created
    const req2 = new Request("http://localhost", {
      method: "GET",
    });
    const res2: NextResponse = await GET_user(req2, { params: user_param });
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

    // patch user
    const req3 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'first': 'test_first_patched',
        'last': 'test_last_patched',
        'pfp': 'pfp_patched',
        'phone_number': '123-456-7890'
      }),
    });
    const res3: NextResponse = await PATCH_user(req3, { params: user_param });
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

    // check user is updated
    const req4 = new Request("http://localhost", {
      method: "GET",
    });
    const res4: NextResponse = await GET_user(req4, { params: user_param });
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

    // delete user
    const req5 = new Request("http://localhost", {
      method: "DELETE",
    });
    const res5: NextResponse = await DELETE_user(req5, { params: user_param });
    const json5 = await res5.json();
    const data5 = json5.data;
    const error5 = json5.error;

    expect(error5).toBe(null);
    expect(data5.user_id).toEqual(user_id);

    // check user is deleted
    const req6 = new Request("http://localhost", {
      method: "GET",
    });
    const res6: NextResponse = await GET_user(req6, { params: user_param });
    const json6 = await res6.json();
    const data6 = json6.data;
    const error6 = json6.error;

    expect(error6).toBe("user does not exist");
  });
  it("should correctly handle invalid User workflows", async () => {
    // create user
    const user_id = "test_user_id";
    const fake_user_param = Promise.resolve({ user_id: "fake_user_id" });
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
    const res1: NextResponse = await POST_user(req1);
    const json1 = await res1.json();
    const data1 = json1.data;
    const error1 = json1.error;

    expect(error1).toBe(null);
    expect(data1.user_id).toEqual(user_id);

    // get invalid user
    const req2 = new Request("http://localhost", {
      method: "GET",
    });
    const res2: NextResponse = await GET_user(req2, { params: fake_user_param });
    const json2 = await res2.json();
    const data2 = json2.data;
    const error2 = json2.error;

    expect(error2).toBe("user does not exist");

    // patch invalid user
    const req3 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'first': 'test_first_patched',
        'last': 'test_last_patched',
        'pfp': 'pfp_patched',
        'phone_number': '123-456-7890'
      }),
    });
    const res3: NextResponse = await PATCH_user(req3, { params: fake_user_param });
    const json3 = await res3.json();
    const data3 = json3.data;
    const error3 = json3.error;

    expect(error3).toBe("user does not exist");

    // delete invalid user
    const req4 = new Request("http://localhost", {
      method: "DELETE",
    });
    const res4: NextResponse = await DELETE_user(req4, { params: fake_user_param });
    const json4 = await res4.json();
    const data4 = json4.data;
    const error4 = json4.error;

    expect(error4).toBe("user does not exist");
  });
});
describe("Listing integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearFirestore();
  });
  afterEach(async () => {
    clearFirestore();
  });
  it("should correctly handle Listing workflow", async () => {
    const data = new FormData();
    const img = new Blob([fs.readFileSync('./public/logo2.png')]);
    data.append('image', img);

    const req5 = new Request("http://localhost", {
      method: "POST",
      body: data,
    });
    const res5: NextResponse = await POST_img(req5);
  });
  it("should correctly handle invalid Listing workflows", async () => {

  });
});
