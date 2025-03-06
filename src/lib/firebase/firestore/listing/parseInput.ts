import { logger } from "@/lib/monitoring/config";

export interface SearchFields {
  search_str: string,
  category: string,
  condition: string,
  owner: string,
  cmp_op: string,
  price: number
}

export function parseInput(req?: string): SearchFields {
  const result: SearchFields = {
    search_str: '',
    category: '',
    condition: '',
    owner: '',
    cmp_op: '>=',
    price: 0
  };

  if (req === undefined) {
    return result;
  }

  logger.log(`parseInput: ${req}`);

  const sellerPattern = /seller:(([\p{Letter}\p{Mark}]+)|("([\p{Letter}\p{Mark}]+ ?)+"))/u;
  const categoryPattern = /category:(\w+)/;
  const conditionPattern = /condition:(\w+)/;
  const pricePattern = /price([<>]=?):(\d+\.?\d*)/;

  const categoryMatch = req.match(categoryPattern);
  const conditionMatch = req.match(conditionPattern);
  const priceMatch = req.match(pricePattern);

  if (conditionMatch) {
    result['condition'] = conditionMatch[1].toLowerCase();
    req = req.replace(conditionMatch[0], '');
  }

  if (categoryMatch) {
    result['category'] = categoryMatch[1].toLowerCase();
    req = req.replace(categoryMatch[0], '');
  }

  const sellerMatch = req.match(sellerPattern);
  if (sellerMatch) {
    if (sellerMatch[1].includes('"')) {
      result['owner'] = sellerMatch[1].slice(1, -1).trim().toLowerCase();
    } else {
      result['owner'] = sellerMatch[1].trim().toLowerCase();
    }
    req = req.replace(sellerMatch[0], '');
  }

  if (priceMatch) {
    result['cmp_op'] = priceMatch[1].toLowerCase();
    result['price'] = parseFloat(priceMatch[2]);
    req = req.replace(priceMatch[0], '');
  }

  result['search_str'] = req.trim().toLowerCase();

  return result;
}

export function hasParams(parsedInput: SearchFields): boolean {
  return parsedInput.search_str != '' || parsedInput.category != '' ||
         parsedInput.condition != '' || parsedInput.owner != '' ||
         parsedInput.cmp_op != '>=' || parsedInput.price != 0;
}
