import { sendPasswordResetEmail } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineEditInput } from "@/components/ui/inline-edit-input";
import { getClientAuth } from "@/lib/firebase.client";
import type { AuthContextAuthenticated } from "@/server/functions/auth";

export function AccountDetailsSection({
  authCtx,
}: {
  authCtx: AuthContextAuthenticated;
}) {
  const handlePasswordReset = async () => {
    const auth = await getClientAuth();
    try {
      if (!authCtx.authUser.email) throw new Error("Email not available");
      await sendPasswordResetEmail(auth, authCtx.authUser.email);
    } catch (err) {
      //TODO: replace with toast
      console.error(err);
    }
  };
  return (
    <Card className="rounded-lg border-3 border-kfk-light-blue">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">Account Details</CardTitle>
      </CardHeader>

      <CardContent className="gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-md font-semibold">Password</label>

          <InlineEditInput
            type="password"
            value="placeholder"
            disabled
            onEditClick={handlePasswordReset}
          />
        </div>
      </CardContent>
    </Card>
  );
}
