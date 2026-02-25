"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EditIcon } from "@/components/profile/EditIcon.tsx"
import { AuthUser } from "@/server/auth.ts"

interface ContactInfoSectionProps {
  user: AuthUser
  phone?: string
}

export function ContactInfoSection({
  user,
  phone,
}: ContactInfoSectionProps) {
  const [contactData, setContactData] = useState({
    email: user?.email || "",
    phone: phone ?? "",
  })

  return (
    <Card className="rounded-lg border-3 border-kfk-light-blue">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-bold">
          Contact Information
        </CardTitle>
      </CardHeader>

      <CardContent className="gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label className="text-md font-semibold">
              Email
            </label>

            <div className="relative">
              <Input
                value={contactData.email}
                className="pr-10 shadow-md"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="group absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted rounded-md"
              >
                <EditIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-md font-semibold">
              Phone Number
            </label>

            <div className="relative">
              <Input
                value={contactData.phone}
                className="pr-10 shadow-md"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="group absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-muted rounded-md"
              >
                <EditIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}