import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { logout } from "@/services/authService.client";
import { useCurrentUserProfile } from "@/hooks/queries/useCurrentUserProfile";
import { fetchProductDetails } from "@/server/functions/giftLinks";

export const Route = createFileRoute("/_authenticated/hello")({
  component: RouteComponent,
});

function RouteComponent() {
  const { auth } = Route.useRouteContext();
  const router = useRouter();
  const { data: profile, isPending, error } = useCurrentUserProfile();

  const [url, setUrl] = useState("");
  const [result, setResult] = useState<null | { platform: string; productName: string }>(null);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [isScraping, setIsScraping] = useState(false);

  const handleLogout = useCallback(async () => {
    await logout();
    router.invalidate();
  }, [router]);

  const handleScrape = useCallback(async () => {
    setIsScraping(true);
    setScrapeError(null);
    setResult(null);

    try {
      const res = await fetchProductDetails({ data: { url } });
      setResult(res);
    } catch (err) {
      setScrapeError(err instanceof Error ? err.message : "Failed to scrape");
    } finally {
      setIsScraping(false);
    }
  }, [url]);

  return (
    <div className="p-2">
      <p>Hello, {auth.authUser.displayName ?? "Unnamed User"}!</p>
      <p>Role: {auth.authUser.role}</p>
      {isPending ? (
        <p>Profile pending...</p>
      ) : error ? (
        <p>Profile error: {error.message}</p>
      ) : (
        <p>Profile ID: {profile.id}</p>
      )}

      <div className="mt-6 max-w-xl space-y-3 rounded-lg border p-4">
        <p className="font-semibold">Scrape test (Gift Links)</p>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste an Amazon or Macy's product URL"
        />
        <div className="flex gap-2">
          <Button onClick={handleScrape} disabled={isScraping || !url.trim()}>
            {isScraping ? "Scraping…" : "Test scrape"}
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setUrl("");
              setResult(null);
              setScrapeError(null);
            }}
          >
            Clear
          </Button>
        </div>

        {result && (
          <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
        {scrapeError && <p className="text-sm text-kfk-red">{scrapeError}</p>}
      </div>

      <div className="mt-4">
        <Button onClick={handleLogout}>Logout</Button>
      </div>
    </div>
  );
}
