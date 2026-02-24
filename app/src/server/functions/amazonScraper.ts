/* 
- Copied and pasted the scraper from https://crawlee.dev/blog/how-to-scrape-amazon
- Functions are imported from giftLinks.ts
 */

import { CheerioAPI } from 'cheerio';
//import { parseNumberFromSelector } from './giftLinks.ts';

type ProductAttribute = {
    label: string;
    value: string;
};

type ProductDetails = {
    title: string;
    price: number;
    listPrice: number;
    reviewRating: number;
    reviewCount: number;
    imageUrls: string[];
    attributes: ProductAttribute[];
};

/**
 * CSS selectors for the product details. Feel free to figure out different variations of these selectors.
 */
const SELECTORS = {
    TITLE: 'span#productTitle',
    PRICE: 'span.priceToPay',
    LIST_PRICE: 'span.basisPrice .a-offscreen',
    REVIEW_RATING: '#acrPopover a > span',
    REVIEW_COUNT: '#acrCustomerReviewText',
    IMAGES: '#altImages .item img',

    PRODUCT_ATTRIBUTE_ROWS: '#productOverview_feature_div tr',
    ATTRIBUTES_LABEL: 'td:nth-of-type(1) span',
    ATTRIBUTES_VALUE: 'td:nth-of-type(2) span',
} as const;

/**
 * Extracts the product image URLs from the given Cheerio object.
 * - We have to iterate over the image elements and extract the `src` attribute.
 */
const extractImageUrls = ($: CheerioAPI): string[] => {
    const imageUrls = $(SELECTORS.IMAGES)
        .map((_, imageEl) => $(imageEl).attr('src'))
        .get(); // `get()` - Retrieve all elements matched by the Cheerio object, as an array. Removes `undefined` values.

    return imageUrls;
};

/**
 * Extracts the product attributes from the given Cheerio object.
 * - We have to iterate over the attribute rows and extract both label and value for each row.
 */
const extractProductAttributes = ($: CheerioAPI): ProductAttribute[] => {
    const attributeRowEls = $(SELECTORS.PRODUCT_ATTRIBUTE_ROWS).get();

    const attributeRows = attributeRowEls.map((rowEl) => {
        const label = $(rowEl).find(SELECTORS.ATTRIBUTES_LABEL).text();
        const value = $(rowEl).find(SELECTORS.ATTRIBUTES_VALUE).text();

        return { label, value };
    });

    return attributeRows;
};

/**
 * Scrapes the product details from the given Cheerio object.
 */
/*export const extractProductDetails = ($: CheerioAPI): ProductDetails => {
    const title = $(SELECTORS.TITLE).text().trim();

    const price = parseNumberFromSelector($, SELECTORS.PRICE);
    const listPrice = parseNumberFromSelector($, SELECTORS.LIST_PRICE);
    const reviewRating = parseNumberFromSelector($, SELECTORS.REVIEW_RATING);
    const reviewCount = parseNumberFromSelector($, SELECTORS.REVIEW_COUNT);

    const imageUrls = extractImageUrls($);
    const attributes = extractProductAttributes($);

    return { title, price, listPrice, reviewRating, reviewCount, imageUrls, attributes };
};*/