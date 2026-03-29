import { useCallback, useState } from "react";
import type { AuthContextAuthenticated } from "@/server/auth.ts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineEditInput } from "@/components/ui/inline-edit-input";
import {
  e164ToDisplay,
  formatPhoneDisplay,
  formatToE164,
} from "@/components/ui/phone-input";
import { useUpdateUserProfile } from "@/hooks/mutations/useUpdateUserProfile";
import { useRouter } from "@tanstack/react-router";
import { ReauthAlertDialog } from "../auth/ReauthAlertDialog";
import { verifyBeforeUpdateEmail } from "firebase/auth";
import { getClientAuth } from "@/lib/firebase.client";

export function ContactInfoSection({
  authCtx,
}: {
  authCtx: AuthContextAuthenticated;
}) {
  const { mutate: updateProfile } = useUpdateUserProfile();
  const [editingPhone, setEditingPhone] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [phoneLocal, setPhoneLocal] = useState(() =>
    e164ToDisplay(authCtx.authUser.phone ?? ""),
  );
  const [email, setEmail] = useState(authCtx.authUser.email ?? "");
  const [showReauth, setShowReauth] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const router = useRouter();

  const handlePhoneSave = useCallback(() => {
    updateProfile(
      {
        userId: authCtx.authUser.uid,
        updates: {
          phone: formatToE164(phoneLocal),
        },
      },
      {
        onError: (err) => {
          //TODO: replace with toast
          console.error(err);
          setPhoneLocal(e164ToDisplay(authCtx.authUser.phone ?? ""));
        },
        onSuccess: () => {
          //TODO: replace with toast
          console.log("worked");
          router.invalidate();
        },
        onSettled: () => {
          setEditingPhone(false);
        },
      },
    );
  }, [updateProfile, authCtx, phoneLocal, router]);

  const handleUpdateEmail = useCallback(async () => {
    try {
      const auth = await getClientAuth();
      if (!auth.currentUser) throw new Error("not authenticated");
      await verifyBeforeUpdateEmail(auth.currentUser, email);
      console.log("update link sent");
      setEmail(authCtx.authUser.email ?? "");
      setPendingVerification(true);
      setShowReauth(false);
    } catch (err) {
      //TODO: toast
      console.error(err);
    }
  }, [email, authCtx]);

  return (
    <Card className="rounded-lg border-3 border-kfk-light-blue">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Contact Information</CardTitle>
      </CardHeader>

      <CardContent className="gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-md font-semibold">Email</label>
            <InlineEditInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              editing={editingEmail}
              onEditClick={() => {
                setPendingVerification(false);
                setEditingEmail(true);
              }}
              onSaveClick={() => {
                if (email === authCtx.authUser.email) {
                  setEditingEmail(false);
                  return;
                }
                setShowReauth(true);
                setEditingEmail(false);
              }}
            />
            {pendingVerification && (
              <span className="text-xs text-amber-600">
                Verification email sent — check your inbox to confirm the
                change.
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-md font-semibold">Phone Number</label>
            <InlineEditInput
              value={phoneLocal}
              onChange={(e) =>
                setPhoneLocal(formatPhoneDisplay(e.target.value))
              }
              editing={editingPhone}
              onEditClick={() => setEditingPhone(true)}
              onSaveClick={handlePhoneSave}
            />
          </div>
        </div>
      </CardContent>
      <ReauthAlertDialog
        open={showReauth}
        authCtx={authCtx}
        onConfirmed={handleUpdateEmail}
        onFail={() => {
          setEmail(authCtx.authUser.email ?? "");
          setShowReauth(false);
        }}
      />
    </Card>
  );
}
