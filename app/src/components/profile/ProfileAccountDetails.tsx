import { sendPasswordResetEmail } from "firebase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InlineEditInput } from "@/components/ui/inline-edit-input";
import { getClientAuth } from "@/lib/firebase.client";
import type { AuthContextAuthenticated } from "@/server/functions/auth";
import { toast } from "@/lib/toast";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

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
      toast.success("Password reset email sent")
    } catch (err) {
      console.error(err);
      toast.error("Failed to send password reset email.");
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

          <Input
            type="password"
            value="placeholder"
            disabled
            className="opacity-100!"
          />
          <Button
            onClick={handlePasswordReset}
            className="text-kfk-blue w-32 self-end"
            variant={"link"}
          >
            Change password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
