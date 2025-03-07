import { NextResponse } from "next/server";
import { POST as POST_user } from "../user/route";
import { GET as GET_user, PATCH as PATCH_user, DELETE as DELETE_user } from "../user/[user_id]/route";
import { POST as POST_listing } from "../listing/route";
import { GET as GET_listing, PATCH as PATCH_listing, DELETE as DELETE_listing } from "../listing/[listing_id]/route";
import { POST as POST_img } from "../image/route";
import { PATCH as PATCH_report } from "../listing/[listing_id]/report/route";
import { PATCH as PATCH_rate } from "../listing/[listing_id]/rate/route";
import { ref, getDownloadURL } from "firebase/storage";
import fs from "node:fs";

const { storage } = jest.requireMock("@/lib/firebase/config");

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

async function createUser(i: number) {
  const req = new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify({
      'user_id': `test_user_id_${i}`,
      'first': `test_first_${i}`,
      'last': `test_last_${i}`,
      'email_address': `test_${i}@g.ucla.edu`,
    }),
  });
  const res: NextResponse = await POST_user(req);
  const { data, error } = await res.json();
  return { data, error }
}

async function createListing(i: number, user_id: string) {
  const req = new Request('http://localhost', {
    method: 'POST',
    body: JSON.stringify({
      'user_id': user_id,
      'title': `test_listing_${i}`,
      'price': 100 * i,
      'condition': 'test_cond',
      'category': 'test_cat',
      'description': 'test_desc',
      'image_paths': [],
    }),
  });
  const res: NextResponse = await POST_listing(req);
  const { data, error } = await res.json();
  return { data, error };
}

