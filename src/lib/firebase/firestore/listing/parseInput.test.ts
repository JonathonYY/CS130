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
      condition: 'NEW',
      category: 'FURNITURE',
      owner: 'DAVID',
      price: 100,
      cmp_op: '>',
      search_str: 'SEARCH STRING HERE'
    }
    expect(res1).toEqual(exp_res1);
    expect(hasParams(res1)).toBe(true);

    const i2 = 'search_with&^characters seller:"Alice Jones" price<:80.17 category:Food split';
    const res2 = parseInput(i2);
    const exp_res2: SearchFields = {
      condition: '',
      category: 'FOOD',
      owner: 'ALICE JONES',
      price: 80.17,
      cmp_op: '<',
      // note splitting search is possible, but will likely not give desired results
      search_str: 'SEARCH_WITH&^CHARACTERS    SPLIT'
    }
    expect(res2).toEqual(exp_res2);
    expect(hasParams(res2)).toBe(true);

    const i3 = " price>=:190 condition:UseD seller:José ";
    const res3 = parseInput(i3);
    const exp_res3: SearchFields = {
      condition: 'USED',
      category: '',
      owner: 'JOSÉ',
      price: 190,
      cmp_op: '>=',
      search_str: ''
    }
    expect(res3).toEqual(exp_res3);
    expect(hasParams(res3)).toBe(true);

    const i4 = "condition:DAMAGED price<=:007 SEARCH in middle category:furniture";
    const res4 = parseInput(i4);
    const exp_res4: SearchFields = {
      condition: 'DAMAGED',
      category: 'FURNITURE',
      owner: '',
      price: 7,
      cmp_op: '<=',
      search_str: 'SEARCH IN MIDDLE'
    }
    expect(res4).toEqual(exp_res4);
    expect(hasParams(res4)).toBe(true);

    const i5 = "price>>=:100 condition:new category:furniture seller:David";
    const res5 = parseInput(i5);
    const exp_res5: SearchFields = {
      condition: 'NEW',
      category: 'FURNITURE',
      owner: 'DAVID',
      price: 0,
      cmp_op: '>=',
      search_str: 'PRICE>>=:100'
    }
    expect(res5).toEqual(exp_res5);
    expect(hasParams(res5)).toBe(true);

    const i6 = "TEST SEARCH STR seller:David condition:new category:furniture";
    const res6 = parseInput(i6);
    const exp_res6: SearchFields = {
      condition: 'NEW',
      category: 'FURNITURE',
      owner: 'DAVID',
      price: 0,
      cmp_op: '>=',
      search_str: 'TEST SEARCH STR'
    }
    expect(res6).toEqual(exp_res6);
    expect(hasParams(res6)).toBe(true);

    // confirm quotes required for multi-word name
    const i7 = "TEST SEARCH STR seller:David Johnson condition:new category:furniture";
    const res7 = parseInput(i7);
    const exp_res7: SearchFields = {
      condition: 'NEW',
      category: 'FURNITURE',
      owner: 'DAVID',
      price: 0,
      cmp_op: '>=',
      search_str: 'TEST SEARCH STR  JOHNSON'
    }
    expect(res7).toEqual(exp_res7);
    expect(hasParams(res7)).toBe(true);

    const i8 = 'seller:"FIRST MIDDLE LAST " condition:new category:furniture';
    const res8 = parseInput(i8);
    const exp_res8: SearchFields = {
      condition: 'NEW',
      category: 'FURNITURE',
      owner: 'FIRST MIDDLE LAST',
      price: 0,
      cmp_op: '>=',
      search_str: ''
    }
    expect(res8).toEqual(exp_res8);
    expect(hasParams(res8)).toBe(true);
  });

  it("Should register as having no params on empty search", async () => {
    expect(hasParams(parseInput(undefined))).toBe(false);
    expect(hasParams(parseInput(""))).toBe(false);
  });
});
