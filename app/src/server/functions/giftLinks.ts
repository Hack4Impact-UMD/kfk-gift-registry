import { createServerFn } from '@tanstack/react-start';
import axios from 'axios';

type Platform = 'amazon' | 'macys' | null;

type FetchProductDetailsResult = {
  platform: Platform;
  productName?: string;
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Accepts:
// - https://www.amazon.com/dp/<ASIN>
// - https://www.amazon.com/<slug>/dp/<ASIN>
// - https://www.amazon.com/gp/product/<ASIN>
const AMAZON_PRODUCT_URL_RE =
  /^https?:\/\/(?:www\.)?amazon\.com\/(?:[^\s?#/]+\/)?(?:dp|gp\/product)\/([A-Z0-9]{10})(?:[/?#].*)?$/i;

// Accepts common Macy's product URLs like:
// - https://www.macys.com/shop/product/<slug>?ID=<id>
// - https://www.macys.com/shop/product/<slug>/<id>
const MACYS_PRODUCT_URL_RE =
  /^https?:\/\/(?:www\.)?macys\.com\/shop\/product\/(?:[^\s?#/]+)(?:\/(?<idInPath>\d+))?(?:[/?#].*)?(?:\?|#|$)/i;

const getPlatformFromUrl = (url: string): Platform => {
  if (AMAZON_PRODUCT_URL_RE.test(url)) return 'amazon';

  if (MACYS_PRODUCT_URL_RE.test(url)) {
    // Require an ID either in the path or as ?ID=12345
    const u = new URL(url);
    const idParam = u.searchParams.get('ID');
    const m = url.match(MACYS_PRODUCT_URL_RE);
    const idInPath = (m?.groups as any)?.idInPath as string | undefined;

    if (idParam || idInPath) return 'macys';
  }

  return null;
};

export const fetchProductDetails = createServerFn({ method: 'POST' })
  .inputValidator((data: { url: string }) => {
    if (!data?.url || typeof data.url !== 'string') {
      throw new Error('Product URL is required');
    }
    return { url: data.url.trim() };
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
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        timeout: 15_000,
        validateStatus: () => true,
      });

      if (res.status < 200 || res.status >= 300) {
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

    void html;

    return {
      platform,
    } satisfies FetchProductDetailsResult;
  });