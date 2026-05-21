import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useTransition } from "react";
import { eq, createTransaction, useLiveQuery } from "@tanstack/react-db";
import type { Transaction } from "@tanstack/react-db";
import { v7 as uuidv7 } from "uuid";
import { useCollections } from "@/collections/context";
import {
  childByIdQueryOptions,
  familyByIdQueryOptions,
  giftsByChildIdQueryOptions,
} from "@/collections/preload";
import { useQuery } from "@tanstack/react-query";
import { queries } from "@/queries";
import { ChildHeader } from "@/components/child-profile/ChildHeader";
import { ChildInfo } from "@/components/child-profile/ChildInfo";
import { ChildSidebar } from "@/components/child-profile/ChildSidebar";
import { SelectedGifts } from "@/components/child-profile/SelectedGifts";
import { GiftInfoSection } from "@/components/child-profile/GiftInfoSection";
import { AddGiftForm } from "@/components/child-profile/AddGiftForm";
import { useFamilyLinkByFamilyId } from "@/hooks/queries/useFamilyLinkByFamilyId";
import { Spinner } from "@/components/ui/spinner";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import {
  CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE,
  isChildPublicBlurbTooLong,
} from "common";
import type { Address, Child, Family, Gift } from "common";

export const Route = createFileRoute("/_authenticated/staff/child/$childId")({
  component: ChildProfilePage,
  beforeLoad: async ({ context, params }) => {
    const children = await context.queryClient.ensureQueryData(
      childByIdQueryOptions(params.childId),
    );
    const child = children[0];
    if (!child) return;
    await Promise.all([
      context.queryClient.ensureQueryData(
        familyByIdQueryOptions(child.familyId),
      ),
      context.queryClient.ensureQueryData(
        giftsByChildIdQueryOptions(params.childId),
      ),
      context.queryClient.ensureQueryData(
        queries.claims.byChildId(params.childId),
      ),
    ]);
  },
  head: () => ({
    meta: [
      { title: "Child Profile - Staff" },
      {
        name: "description",
        content: "View and manage child profile information",
      },
    ],
  }),
});

function LoadingPanel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 p-4 text-muted-foreground">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

function ErrorPanel({ message }: { message: string }) {
  return (
    <div role="alert" className="p-4 text-kfk-red">
      {message}
    </div>
  );
}

