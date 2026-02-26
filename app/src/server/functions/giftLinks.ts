import { createServerFn } from '@tanstack/react-start';
import axios from 'axios';
import * as cheerio from 'cheerio';

type Platform = 'amazon' | 'macys';

type FetchProductDetailsResult = {
  platform: Platform;
  productName: string;
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const AMAZON_CAPTCHA_MARKER = '[action="/errors/validateCaptcha"]';

const AMAZON_PRODUCT_URL_RE =
  /^https?:\/\/(?:www\.)?amazon\.com\/(?:[^\s?#]+\/)*(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?#].*)?$/i;

const MACYS_PRODUCT_URL_RE =
  /^https?:\/\/(?:www\.)?macys\.com\/shop\/product\/(?:[^\s?#/]+)(?:\/(?<idInPath>\d+))?(?:[/?#].*)?$/i;

function getPlatformFromUrl(rawUrl: string): Platform | null {
  if (AMAZON_PRODUCT_URL_RE.test(rawUrl)) return 'amazon';

  const m = rawUrl.match(MACYS_PRODUCT_URL_RE);
  if (m) {
    // Macy's needs an ID: either /<id> at the end of the path or ?ID=<id>
    const url = new URL(rawUrl);
    const idParam = url.searchParams.get('ID');
    const idInPath = m.groups?.idInPath;
    if (idParam || idInPath) return 'macys';
  }

  return null;
}

function assertNotBlocked(html: string) {
  if (html.includes(AMAZON_CAPTCHA_MARKER)) {
    throw new Error('Amazon blocked this request with a captcha.');
  }
  // dont have the captcha marker for macys just yet, will try to find it soon.
}

function extractAmazonProductName($: cheerio.CheerioAPI): string | null {
  const byId = $('#productTitle').first().text().trim();
  if (byId) return byId;

  const titleTag = $('title').first().text().trim();
  if (!titleTag) return null;

  // Common formats:
  // - "<name> : Amazon.com"
  // - "<name> - Amazon.com"
  const m = titleTag.match(/^(.*?)\s*(?::|-)\s*Amazon\.com\s*$/i);
  const parsed = (m?.[1] ?? titleTag).trim();
  return parsed || null;
}

function extractMacysProductName($: cheerio.CheerioAPI): string | null {
  const byH1 = $('h1.product-title span.body').first().text().trim();
  if (byH1) return byH1;

  const titleTag = $('title').first().text().trim();
  if (!titleTag) return null;

  // Common formats:
  // - "<name> - Macy's"
  // - "<name> | Macy's"
  const m = titleTag.match(/^(.*?)\s*(?:-|\|)\s*(?:Macy's|macys\.com)\s*$/i);
  const parsed = (m?.[1] ?? titleTag).trim();
  return parsed || null;
}

function extractProductName(platform: Platform, $: cheerio.CheerioAPI): string | null {
  return platform === 'amazon' ? extractAmazonProductName($) : extractMacysProductName($);
}

export const fetchProductDetails = createServerFn({ method: 'POST' })
  .inputValidator((data: { url: string }) => {
    if (!data?.url || typeof data.url !== 'string') {
      throw new Error('Product URL is required');
    }

    const url = data.url.trim();
    if (!url) throw new Error('Product URL is required');

    return { url };
  })
  .handler(async ({ data }) => {
    const { url } = data;

    const platform = getPlatformFromUrl(url);
    if (!platform) {
      throw new Error('Invalid product URL. Must be a valid amazon.com or macys.com product link.');
    }

    let html: string;
    try {
      const res = await axios.get(url, {
        headers: {
          'User-Agent': USER_AGENT,
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
          'Upgrade-Insecure-Requests': '1',
          // Some sites respond differently if there is no Referer.
          Referer: 'https://www.google.com/',
        },
        timeout: 15_000,
        maxRedirects: 5,
        validateStatus: () => true,
      });

      if (res.status < 200 || res.status >= 300) {
        if (res.status === 403) {
          throw new Error(
            `Failed to fetch product page (status 403). ${platform} likely blocked this request.`
          );
        }
        throw new Error(`Failed to fetch product page (status ${res.status})`);
      }

      html = String(res.data ?? '');
      if (!html) {
        throw new Error('Failed to fetch product page (empty response)');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      throw new Error(`Failed to fetch product page: ${message}`);
    }

    assertNotBlocked(html);

    const $ = cheerio.load(html);

    const productName = extractProductName(platform, $);
    if (!productName) {
      throw new Error(`Failed to parse product name from ${platform} product page`);
    }

    return {
      platform,
      productName,
    } satisfies FetchProductDetailsResult;
  });