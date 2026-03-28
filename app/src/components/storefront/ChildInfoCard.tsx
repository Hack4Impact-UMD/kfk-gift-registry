import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import type { StorefrontChild } from "@/types/storefront";
import defaultProfilePhoto from "@/assets/default-profile-photo.png";

interface ChildInfoCardProps {
  child: StorefrontChild;
  className?: string;
}

export function ChildInfoCard({ child, className }: ChildInfoCardProps) {
  const categoryLabel =
    child.category === "warrior" ? "Warrior" : "Super Sib";
  const categoryColor =
    child.category === "warrior"
      ? "bg-kfk-yellow/10 text-kfk-yellow inset-ring inset-ring-kfk-yellow/20"
      : "bg-kfk-blue/10 text-kfk-blue inset-ring inset-ring-kfk-blue/20";

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardContent className="flex flex-col items-center gap-1.5 sm:gap-2 pt-3 sm:pt-6 pb-4 sm:pb-6 px-3 sm:px-6">
        <div className="w-full max-w-[280px] aspect-[4/3] bg-muted rounded-lg overflow-hidden border-2 sm:border-4 border-gray-300">
          <img
            src={child.photoUrl || defaultProfilePhoto}
            alt={child.name}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-center font-gaegu">
          {child.name}
        </h2>

        <span
          className={cn(
            "inline-flex items-center rounded-md px-5 sm:px-7 py-0.5 sm:py-1 text-sm sm:text-base font-medium font-gaegu font-bold",
            categoryColor,
          )}
        >
          {categoryLabel}
        </span>

        <p className="text-base sm:text-lg text-muted-foreground font-gaegu font-bold">{child.age} Years Old</p>

        <div className="w-full text-center">
          <p className="font-semibold text-lg sm:text-xl mb-1 font-gaegu font-bold">{child.diagnosis}</p>
        </div>

        {child.publicBlurb && (
          <div className="w-full text-sm sm:text-base text-muted-foreground leading-relaxed px-1 sm:px-2 font-gaegu">
            <p className="text-left">{child.publicBlurb}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
