import { type CheerioAPI } from 'cheerio';

const CAPTCHA_SELECTOR = '[action="/errors/validateCaptcha"]';

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

/**
 * Handles Amazon captcha blocking. Throws an error if a captcha is displayed.
 *
 * Notes:
 * - Crawlee automatically retries requests that throw errors (depending on request retry settings).
 */
export const handleCaptchaBlocking = ($: CheerioAPI | any) => {
    const isCaptchaDisplayed = $(CAPTCHA_SELECTOR).length > 0;
    if (isCaptchaDisplayed) throw new Error('Captcha is displayed! Retrying...');
};