function ChildProfilePage() {
  const { childId } = Route.useParams();
  const collections = useCollections();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddGiftOpen, setAddGiftOpen] = useState(false);
  const [isAddingGift, startAddGift] = useTransition();
  const txRef = useRef<Transaction | null>(null);

  const {
    data: childData = [],
    isLoading: childLoading,
    isError: childIsError,
  } = useLiveQuery(
    (q) =>
      q.from({ c: collections.children }).where(({ c }) => eq(c.id, childId)),
    [childId],
  );
  const child = childData[0];

  const {
    data: giftsData = [],
    isLoading: giftsLoading,
    isError: giftsIsError,
  } = useLiveQuery(
    (q) =>
      q.from({ g: collections.gifts }).where(({ g }) => eq(g.childId, childId)),
    [childId],
  );

  const {
    data: familyData = [],
    isLoading: familyLoading,
    isError: familyIsError,
  } = useLiveQuery(
    (q) =>
      child
        ? q
            .from({ f: collections.families })
            .where(({ f }) => eq(f.id, child.familyId))
        : undefined,
    [child?.familyId],
  );
  const family = familyData[0];

  const {
    data: familyLink,
    isPending: familyLinkPending,
    error: familyLinkError,
  } = useFamilyLinkByFamilyId(child?.familyId ?? "");

  const { data: claimsData = [] } = useQuery({
    ...queries.claims.byChildId(childId),
    enabled: !!child,
  });
  const claimsByGiftId = Object.fromEntries(
    claimsData.map((c) => [c.giftId, c]),
  );

  if (childIsError) {
    return <ErrorPanel message="Failed to load child profile" />;
  }
  if (childLoading) return <LoadingPanel label="Loading child profile..." />;
  if (!child) return <ErrorPanel message="No child found" />;

  if (familyIsError) {
    return <ErrorPanel message="Failed to load family" />;
  }
  if (familyLoading) return <LoadingPanel label="Loading family..." />;
  if (!family) return <ErrorPanel message="No family found" />;

  if (giftsIsError) {
    return <ErrorPanel message="Failed to load gifts" />;
  }
  if (giftsLoading) return <LoadingPanel label="Loading gifts..." />;

  const activeGiftCount = giftsData.filter((gift) => gift.active).length;

  const ensureTransaction = () => {
    if (!txRef.current) {
      txRef.current = createTransaction({
        autoCommit: false,
        mutationFn: async ({ transaction }) => {
          await collections.persistBatchMutation(transaction);
        },
      });
    }
    return txRef.current;
  };

  const editChild = (mutate: (draft: Child) => void) => {
    const tx = ensureTransaction();
    tx.mutate(() => {
      collections.children.update(childId, (draft) => mutate(draft as Child));
    });
  };

  const editFamily = (mutate: (draft: Family) => void) => {
    const tx = ensureTransaction();
    tx.mutate(() => {
      collections.families.update(family.id, (draft) =>
        mutate(draft as Family),
      );
    });
  };

  const editGift = (giftId: string, mutate: (draft: Gift) => void) => {
    const tx = ensureTransaction();
    tx.mutate(() => {
      collections.gifts.update(giftId, (draft) => mutate(draft as Gift));
    });
  };

  const handleStartEditing = () => {
    txRef.current = null;
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (txRef.current && txRef.current.state === "pending") {
      txRef.current.rollback();
    }
    txRef.current = null;
    setIsEditing(false);
  };

  const handleSaveAll = async () => {
    if (
      child.publicBlurb !== undefined &&
      isChildPublicBlurbTooLong(child.publicBlurb)
    ) {
      toast.error(CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE);
      return;
    }

    const tx = txRef.current;
    if (!tx || tx.mutations.length === 0) {
      txRef.current = null;
      setIsEditing(false);
      return;
    }

    try {
      await tx.commit();
      txRef.current = null;
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const handlePublishedChange = async (published: boolean) => {
    const result = collections.children.update(childId, (draft) => {
      draft.published = published;
    });
    await result.isPersisted.promise;
  };

  const handleSaveAdminComments = async (comments: string) => {
    const result = collections.children.update(childId, (draft) => {
      draft.staffPrivateNotes = comments;
    });
    await result.isPersisted.promise;
  };

  const handleAddGift = (gift: {
    title: string;
    productUrl: string;
    listedPrice?: number;
    active: boolean;
  }) => {
    let resolve!: () => void;
    let reject!: (err: unknown) => void;
    const promise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    startAddGift(async () => {
      const placeholder: Gift = {
        id: uuidv7(),
        childId: child.id,
        familyId: child.familyId,
        giftDrive: child.giftDrive,
        title: gift.title,
        productUrl: gift.productUrl,
        listedPrice: gift.listedPrice,
        status: "AVAILABLE",
        createdAt: new Date().toISOString(),
        active: gift.active,
        backup: !gift.active,
      };
      try {
        const result = collections.gifts.insert(placeholder);
        await result.isPersisted.promise;
        setAddGiftOpen(false);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    return promise;
  };

  const handleChildFieldChange = <K extends keyof Child>(
    key: K,
    value: Child[K],
  ) => {
    editChild((draft) => {
      draft[key] = value;
    });
  };

  const handleFamilyFieldChange = <K extends keyof Family>(
    key: K,
    value: Family[K],
  ) => {
    editFamily((draft) => {
      draft[key] = value;
    });
  };

  const handleAddressFieldChange = <K extends keyof Address>(
    key: K,
    value: Address[K],
  ) => {
    editFamily((draft) => {
      draft.address[key] = value;
    });
  };

  const handleGiftToggle = (giftId: string) => {
    const gift = giftsData.find((g) => g.id === giftId);
    if (!gift) return;
    if (!gift.active) {
      const liveActiveCount = giftsData.filter((g) => g.active).length;
      if (liveActiveCount >= 3) return;
    }
    const nextActive = !gift.active;
    editGift(giftId, (draft) => {
      draft.active = nextActive;
      draft.backup = !nextActive;
    });
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
            onChildFieldChange={handleChildFieldChange}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <ChildHeader
              child={child}
              isEditing={isEditing}
              onStartEditing={handleStartEditing}
              onSave={handleSaveAll}
              onCancel={handleCancel}
              onPublishedChange={handlePublishedChange}
            />

            <div className="my-5 h-px w-full bg-border/70" />

            <div className="grid w-full gap-6 2xl:grid-cols-[minmax(0,600px)_minmax(0,1fr)]">
              <div className="w-full 2xl:max-w-[600px]">
                <ChildInfo
                  child={child}
                  family={family}
                  isEditing={isEditing}
                  onChildFieldChange={handleChildFieldChange}
                  onFamilyFieldChange={handleFamilyFieldChange}
                  onAddressFieldChange={handleAddressFieldChange}
                />
              </div>
              <div className="space-y-6">
                <SelectedGifts
                  gifts={giftsData}
                  isEditing={isEditing}
                  onGiftToggle={handleGiftToggle}
                  headerAction={
                    <Dialog open={isAddGiftOpen} onOpenChange={setAddGiftOpen}>
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
                        isSubmitting={isAddingGift}
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

      <div className="my-6 h-px w-full bg-border/70" />
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
          gifts={giftsData}
          claimsByGiftId={claimsByGiftId}
          parentComments={family.privateNotes}
          adminComments={child.staffPrivateNotes ?? ""}
          familyToken={familyLink?.id}
          onSaveAdminComments={handleSaveAdminComments}
        />
      )}
    </div>
  );
}
