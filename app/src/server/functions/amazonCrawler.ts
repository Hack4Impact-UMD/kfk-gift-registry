import { CheerioCrawler, CheerioCrawlingContext, log } from 'crawlee';
import { extractProductDetails } from './amazonScraper.ts';
import { handleCaptchaBlocking } from './amazonHelperFunctions.ts';

/**
 * Performs the logic of the crawler. It is called for each URL to crawl.
 * - Passed to the crawler using the `requestHandler` option.
 */
const requestHandler = async (context: CheerioCrawlingContext) => {
    const { $, request } = context;
    const { url } = request;

    log.info(`Scraping product page`, { url });

    // Throw to trigger Crawlee retry when Amazon shows a captcha.
    handleCaptchaBlocking($);

    const extractedProduct = extractProductDetails($);

    log.info(`Scraped product details for "${extractedProduct.title}", saving...`, { url });
    crawler.pushData(extractedProduct);
};

/**
 * The crawler instance. Crawlee provides a few different crawlers, but we'll use CheerioCrawler, as it's very fast and simple to use.
 * - Alternatively, we could use a full browser crawler like `PlaywrightCrawler` to imitate a real browser.
 */
const crawler = new CheerioCrawler({ requestHandler });

await crawler.run(['https://www.amazon.com/dp/B0BV7XQ9V9']);