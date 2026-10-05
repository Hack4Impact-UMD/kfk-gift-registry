import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { signOut } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase";
import { clearSession } from "@/server/functions/auth";
import { queries } from "@/queries";

/**
 * Keeps client firebase auth in line with the server session, which is the
 * source of truth. `sessionUid` is undefined while the session is unresolved,
 * null when there is no session.
 *
 * Everything runs in an effect, so it's a no-op during SSR and only starts
 * after hydration.
 */
export function useAuthSessionSync(sessionUid: string | null | undefined) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const prevSessionUid = useRef(sessionUid);

  useEffect(() => {
    if (sessionUid === undefined) return;

    const sessionLost = !!prevSessionUid.current && !sessionUid;
    prevSessionUid.current = sessionUid;

    let cancelled = false;

    const sync = async () => {
      // router context auth is only recomputed in beforeLoad, so re-run it to
      // let route guards redirect away from authenticated pages
      if (sessionLost) await router.invalidate();

      const auth = await getClientAuth();
      if (cancelled) return;
      const user = auth.currentUser;

      if (user && user.uid !== sessionUid) {
        await signOut(auth);
      } else if (!user && sessionUid) {
        await clearSession();
        await queryClient.invalidateQueries(queries.session.verify);
      }
    };

    sync().catch((err) => {
      console.error("Failed to sync client auth with session:");
      console.error(err);
    });

    return () => {
      cancelled = true;
    };
  }, [sessionUid, queryClient, router]);
}
