import { useCallback, useState, } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import type { AuthContextAuthenticated } from "@/server/auth";
import { getClientAuth } from "@/lib/firebase.client";
import { Label } from "../ui/label";

type ReauthAlertDialogProps = {
  authCtx: AuthContextAuthenticated,
  open: boolean,
  onFail: () => void
  onConfirmed: () => void
}

export function ReauthAlertDialog({ open, onFail, onConfirmed, authCtx }: ReauthAlertDialogProps) {
  const [pass, setPass] = useState("");
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState(false);

  const handleConfirm = useCallback(async () => {
    const auth = await getClientAuth();
    try {
      setPending(true)
      if (!auth.currentUser || !authCtx.authUser.email) throw new Error("not authenticated")
      await reauthenticateWithCredential(auth.currentUser!, EmailAuthProvider.credential(authCtx.authUser.email, pass));
      setErr(false);
      onConfirmed();
    } catch (error) {
      //TODO: toast
      console.error(error);
      setErr(true)
    } finally {
      setPending(false);
      setPass("");
    }
  }, [pass, authCtx.authUser.email, onConfirmed])

  return <AlertDialog open={open}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Re-enter your password</AlertDialogTitle>
        <AlertDialogDescription>
          Since this is a sensitive action, you will need to re-enter your password to prove your identity.
        </AlertDialogDescription>
      </AlertDialogHeader>

      <div className="flex flex-col gap-2">
        <Label>Password</Label>
        <Input type="password" value={pass} onChange={e => setPass(e.target.value)} />
        <div className="h-3">
          {err && <span className="text-red-500 text-sm">Failed to authenticate</span>}
        </div>
      </div>

      <AlertDialogFooter>
        <AlertDialogCancel onClick={onFail} disabled={pending}>Cancel</AlertDialogCancel>
        <AlertDialogAction onClick={handleConfirm} disabled={pending || pass === ""}>Confirm</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
}