describe("Integration tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearFirestore();
  });
  it("should correctly handle User workflow", async () => {
    // create user
    const { data: user_data1, error: user_error1 } = await createUser(1);
    expect(user_error1).toBe(null);
    expect(user_data1.user_id).toEqual("test_user_id_1");
    const user_id_1 = user_data1.user_id;
    const user_param_1 = Promise.resolve({ user_id: user_id_1 });

    // check user is created
    const req1 = new Request("http://localhost", {
      method: "GET",
    });
    const res1: NextResponse = await GET_user(req1, { params: user_param_1 });
    const { data: data1, error: error1 } = await res1.json();
    expect(error1).toBe(null);
    expect(data1).toEqual({
      first: 'test_first_1',
      last: 'test_last_1',
      email_address: 'test_1@g.ucla.edu',
      phone_number: '',
      active_listings: [],
      interested_listings: [],
      buyer_rating: 3.5,
      seller_rating: 3.5,
      pfp: '',
      id: user_id_1,
    });

    // patch user
    const req2 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'first': 'test_first_patched',
        'last': 'test_last_patched',
        'pfp': 'pfp_patched',
        'phone_number': '123-456-7890'
      }),
    });
    const res2: NextResponse = await PATCH_user(req2, { params: user_param_1 });
    const { data: data2, error: error2 } = await res2.json();
    expect(error2).toBe(null);
    expect(data2).toEqual({
      first: 'test_first_patched',
      last: 'test_last_patched',
      email_address: 'test_1@g.ucla.edu',
      phone_number: '123-456-7890',
      active_listings: [],
      interested_listings: [],
      buyer_rating: 3.5,
      seller_rating: 3.5,
      pfp: 'pfp_patched',
      id: user_id_1,
    });

    // check user is updated
    const req3 = new Request("http://localhost", {
      method: "GET",
    });
    const res3: NextResponse = await GET_user(req3, { params: user_param_1 });
    const { data: data3, error: error3 } = await res3.json();
    expect(error3).toBe(null);
    expect(data3).toEqual({
      first: 'test_first_patched',
      last: 'test_last_patched',
      email_address: 'test_1@g.ucla.edu',
      phone_number: '123-456-7890',
      active_listings: [],
      interested_listings: [],
      buyer_rating: 3.5,
      seller_rating: 3.5,
      pfp: 'pfp_patched',
      id: user_id_1,
    });

    // delete user
    const req4 = new Request("http://localhost", {
      method: "DELETE",
    });
    const res4: NextResponse = await DELETE_user(req4, { params: user_param_1 });
    const { data: data4, error: error4 } = await res4.json();
    expect(error4).toBe(null);
    expect(data4.user_id).toEqual(user_id_1);

    // check user is deleted
    const req5 = new Request("http://localhost", {
      method: "GET",
    });
    const res5: NextResponse = await GET_user(req5, { params: user_param_1 });
    const { error: error5 } = await res5.json();
    expect(error5).toBe("user does not exist");
  });
  it("should correctly handle invalid User workflows", async () => {
    // create user
    const { data: user_data1, error: user_error1 } = await createUser(2);
    expect(user_error1).toBe(null);
    expect(user_data1.user_id).toEqual("test_user_id_2");
    const user_id_1 = user_data1.user_id;
    const user_param_1 = Promise.resolve({ user_id: user_id_1 });

    // get invalid user
    const fake_user_param = Promise.resolve({ user_id: "fake_user_id" });
    const req1 = new Request("http://localhost", {
      method: "GET",
    });
    const res1: NextResponse = await GET_user(req1, { params: fake_user_param });
    const { error: error1 } = await res1.json();
    expect(error1).toBe("user does not exist");

    // patch invalid user
    const req2 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'first': 'test_first_patched',
        'last': 'test_last_patched',
        'pfp': 'pfp_patched',
        'phone_number': '123-456-7890'
      }),
    });
    const res2: NextResponse = await PATCH_user(req2, { params: fake_user_param });
    const { error: error2 } = await res2.json();
    expect(error2).toBe("user does not exist");

    // patch invalid user
    const req3 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'first': 'test_first_patched',
        'bad_field': 'bad_field_value',
      }),
    });
    const res3: NextResponse = await PATCH_user(req3, { params: user_param_1 });
    const { error: error3 } = await res3.json();
    expect(error3).toBe("invalid user field");

    // delete invalid user
    const req4 = new Request("http://localhost", {
      method: "DELETE",
    });
    const res4: NextResponse = await DELETE_user(req4, { params: fake_user_param });
    const { error: error4 } = await res4.json();
    expect(error4).toBe("user does not exist");
  });
  it("should correctly handle Listing workflow", async () => {
    // create 6 users so that we can delete a listing via report later
    const { data: user_data1 } = await createUser(3);
    const user_id_1 = user_data1.user_id;
    const user_param_1 = Promise.resolve({ user_id: user_id_1 });

    const { data: user_data2 } = await createUser(4);
    const user_id_2 = user_data2.user_id;
    const user_param_2 = Promise.resolve({ user_id: user_id_2 });

    const { data: user_data3 } = await createUser(5);
    const user_id_3 = user_data3.user_id;
    const user_param_3 = Promise.resolve({ user_id: user_id_3 });

    const { data: user_data4 } = await createUser(6);
    const user_id_4 = user_data4.user_id;
    const user_param_4 = Promise.resolve({ user_id: user_id_4 });

    const { data: user_data5 } = await createUser(7);
    const user_id_5 = user_data5.user_id;
    const user_param_5 = Promise.resolve({ user_id: user_id_5 });

    const { data: user_data6 } = await createUser(8);
    const user_id_6 = user_data6.user_id;

    // create two listings for user 1 and one for user 2
    const { data: listing_data1, error: listing_error1 } = await createListing(1, user_id_1);
    expect(listing_error1).toBe(null);
    const listing_id_1 = listing_data1.listing_id;
    const listing_param_1 = Promise.resolve({ listing_id: listing_id_1 });

    const { data: listing_data2, error: listing_error2 } = await createListing(2, user_id_1);
    expect(listing_error2).toBe(null);
    const listing_id_2 = listing_data2.listing_id;
    const listing_param_2 = Promise.resolve({ listing_id: listing_id_2 });

    const { data: listing_data3, error: listing_error3 } = await createListing(3, user_id_2);
    expect(listing_error3).toBe(null);
    const listing_id_3 = listing_data3.listing_id;
    const listing_param_3 = Promise.resolve({ listing_id: listing_id_3 });

    // get listings
    const req1 = new Request("http://localhost", {
      method: "GET",
    });
    const res1: NextResponse = await GET_listing(req1, { params: listing_param_1 });
    const { data: data1, error: error1 } = await res1.json();
    expect(error1).toBe(null);
    expect(data1).toMatchObject({
      'title': 'test_listing_1',
      'price': 100,
      'condition': 'test_cond',
      'category': 'test_cat',
      'description': 'test_desc',
      'owner': user_id_1,
      'owner_name': 'test_first_3 test_last_3',
      'owner_pfp': '',
      'seller_rating': 3.5,
      'selected_buyer': '',
      'potential_buyers': [],
      'image_paths': [], 
      'id': listing_id_1, 
    });

    const req2 = new Request("http://localhost", {
      method: "GET",
    });
    const res2: NextResponse = await GET_listing(req2, { params: listing_param_2 });
    const { data: data2, error: error2 } = await res2.json();
    expect(error2).toBe(null);
    expect(data2).toMatchObject({
      'title': 'test_listing_2',
      'price': 200,
      'condition': 'test_cond',
      'category': 'test_cat',
      'description': 'test_desc',
      'owner': user_id_1,
      'owner_name': 'test_first_3 test_last_3',
      'owner_pfp': '',
      'seller_rating': 3.5,
      'selected_buyer': '',
      'potential_buyers': [],
      'image_paths': [],  
      'id': listing_id_2,
    });

    const req3 = new Request("http://localhost", {
      method: "GET",
    });
    const res3: NextResponse = await GET_listing(req3, { params: listing_param_3 });
    const { data: data3, error: error3 } = await res3.json();
    expect(error3).toBe(null);
    expect(data3).toMatchObject({
      'title': 'test_listing_3',
      'price': 300,
      'condition': 'test_cond',
      'category': 'test_cat',
      'description': 'test_desc',
      'owner': user_id_2,
      'owner_name': 'test_first_4 test_last_4',
      'owner_pfp': '',
      'seller_rating': 3.5,
      'selected_buyer': '',
      'potential_buyers': [],
      'image_paths': [],  
      'id': listing_id_3,
    });

    const req4 = new Request("http://localhost", {
      method: "GET",
    });
    const res4: NextResponse = await GET_user(req4, { params: user_param_1 });
    const { data: data4, error: error4 } = await res4.json();
    expect(error4).toBe(null);
    expect(data4).toMatchObject({
      active_listings: [listing_id_1, listing_id_2],
      id: user_id_1,
    });

    // upload image
    const form = new FormData();
    const img = new Blob([fs.readFileSync('./public/logo2.png')]);
    form.append('image', img);
    const req5 = new Request("http://localhost", {
      method: "POST",
      body: form,
    });
    const res5: NextResponse = await POST_img(req5);
    const { data: data5, error: error5 } = await res5.json();
    expect(error5).toBe(null);
    expect(data5).toContain('/images');
    const img_path = data5;

    const req6 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'image_paths': [img_path],
      }),
    });
    const res6: NextResponse = await PATCH_listing(req6, { params: listing_param_1 });
    const { data: data6, error: error6 } = await res6.json();
    expect(error6).toBe(null);
    expect(data6).toMatchObject({
      image_paths: [img_path],
    });

    // update listing 1 (user 2 and 3 interested, user 2 selected)
    const req7 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'potential_buyers': [user_id_2, user_id_3],
        'selected_buyer': user_id_2,
      }),
    });
    const res7: NextResponse = await PATCH_listing(req7, { params: listing_param_1 });
    const { data: data7, error: error7 } = await res7.json();
    expect(error7).toBe(null);
    expect(data7).toMatchObject({
      potential_buyers: [user_id_2, user_id_3],
      selected_buyer: user_id_2,
    });

    // update listing 1 (user 3 not interested, user 4 and user 5 interested)
    const req8 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        'potential_buyers': [user_id_2, user_id_4, user_id_5], // must pass in entire updated list
      }),
    });
    const res8: NextResponse = await PATCH_listing(req8, { params: listing_param_1 });
    const { data: data8, error: error8 } = await res8.json();
    expect(error8).toBe(null);
    expect(data8).toMatchObject({
      potential_buyers: [user_id_2, user_id_4, user_id_5],
      selected_buyer: user_id_2,
    });

    // check user interested_listings are updated
    const get_req = new Request("http://localhost", {
      method: "GET",
    });
    const res9: NextResponse = await GET_user(get_req, { params: user_param_2 });
    const { data: data9, error: error9 } = await res9.json();
    expect(error9).toBe(null);
    expect(data9).toMatchObject({
      'interested_listings': [listing_id_1],
    });
    const res9a: NextResponse = await GET_user(get_req, { params: user_param_3 });
    const { data: data9a, error: error9a } = await res9a.json();
    expect(error9a).toBe(null);
    expect(data9a).toMatchObject({
      'interested_listings': [],
    });
    const res10: NextResponse = await GET_user(get_req, { params: user_param_4 });
    const { data: data10, error: error10 } = await res10.json();
    expect(error10).toBe(null);
    expect(data10).toMatchObject({
      'interested_listings': [listing_id_1],
    });
    const res11: NextResponse = await GET_user(get_req, { params: user_param_5 });
    const { data: data11, error: error11 } = await res11.json();
    expect(error11).toBe(null);
    expect(data11).toMatchObject({
      'interested_listings': [listing_id_1],
    });

    // user 1 and user 2 rate listing 1
    const req12 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_2,
        "rating": 4.5,
      })
    });
    const res12: NextResponse = await PATCH_rate(req12, { params: listing_param_1 });
    const { error: error12 } = await res12.json();
    expect(error12).toBe(null);

    const req13 = new Request("http://localhost", {
      method: "GET",
    });
    const res13: NextResponse = await GET_user(req13, { params: user_param_1 });
    const { data: data13, error: error13 } = await res13.json();
    expect(error13).toBe(null);
    expect(data13).toMatchObject({
      seller_rating: 4.5,
    })

    const req14 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_1,
        "rating": 3.5,
      })
    });
    const res14: NextResponse = await PATCH_rate(req14, { params: listing_param_1 });
    const { error: error14 } = await res14.json();
    expect(error14).toBe(null);

    const req15 = new Request("http://localhost", {
      method: "GET",
    });
    const res15: NextResponse = await GET_user(req15, { params: user_param_2 });
    const { data: data15, error: error15 } = await res15.json();
    expect(error15).toBe(null);
    expect(data15).toMatchObject({
      buyer_rating: 3.5,
    })

    const req14a = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_1,
        "rating": 1,
      })
    });
    const res14a: NextResponse = await PATCH_rate(req14a, { params: listing_param_1 });
    const { error: error14a } = await res14a.json();
    expect(error14a).toBe(null);

    const req15a = new Request("http://localhost", {
      method: "GET",
    });
    const res15a: NextResponse = await GET_user(req15a, { params: user_param_2 });
    const { data: data15a, error: error15a } = await res15a.json();
    expect(error15a).toBe(null);
    expect(data15a).toMatchObject({
      buyer_rating: 1,
    })

    // report listing 2 until delete (5 times)
    const req16 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_2,
      })
    });
    const res16: NextResponse = await PATCH_report(req16, { params: listing_param_2 });
    const { error: error16 } = await res16.json();
    expect(error16).toBe(null);
    const req17 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_3,
      })
    });
    const res17: NextResponse = await PATCH_report(req17, { params: listing_param_2 });
    const { error: error17 } = await res17.json();
    expect(error17).toBe(null);
    const req18 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_4,
      })
    });
    const res18: NextResponse = await PATCH_report(req18, { params: listing_param_2 });
    const { error: error18 } = await res18.json();
    expect(error18).toBe(null);
    const req19 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_5,
      })
    });
    const res19: NextResponse = await PATCH_report(req19, { params: listing_param_2 });
    const { error: error19 } = await res19.json();
    expect(error19).toBe(null);

    const req20 = new Request("http://localhost", {
      method: "PATCH",
      body: JSON.stringify({
        "user_id": user_id_6,
      })
    });
    const res20: NextResponse = await PATCH_report(req20, { params: listing_param_2 });
    const { error: error20 } = await res20.json();
    expect(error20).toBe(null);

    const req21 = new Request("http://localhost", {
      method: "GET",
    });
    const res21: NextResponse = await GET_listing(req21, { params: listing_param_2 });
    const { error: error21 } = await res21.json();
    expect(error21).toBe("No listing exists for given id");

    // delete selected user 2
    const req22 = new Request("http://localhost", {
      method: "DELETE",
    });
    const res22: NextResponse = await DELETE_user(req22, { params: user_param_2 });
    const { data: data22, error: error22 } = await res22.json();
    expect(error22).toBe(null);
    expect(data22.user_id).toEqual(user_id_2);

    // check user removed from listing potential_buyers
    const req23 = new Request("http://localhost", {
      method: "GET",
    });
    const res23: NextResponse = await GET_listing(req23, { params: listing_param_1 });
    const { data: data23, error: error23 } = await res23.json();
    expect(error23).toBe(null);
    expect(data23).toMatchObject({
      'selected_buyer': '',
      'potential_buyers': [user_id_4, user_id_5],
    });

    // check user's active listings no longer exist
    const req24 = new Request("http://localhost", {
      method: "GET",
    });
    const res24: NextResponse = await GET_listing(req24, { params: listing_param_3 });
    const { error: error24 } = await res24.json();
    expect(error24).toBe("No listing exists for given id");

    // delete listing 1
    const req25 = new Request("http://localhost", {
      method: "DELETE",
      body: JSON.stringify({
        "user_id": user_id_1,
      })
    });
    const res25: NextResponse = await DELETE_listing(req25, { params: listing_param_1 });
    const { error: error25 } = await res25.json();
    expect(error25).toBe(null);

    const req26 = new Request("http://localhost", {
      method: "GET",
    });
    const res26: NextResponse = await GET_listing(req26, { params: listing_param_1 });
    const { error: error26 } = await res26.json();
    expect(error26).toBe("No listing exists for given id");

    // check image deleted from storage
    const imgRef = ref(storage, img_path);
    await expect(getDownloadURL(imgRef)).rejects.toThrow('storage/object-not-found');

    // check listing deleted from active_listings and interested_listings
    const res27: NextResponse = await GET_user(get_req, { params: user_param_1 });
    const { data: data27, error: error27 } = await res27.json();
    expect(error27).toBe(null);
    expect(data27).toMatchObject({
      active_listings: [],
    })

    const res28: NextResponse = await GET_user(get_req, { params: user_param_4 });
    const { data: data28, error: error28 } = await res28.json();
    expect(error28).toBe(null);
    expect(data28).toMatchObject({
      interested_listings: [],
    })

    const res29: NextResponse = await GET_user(get_req, { params: user_param_5 });
    const { data: data29, error: error29 } = await res29.json();
    expect(error29).toBe(null);
    expect(data29).toMatchObject({
      interested_listings: [],
    })
  });
});
