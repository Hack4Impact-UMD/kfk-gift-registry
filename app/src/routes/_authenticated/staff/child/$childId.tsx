import { createFileRoute } from "@tanstack/react-router";
import { useChild } from "@/hooks/queries/useChild";
import { useFamily } from "@/hooks/queries/useFamily";
import { useChildGifts } from "@/hooks/queries/useChildGifts";
import { ChildHeader } from "@/components/child-profile/ChildHeader";
import { ChildInfo } from "@/components/child-profile/ChildInfo";
import { ChildSidebar } from "@/components/child-profile/ChildSidebar";
import { SelectedGifts } from "@/components/child-profile/SelectedGifts";

export const Route = createFileRoute("/_authenticated/staff/child/$childId")({
  component: ChildProfilePage,
});

function ChildProfilePage() {
  const { childId } = Route.useParams();

  const {
    data: child,
    isLoading: childLoading,
    error: childError,
  } = useChild(childId);

  const {
    data: family,
    isLoading: familyLoading,
    error: familyError,
  } = useFamily(child?.familyId ?? "");

  const {
    data: gifts,
    isLoading: giftsLoading,
    error: giftsError,
  } = useChildGifts(childId);

  if (childLoading) return <div>Loading...</div>;
  if (childError) return <div>Something went wrong</div>;
  if (!child) return <div>No child found</div>;

  if (familyLoading) return <div>Loading family...</div>;
  if (familyError) return <div>Family error</div>;
  if (!family) return <div>No family found</div>;

  if (giftsLoading) return <div>Loading gifts...</div>;
  if (giftsError) return <div>Gifts error</div>;
  if (!gifts) return <div>No gifts found</div>;

  return (
    <div className="mx-8">
        <h1 className="font-bold text-4xl my-4">Child Profile</h1>
        <div className="flex">
          <ChildSidebar child={child} family={family} />
          <div className="flex flex-col flex-1 ml-8">
            <ChildHeader child={child} />
            <div className="w-full h-1 rounded-full my-4 bg-muted"></div>
            <div className="flex gap-12">
              <ChildInfo child={child} family={family} />
              <SelectedGifts gifts={gifts} />
            </div>
          </div>
        </div>
        
    </div>
  );
}