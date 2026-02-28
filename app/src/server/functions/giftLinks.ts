import { createServerFn } from '@tanstack/react-start';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import * as cheerio from 'cheerio';
import { CookieJar } from 'tough-cookie';

type Platform = 'amazon' | 'macys';

type FetchProductDetailsResult = {
  platform: Platform;
  productName: string;
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Macy's bot filtering seems more strict; pairing a macOS has "better" fingerprint consistency.
const MACYS_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const AMAZON_CAPTCHA_MARKER = '[action="/errors/validateCaptcha"]';

const AMAZON_PRODUCT_URL_RE =
  /^https?:\/\/(?:www\.)?amazon\.com\/(?:[^\s?#]+\/)*(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[\/?#].*)?$/i;

const MACYS_PRODUCT_URL_RE =
  /^https?:\/\/(?:www\.)?macys\.com\/shop\/product\/(?:[^\s?#/]+)(?:\/(?<idInPath>\d+))?(?:[\/?#].*)?$/i;

function getPlatformFromUrl(rawUrl: string): Platform | null {
  if (AMAZON_PRODUCT_URL_RE.test(rawUrl)) return 'amazon';

  const m = rawUrl.match(MACYS_PRODUCT_URL_RE);
  if (!m) return null;

  const url = new URL(rawUrl);
  const idParam = url.searchParams.get('ID');
  const idInPath = m.groups?.idInPath;
  return idParam || idInPath ? 'macys' : null;
}

function assertNotBlocked(html: string) {
  if (html.includes(AMAZON_CAPTCHA_MARKER)) {
    throw new Error('Amazon blocked this request with a captcha.');
  }
}

function extractAmazonProductName($: cheerio.CheerioAPI): string | null {
  const byId = $('#productTitle').first().text().trim();
  if (byId) return byId;

  const titleTag = $('title').first().text().trim();
  if (!titleTag) return null;

  const m = titleTag.match(/^(.*?)\s*(?::|-)\s*Amazon\.com\s*$/i);
  return (m?.[1] ?? titleTag).trim() || null;
}

function extractMacysProductName($: cheerio.CheerioAPI): string | null {
  const byH1 = $('h1.product-title span.body').first().text().trim();
  if (byH1) return byH1;

  const titleTag = $('title').first().text().trim();
  if (!titleTag) return null;

  const m = titleTag.match(/^(.*?)\s*(?:-|\|)\s*(?:Macy's|macys\.com)\s*$/i);
  return (m?.[1] ?? titleTag).trim() || null;
}

function extractProductName(platform: Platform, $: cheerio.CheerioAPI): string | null {
  return platform === 'amazon' ? extractAmazonProductName($) : extractMacysProductName($);
}

function getBrowserLikeHeaders(platform: Platform, url: string): Record<string, string> {
  const isMacys = platform === 'macys';

  const headers: Record<string, string> = {
    'User-Agent': isMacys ? MACYS_USER_AGENT : USER_AGENT,
    Accept:
      'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    Pragma: 'no-cache',
    'Upgrade-Insecure-Requests': '1',
    Referer: isMacys ? 'https://www.macys.com/' : 'https://www.google.com/',
    Connection: 'keep-alive',
  };

  if (!isMacys) return headers;

  return {
    ...headers,
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-User': '?1',
    'sec-ch-ua': '"Chromium";v="120", "Google Chrome";v="120", "Not:A-Brand";v="99"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    Origin: new URL(url).origin,
  };
}

function toHtmlOrThrow(status: number, data: unknown, platform: Platform): string {
  if (status < 200 || status >= 300) {
    if (status === 403) {
      throw new Error(`Failed to fetch product page (status 403). ${platform} likely blocked this request.`);
    }
    throw new Error(`Failed to fetch product page (status ${status})`);
  }

  const html = String(data ?? '');
  if (!html) throw new Error('Failed to fetch product page (empty response)');
  return html;
}

async function fetchHtmlWithAxios(url: string, platform: Platform): Promise<string> {
  const common = {
    headers: getBrowserLikeHeaders(platform, url),
    timeout: platform === 'macys' ? 20_000 : 15_000,
    maxRedirects: 5,
    validateStatus: () => true,
  };

  if (platform !== 'macys') {
    const res = await axios.get(url, common);
    return toHtmlOrThrow(res.status, res.data, platform);
  }

  // Macy's: use wrapper + CookieJar so cookies persist across requests
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar, withCredentials: true, validateStatus: () => true, maxRedirects: 5 }));

  // Macy's: warm up session cookies by requesting the homepage first
  await client.get('https://www.macys.com/', {
    ...common,
    headers: getBrowserLikeHeaders('macys', 'https://www.macys.com/'),
  });

  const res = await client.get(url, common);
  return toHtmlOrThrow(res.status, res.data, platform);
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
      html = await fetchHtmlWithAxios(url, platform);
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

    return { platform, productName } satisfies FetchProductDetailsResult;
  });