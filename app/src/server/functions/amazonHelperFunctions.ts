import { CheerioAPI } from 'cheerio';

/**
 * Parses a number from a string by removing all non-numeric characters.
 * - Keeps the decimal point.
 */
const parseNumberValue = (rawString: string): number => {
    return Number(rawString.replace(/[^\d.]+/g, ''));
};

/**
 * Parses a number value from the first element matching the given selector.
 */
export const parseNumberFromSelector = ($: CheerioAPI, selector: string): number => {
    const rawValue = $(selector).first().text();
    return parseNumberValue(rawValue);
};