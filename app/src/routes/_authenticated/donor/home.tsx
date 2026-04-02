import { createFileRoute, useRouter } from '@tanstack/react-router'
import type { CSSProperties } from 'react'
import RedGift from "@/assets/red-gift.png"
import DefaultProfile from "@/assets/default-profile-photo.png"
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';


export const Route = createFileRoute('/_authenticated/donor/home')({
  component: RouteComponent,
})

function getBlueBackground(): CSSProperties {
  return {
    backgroundColor: "#0839b1",
      backgroundImage: `
      radial-gradient(circle, #1a3fbf 40%, transparent 40%),
      radial-gradient(circle, #1a3fbf 40%, transparent 40%)
    `,
      backgroundSize: "180px 180px",
      backgroundPosition: "0 0, 90px 90px",
  }
}

function RouteComponent() {
  const { auth } = Route.useRouteContext();

  return (
    <div className="flex flex-col gap-10 p-5">
      <Card 
        className="flex flex-row justify-center w-full text-white px-5 py-7 max-w-150 mx-auto"
        style={getBlueBackground()}
      >
        <div className="flex flex-col">
          <h1 className="font-bold font-gaegu text-3xl">Welcome {auth.authUser.displayName}!</h1>
          <p className="italic text-xs">Your Contribution Makes a Difference. Thank You for your support!</p>
        </div>
        <img className="w-20" src={RedGift}/>
      </Card>

      <Card
        className="flex flex-col text-white text-center w-full max-w-150 mx-auto gap-2 px-10 shadow-lg"
        style={getBlueBackground()}
      >
        <h3 className="font-bold mb-2">Gifts you've committed for John:</h3>
        <img src={DefaultProfile} className="w-30 h-20 object-cover mx-auto rounded-2xl border-3 border-white"></img>
        <h2 className="text-2xl font-bold font-gaegu">John Doe</h2>
        <h3 className="rounded-full bg-[#FFF8C2] text-[#733C10] w-28 px-1 py-0.5 mx-auto">Warrior</h3>

        <div>
          <Card className="flex flex-col gap-2 rounded-lg p-2 my-3">
            <h3 className="text-center rounded-full text-kfk-red bg-red-100 my-0">Not Purchased</h3>
            <span className="p-0 text-primary font-gaegu">Uno Card Game</span>
          </Card>
        </div>

        <Button className="bg-white text-kfk-blue text-xl mx-auto w-40 font-gaegu font-bold rounded-full">View More</Button>
      </Card>
    </div>
  )
}
