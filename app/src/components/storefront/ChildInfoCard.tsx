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
    child.category === "warrior" ? "bg-kfk-yellow" : "bg-[#ADD8E6]";

  return (
    <Card className={cn("w-full max-w-sm", className)}>
      <CardContent className="flex flex-col items-center gap-4 pt-6">
        <div className="w-full max-w-[280px] aspect-[4/3] bg-muted rounded-lg overflow-hidden border-4 border-gray-300">
          <img
            src={child.photoUrl || defaultProfilePhoto}
            alt={child.name}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-2xl font-bold text-center font-gaegu">
          {child.name}
        </h2>

        <span
          className={cn(
            "inline-flex rounded-full px-4 py-1 text-sm font-medium",
            categoryColor,
          )}
        >
          {categoryLabel}
        </span>

        <p className="text-base text-muted-foreground">{child.age} Years Old</p>

        <div className="w-full text-center">
          <p className="font-semibold text-lg mb-1">{child.diagnosis}</p>
        </div>

        {child.publicBlurb && (
          <div className="w-full text-sm text-muted-foreground leading-relaxed px-2">
            <p className="text-left">{child.publicBlurb}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
