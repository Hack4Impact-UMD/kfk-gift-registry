import { createFileRoute } from "@tanstack/react-router";
import { useChild } from "@/hooks/queries/useChild";
import { useFamily } from "@/hooks/queries/useFamily";
import { useChildGifts } from "@/hooks/queries/useChildGifts";
import { ChildHeader } from "@/components/child-profile/ChildHeader";
import { ChildInfo } from "@/components/child-profile/ChildInfo";
import { ChildSidebar } from "@/components/child-profile/ChildSidebar";
import { SelectedGifts } from "@/components/child-profile/SelectedGifts";
import { GiftInfoSection } from "@/components/child-profile/GiftInfoSection";
import type { GiftDetails } from "@/components/child-profile/GiftInfoSection";
import { AddGiftForm } from "@/components/child-profile/AddGiftForm";
import { useState } from "react";
import { useUpdateChild } from "@/hooks/mutations/useUpdateChild";
import type { Child, Family, Gift } from "common";
import { useUpdateFamily } from "@/hooks/mutations/useUpdateFamily";
import { useUpdateGift } from "@/hooks/mutations/useUpdateGift";
import { useCreateGift } from "@/hooks/mutations/useCreateGift";
import { useFamilyLinkByFamilyId } from "@/hooks/queries/useFamilyLinkByFamilyId";
import { queries } from "@/queries";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import {
  CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE,
  isChildPublicBlurbTooLong,
} from "common";

function cloneGifts(gifts: ReadonlyArray<Gift>): Array<Gift> {
  return gifts.map((gift) => ({ ...gift }));
}

export const Route = createFileRoute("/_authenticated/staff/child/$childId")({
  component: ChildProfilePage,
  beforeLoad: async ({ context, params }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(
        queries.children.byId(params.childId),
      ),
      context.queryClient.ensureQueryData(
        queries.children.gifts(params.childId),
      ),
    ]);
  },
});

