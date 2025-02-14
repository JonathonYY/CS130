type User = {
    first: string,
    last: string,
    email_address: string,
    active_listings: number[], // listing_ids
    completed_sales: number,
    completed_purchases: number,
    buyer_rating: number,
    seller_rating: number,
    pfp: string,
    id: number,
}
