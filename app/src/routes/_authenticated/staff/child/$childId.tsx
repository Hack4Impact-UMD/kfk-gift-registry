import { createFileRoute } from "@tanstack/react-router";
import { useChild } from "@/hooks/queries/useChild";
import { useFamily } from "@/hooks/queries/useFamily";
import { useChildGifts } from "@/hooks/queries/useChildGifts";
import { ChildHeader } from "@/components/child-profile/ChildHeader";
import { ChildInfo } from "@/components/child-profile/ChildInfo";
import { ChildSidebar } from "@/components/child-profile/ChildSidebar";
import { SelectedGifts } from "@/components/child-profile/SelectedGifts";
import { useState } from "react";
import { useUpdateChild } from "@/hooks/mutations/useUpdateChild";
import { Child, Family } from "../../../../../../common/src/types";
import { useUpdateFamily } from "@/hooks/mutations/useUpdateFamily";

export const Route = createFileRoute("/_authenticated/staff/child/$childId")({
  component: ChildProfilePage,
});

function ChildProfilePage() {
  const { childId } = Route.useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [editedChild, setEditedChild] = useState<Partial<Child>>({});
  const updateChildMutation = useUpdateChild();
  const [editedFamily, setEditedFamily] = useState<Partial<Family>>({});
  const updateFamilyMutation = useUpdateFamily();

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

  const handleCancel = () => {
    setIsEditing(false);
    setEditedChild({});
    setEditedFamily({});
  };

  const handleSaveAll = async () => {
    const childUpdates = Object.fromEntries(
      Object.entries(editedChild).filter(
        ([key, value]) =>
          value !== child[key as keyof typeof child]
      )
    );

    const familyUpdates = Object.fromEntries(
      Object.entries(editedFamily).filter(
        ([key, value]) =>
          value !== family[key as keyof typeof family]
      )
    );

    const promises: Promise<unknown>[] = [];

    if (Object.keys(childUpdates).length > 0) {
      promises.push(
        updateChildMutation.mutateAsync({
          childId: child.id,
          updates: childUpdates,
        })
      );
    }

    if (Object.keys(familyUpdates).length > 0) {
      promises.push(
        updateFamilyMutation.mutateAsync({
          familyId: family.id,
          updates: familyUpdates,
        })
      );
    }

    try {
      await Promise.all(promises);

      setEditedChild({});
      setEditedFamily({});
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  return (
    <div className="mx-8">
        <h1 className="font-bold text-4xl my-4">Child Profile</h1>
        <div className="flex">
          <ChildSidebar child={child} family={family} />
          <div className="flex flex-col flex-1 ml-8">
            <ChildHeader 
              child={child} 
              isEditing={isEditing} 
              setIsEditing={setIsEditing}
              onSave={handleSaveAll}
              onCancel={handleCancel}
            />
            <div className="w-full h-1 rounded-full my-4 bg-muted"></div>
            <div className="flex gap-12">
              <ChildInfo 
                child={child} 
                family={family} 
                isEditing={isEditing} 
                editedChild={editedChild}
                setEditedChild={setEditedChild}
                editedFamily={editedFamily}
                setEditedFamily={setEditedFamily}
              />
              <SelectedGifts gifts={gifts} isEditing={isEditing} />
            </div>
          </div>
        </div>
        
    </div>
  );
}