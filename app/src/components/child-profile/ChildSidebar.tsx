import { Child } from "../../../../common/src/types/child";
import { Family } from "../../../../common/src/types/family";
import { SiblingPopover } from "./SiblingPopover";
import { useChildProfilesForFamily } from "@/hooks/queries/useChildProfilesForFamily";
import DefaultPhoto  from "@/assets/default-profile-photo.png";

type ChildSidebarProps = {
  child: Child;
  family: Family
};

export function ChildSidebar ({ child, family }: ChildSidebarProps) {

    const { data: children = [] } = useChildProfilesForFamily(family.id);
    console.log("Children:", children);
    const siblings = children.filter((c) => c.id !== child.id);

    return (
        <div className="flex flex-col">
            <img 
                className="w-[230px] h-auto border-4 border-card rounded-xl shadow-xl mb-6" 
                src={child.photoUrl ?? DefaultPhoto} alt="Profile Photo" 
            />
            <p className="text-xs text-muted-foreground mb-2">Sibling profiles:</p>
            <div className="flex flex-wrap">
                {siblings?.map((sibling) => (
                    <SiblingPopover key={sibling.id} sibling={sibling} />
                ))}
            </div>
            <div className="shadow-md rounded-lg border p-4 space-y-2 max-w-[230px] mt-6">
                <p><span className="font-bold">Personal Blurb:</span> {child.publicBlurb}</p>
            </div>
        </div>
    );
}