function ChildProfilePage() {
  const { childId } = Route.useParams();

  const [isEditing, setIsEditing] = useState(false);
  const [editedChild, setEditedChild] = useState<Partial<Child>>({});
  const [editedFamily, setEditedFamily] = useState<Partial<Family>>({});
  const [editedGifts, setEditedGifts] = useState<Array<Gift>>([]);
  const [giftDetailsByGiftId, setGiftDetailsByGiftId] = useState<
    Record<string, GiftDetails>
  >({});
  const [addGiftOpen, setAddGiftOpen] = useState(false);

  const updateChildMutation = useUpdateChild();
  const updateFamilyMutation = useUpdateFamily();
  const updateGiftMutation = useUpdateGift();
  const createGiftMutation = useCreateGift();

  const {
    data: child,
    isPending: childLoading,
    error: childError,
  } = useChild(childId);

  const {
    data: family,
    isPending: familyLoading,
    error: familyError,
  } = useFamily(child?.familyId ?? "");
  const {
    data: familyLink,
    isPending: familyLinkPending,
    error: familyLinkError,
  } = useFamilyLinkByFamilyId(child?.familyId ?? "");

  const {
    data: gifts,
    isPending: giftsLoading,
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

  const activeGiftCount = gifts.filter((gift) => gift.active).length;

  const handleStartEditing = () => {
    setEditedChild({});
    setEditedFamily({});
    setEditedGifts(cloneGifts(gifts));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedChild({});
    setEditedFamily({});
    setEditedGifts([]);
  };

  const handleSaveAll = async () => {
    if (
      editedChild.publicBlurb !== undefined &&
      isChildPublicBlurbTooLong(editedChild.publicBlurb ?? "")
    ) {
      toast.error(CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE);
      return;
    }

    const childUpdates = Object.fromEntries(
      Object.entries(editedChild).filter(
        ([key, value]) => value !== child[key as keyof typeof child],
      ),
    );

    const familyUpdates = Object.fromEntries(
      Object.entries(editedFamily).filter(
        ([key, value]) => value !== family[key as keyof typeof family],
      ),
    );

    const promises: Array<Promise<unknown>> = [];

    if (Object.keys(childUpdates).length > 0) {
      promises.push(
        updateChildMutation.mutateAsync({
          childId: child.id,
          updates: childUpdates,
        }),
      );
    }

    if (Object.keys(familyUpdates).length > 0) {
      promises.push(
        updateFamilyMutation.mutateAsync({
          familyId: family.id,
          updates: familyUpdates,
        }),
      );
    }

    try {
      await Promise.all([
        ...promises,
        ...editedGifts.map((gift) => {
          const original = gifts.find((g) => g.id === gift.id);
          if (!original) return Promise.resolve();
          if (
            gift.active !== original.active ||
            gift.backup !== original.backup
          ) {
            return updateGiftMutation.mutateAsync({
              giftId: gift.id,
              updates: { active: gift.active, backup: gift.backup },
            });
          }
          return Promise.resolve();
        }),
      ]);

      setEditedChild({});
      setEditedFamily({});
      setEditedGifts([]);
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handleUpdateGift = async (giftId: string, updates: Partial<Gift>) => {
    try {
      await updateGiftMutation.mutateAsync({ giftId, updates });
    } catch (err) {
      console.error("Gift update failed", err);
      throw err;
    }
  };

  const handleSaveAdminComments = async (comments: string) => {
    try {
      await updateChildMutation.mutateAsync({
        childId: child.id,
        updates: { staffPrivateNotes: comments },
      });
    } catch (err) {
      console.error("Admin comments save failed", err);
      throw err;
    }
  };

  const handleAddGift = async (gift: {
    title: string;
    productUrl: string;
    listedPrice?: number;
    active: boolean;
  }) => {
    await createGiftMutation.mutateAsync({
      childId: child.id,
      ...gift,
    });
    setAddGiftOpen(false);
  };

  return (
    <div className="px-4 pb-8 sm:px-6 lg:px-8 @container">
      <div className="rounded-[28px] border border-border/70 bg-card/95 p-4 shadow-sm sm:p-6">
        <h1 className="mb-5 text-3xl font-semibold tracking-tight sm:text-4xl">
          Child Profile
        </h1>

        <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
          <ChildSidebar
            key={`${child.id}-${isEditing ? "editing" : "view"}`}
            child={child}
            family={family}
            isEditing={isEditing}
            editedChild={editedChild}
            setEditedChild={setEditedChild}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <ChildHeader
              child={child}
              editedChild={editedChild}
              isEditing={isEditing}
              onStartEditing={handleStartEditing}
              onSave={handleSaveAll}
              onCancel={handleCancel}
            />

            <div className="my-5 h-px w-full bg-border/70" />

            <div className="grid w-full gap-6 2xl:grid-cols-[minmax(0,600px)_minmax(0,1fr)]">
              <div className="w-full 2xl:max-w-[600px]">
                <ChildInfo
                  child={child}
                  family={family}
                  isEditing={isEditing}
                  editedChild={editedChild}
                  setEditedChild={setEditedChild}
                  editedFamily={editedFamily}
                  setEditedFamily={setEditedFamily}
                />
              </div>
              <div className="space-y-6">
                <SelectedGifts
                  gifts={gifts}
                  isEditing={isEditing}
                  editedGifts={editedGifts}
                  setEditedGifts={setEditedGifts}
                  headerAction={
                    <Dialog open={addGiftOpen} onOpenChange={setAddGiftOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isEditing}
                        >
                          Add Gift
                        </Button>
                      </DialogTrigger>
                      <AddGiftForm
                        canAddToStorefront={activeGiftCount < 3}
                        disabled={false}
                        isSubmitting={createGiftMutation.isPending}
                        onSubmit={handleAddGift}
                      />
                    </Dialog>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Gift Information Section ── */}
      <div className="my-6 h-px w-full bg-border/70" />
      {/*TODO: This should not be handling the family link/admin comments too. Separate into a different component.*/}
      {familyLinkPending ? (
        <div className="p-2 w-full">
          <Spinner />
        </div>
      ) : familyLinkError ? (
        <div className="p-2 w-full">
          <span className="text-kfk-red">
            Failed to fetch family link: {familyLinkError.message}
          </span>
        </div>
      ) : (
        <GiftInfoSection
          gifts={gifts}
          parentComments={family.privateNotes}
          adminComments={child.staffPrivateNotes ?? ""}
          familyToken={familyLink?.id}
          giftDetailsByGiftId={giftDetailsByGiftId}
          onUpdateGiftDetails={(giftId, details) => {
            setGiftDetailsByGiftId((prev) => ({ ...prev, [giftId]: details }));
          }}
          onUpdateGift={handleUpdateGift}
          onSaveAdminComments={handleSaveAdminComments}
        />
      )}
    </div>
  );
}
