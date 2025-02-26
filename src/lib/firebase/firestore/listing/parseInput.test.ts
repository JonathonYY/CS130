import { SearchFields, parseInput, hasParams } from "./parseInput";

describe("Extract search params from input", () => {
  it("Should properly handle missing input", async () => {
    const exp: SearchFields = {
      search_str: '',
      category: '',
      condition: '',
      owner: '',
      cmp_op: '>=',
      price: 0
    }
    const result = parseInput(undefined);
    expect(result).toEqual(exp);

    const result2 = parseInput("");
    expect(result2).toEqual(exp);
  });

  it("Should extract parameters based on optional fields", async () => {
    const i1 = "search string here price>:100 condition:new category:furniture seller:David";
    const res1 = parseInput(i1);
    const exp_res1: SearchFields = {
      condition: 'new',
      category: 'furniture',
      owner: 'david',
      price: 100,
      cmp_op: '>',
      search_str: 'search string here'
    }
    expect(res1).toEqual(exp_res1);
    expect(hasParams(res1)).toBe(true);

    const i2 = "search_with&^characters seller:Alice Jones price<:80.17 category:Food split";
    const res2 = parseInput(i2);
    const exp_res2: SearchFields = {
      condition: '',
      category: 'food',
      owner: 'alice jones',
      price: 80.17,
      cmp_op: '<',
      // note splitting search is possible, but will likely not give desired results
      search_str: 'search_with&^characters    split'
    }
    expect(res2).toEqual(exp_res2);
    expect(hasParams(res2)).toBe(true);

    const i3 = " price>=:190 condition:UseD seller:José ";
    const res3 = parseInput(i3);
    const exp_res3: SearchFields = {
      condition: 'used',
      category: '',
      owner: 'josé',
      price: 190,
      cmp_op: '>=',
      search_str: ''
    }
    expect(res3).toEqual(exp_res3);
    expect(hasParams(res3)).toBe(true);

    const i4 = "condition:DAMAGED price<=:007 SEARCH in middle category:furniture";
    const res4 = parseInput(i4);
    const exp_res4: SearchFields = {
      condition: 'damaged',
      category: 'furniture',
      owner: '',
      price: 7,
      cmp_op: '<=',
      search_str: 'search in middle'
    }
    expect(res4).toEqual(exp_res4);
    expect(hasParams(res4)).toBe(true);

    const i5 = "price>>=:100 condition:new category:furniture seller:David";
    const res5 = parseInput(i5);
    const exp_res5: SearchFields = {
      condition: 'new',
      category: 'furniture',
      owner: 'david',
      price: 0,
      cmp_op: '>=',
      search_str: 'price>>=:100'
    }
    expect(res5).toEqual(exp_res5);
    expect(hasParams(res5)).toBe(true);

    const i6 = "TEST SEARCH STR seller:David condition:new category:furniture";
    const res6 = parseInput(i6);
    const exp_res6: SearchFields = {
      condition: 'new',
      category: 'furniture',
      owner: 'david',
      price: 0,
      cmp_op: '>=',
      search_str: 'test search str'
    }
    expect(res6).toEqual(exp_res6);
    expect(hasParams(res6)).toBe(true);
  });

  it("Should register as having no params on empty search", async () => {
    expect(hasParams(parseInput(undefined))).toBe(false);
    expect(hasParams(parseInput(""))).toBe(false);
  });
});
