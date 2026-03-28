import Ladybug from '@/assets/ladybug-storefront.svg'
import { StoreFrontProgress } from "@/components/ui/progress"
import {
    GiftIcon,
    UserGroupIcon,
    UserIcon
} from "@/components/icons"

interface StatProps {
    children?: any,
    startIcon: React.ReactNode,
}

function StatLabel({children, startIcon} : StatProps) {
    return (
    <div className="flex gap-2">
        {startIcon}
        <h1>{children}</h1>
        
    </div>
    )
}

interface GiftDriveStatsProps {
    days: number,
    giftsPurchased: number,
    totalGiftsPurchased: number,
    giftsReceived: number,
    totalDonated: number
}

export function GiftDriveStats({days, giftsPurchased, totalGiftsPurchased, giftsReceived, totalDonated} : GiftDriveStatsProps) {
    const progressPercentage= Math.floor((giftsPurchased/totalGiftsPurchased) * 100);
    const ladybugClampedPosition = Math.min(Math.max(progressPercentage, 2), 98);

    return (
        <div className="flex flex-col gap-5 px-50 py-7 bg-kfk-blue text-white font-gaegu">
            <h2 className="text-center text-2xl font-bold">{days} Days Left to Donate!</h2>
            <div className="relative w-full p-2 bg-[#FFF8C2] rounded-full">
                <StoreFrontProgress 
                    value={progressPercentage} 
                    className="[&>*]:bg-kfk-yellow [&>*]:bg-repeat-x h-6 bg-transparent" 
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full p-1 text-white"
                    style={
                        { left: `${ladybugClampedPosition}%` }
                    }
                >
                    <img src={Ladybug} alt="ladybug" className="w-10 h-10 max-w-none"/>
                </div>
                
            </div>
            
            <div className="flex justify-around text-xl">
                <StatLabel startIcon={<GiftIcon className="h-5 w-5"/>}><span className="text-kfk-yellow">{giftsPurchased}</span> out of {totalGiftsPurchased} Gifts Purchased</StatLabel>
                <StatLabel startIcon={<UserGroupIcon className="h-5 w-5"/>}><span className="text-kfk-yellow">{giftsReceived}</span> Children Received Gifts</StatLabel>
                <StatLabel startIcon={<UserIcon className="h-5 w-5"/>}><span className="text-kfk-yellow">{totalDonated}</span> People Donated</StatLabel>
            </div>
        </div>
    );
}
