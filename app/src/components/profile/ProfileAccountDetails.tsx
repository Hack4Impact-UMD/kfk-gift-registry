"use client"

import { useState } from "react"
import { updatePassword } from "firebase/auth"
import { FirebaseError } from "firebase/app"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PencilSquare } from "@/components/icons/PencilSquare"
import { getClientAuth } from "@/lib/firebase.client"

export function AccountDetailsSection() {
  const [editing, setEditing] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [err, setErr] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setErr(undefined)

    if (newPassword.length < 6) {
      setErr("Password must be at least 6 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match.")
      return
    }

    try {
      setLoading(true)
      const auth = getClientAuth()
      const user = auth.currentUser
      if (!user) throw new Error("No authenticated user found.")
      await updatePassword(user, newPassword)
      setEditing(false)
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      if (error instanceof FirebaseError) {
        if (error.code === "auth/requires-recent-login") {
          setErr("Please log out and log back in before changing your password.")
        } else {
          setErr("Failed to update password. Please try again.")
        }
      } else if (error instanceof Error) {
        setErr(error.message)
      } else {
        setErr("Failed to update password.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditing(false)
    setNewPassword("")
    setConfirmPassword("")
    setErr(undefined)
  }

  return (
    <Card className="rounded-lg border-3 border-kfk-light-blue">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">
          Account Details
        </CardTitle>
      </CardHeader>

      <CardContent className="gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-md font-semibold">
            Password
          </label>

          {!editing ? (
            <div className="relative">
              <Input
                type="password"
                value="placeholder"
                readOnly
                className="pr-10 shadow-md cursor-default"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setEditing(true)}
                className="group absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted rounded-md"
              >
                <PencilSquare className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="shadow-md"
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="shadow-md"
              />

              {err && <p className="text-sm text-red-600">{err}</p>}

              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-kfk-blue hover:bg-kfk-blue/90 text-white"
                >
                  {loading ? "Saving..." : "Reset Password"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}