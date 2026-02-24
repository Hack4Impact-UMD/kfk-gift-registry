/* 
- Copied and pasted the scraper from https://crawlee.dev/blog/how-to-scrape-amazon
- Functions are imported from amazonHelperFunctions for clean file structure.
 */

import { CheerioAPI } from 'cheerio';
import { parseNumberFromSelector } from './amazonHelperFunctions.ts';

type ProductDetails = {
    title: string;
    price: number;
    source: string;
};

/**
 * CSS selectors for the product details. Feel free to figure out different variations of these selectors.
 */
const SELECTORS = {
    TITLE: 'span#productTitle',
    PRICE: 'span.priceToPay',
} as const;

/**
 * Scrapes the product details from the given Cheerio object.
 */
export const extractProductDetails = ($: CheerioAPI): ProductDetails => {
    const title = $(SELECTORS.TITLE).text().trim();
    const price = parseNumberFromSelector($, SELECTORS.PRICE);
    const source = "Amazon";

    return { title, price,  source};
};