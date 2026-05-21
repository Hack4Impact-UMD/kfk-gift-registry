import { createCollection } from "@tanstack/react-db";
import {
  queryCollectionOptions,
  parseLoadSubsetOptions,
} from "@tanstack/query-db-collection";
import type { PendingMutation } from "@tanstack/react-db";
import type { QueryClient } from "@tanstack/react-query";
import {
  createGift,
  getChildById,
  getChildGiftsByChildId,
  getChildProfilesForFamily,
  updateChild,
  updateGift,
  uploadChildPictureStaff,
} from "@/server/functions/child";
import {
  getFamilyById,
  updateFamily,
  updateFamilyReviewStatus,
} from "@/server/functions/family";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";
import { getValidationMessage } from "@/lib/serverValidation";
import type { Address, Child, Family, Gift } from "common";
import {
  CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE,
  GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE,
  GIFT_TITLE_TOO_LONG_MESSAGE,
  MAX_CHILD_PUBLIC_BLURB_LENGTH,
  MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH,
  MAX_GIFT_TITLE_LENGTH,
} from "common";

const UPDATABLE_CHILD_FIELDS = [
  "name",
  "status",
  "photoUrl",
  "treatmentLevel",
  "diagnosis",
  "diagnosisLengthYears",
  "offTreatmentDurationYears",
  "publicBlurb",
  "hospital",
  "age",
  "childSocialWorker",
  "staffPrivateNotes",
  "published",
] as const satisfies ReadonlyArray<keyof Child>;

type UpdatableChildField = (typeof UPDATABLE_CHILD_FIELDS)[number];
type ChildUpdates = Partial<Pick<Child, UpdatableChildField>>;

const UPDATABLE_GIFT_FIELDS = [
  "title",
  "listedPrice",
  "status",
  "familyPublicNotes",
  "active",
  "backup",
  "productUrl",
  "privateNotes",
] as const satisfies ReadonlyArray<keyof Gift>;

type UpdatableGiftField = (typeof UPDATABLE_GIFT_FIELDS)[number];
type GiftUpdates = Partial<Pick<Gift, UpdatableGiftField>>;

const FAMILY_PROFILE_FIELDS = [
  "contactName",
  "guardianRelationship",
  "email",
  "phone",
  "privateNotes",
] as const satisfies ReadonlyArray<keyof Family>;

type FamilyProfileUpdates = {
  contactName?: string;
  guardianRelationship?: string;
  email?: string;
  phone?: string;
  address?: Partial<Address>;
  privateNotes?: string;
};

type FamilyReviewUpdates = {
  reviewStatus: {
    approved: boolean;
    held: boolean;
    reviewNotes?: string;
    holdNotes?: string;
  };
  privateNotes?: string;
};

function diffChild(original: Child, modified: Child): ChildUpdates {
  const updates: ChildUpdates = {};
  for (const key of UPDATABLE_CHILD_FIELDS) {
    if (modified[key] !== original[key]) {
      updates[key] = modified[key] as never;
    }
  }
  return updates;
}

function diffGift(original: Gift, modified: Gift): GiftUpdates {
  const updates: GiftUpdates = {};
  for (const key of UPDATABLE_GIFT_FIELDS) {
    if (modified[key] !== original[key]) {
      updates[key] = modified[key] as never;
    }
  }
  return updates;
}

function shallowAddressDiff(
  original: Address,
  modified: Address,
): Partial<Address> | undefined {
  const diff: Partial<Address> = {};
  for (const key of Object.keys(modified) as Array<keyof Address>) {
    if (modified[key] !== original[key]) {
      diff[key] = modified[key];
    }
  }
  return Object.keys(diff).length > 0 ? diff : undefined;
}

function buildFamilyProfileUpdates(
  original: Family,
  modified: Family,
): FamilyProfileUpdates {
  const updates: FamilyProfileUpdates = {};
  for (const key of FAMILY_PROFILE_FIELDS) {
    if (modified[key] !== original[key]) {
      (updates as Record<string, unknown>)[key] = modified[key];
    }
  }
  const addressDiff = shallowAddressDiff(original.address, modified.address);
  if (addressDiff) updates.address = addressDiff;
  return updates;
}

function reviewStatusChanged(original: Family, modified: Family) {
  const a = original.reviewStatus;
  const b = modified.reviewStatus;
  return (
    a.approved !== b.approved ||
    a.held !== b.held ||
    a.reviewNotes !== b.reviewNotes ||
    a.holdNotes !== b.holdNotes
  );
}

function getUpdateChildErrorMessage(error: Error) {
  return (
    getValidationMessage(error, [
      {
        code: "too_big",
        maximum: MAX_CHILD_PUBLIC_BLURB_LENGTH,
        message: CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE,
        path: ["updates", "publicBlurb"],
      },
    ]) ?? `Failed to update child: ${error.message}`
  );
}

function getUpdateGiftErrorMessage(error: Error) {
  return (
    getValidationMessage(error, [
      {
        code: "too_big",
        maximum: MAX_GIFT_TITLE_LENGTH,
        message: GIFT_TITLE_TOO_LONG_MESSAGE,
        path: ["updates", "title"],
      },
      {
        code: "too_big",
        maximum: MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH,
        message: GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE,
        path: ["updates", "familyPublicNotes"],
      },
    ]) ?? `Failed to update gift: ${error.message}`
  );
}

function getCreateGiftErrorMessage(error: Error) {
  return (
    getValidationMessage(error, [
      {
        code: "too_big",
        maximum: MAX_GIFT_TITLE_LENGTH,
        message: GIFT_TITLE_TOO_LONG_MESSAGE,
        path: ["title"],
      },
    ]) ?? `Failed to add gift: ${error.message}`
  );
}

export type Collections = ReturnType<typeof createCollections>;

export function createCollections(queryClient: QueryClient) {
  function invalidateChildDerivedCaches() {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: queries.children.approvedProfileTableRows._def,
      }),
      queryClient.invalidateQueries({
        queryKey: queries.children.byFamilyId._def,
      }),
      queryClient.invalidateQueries({
        queryKey: queries.children.gifts._def,
      }),
      queryClient.invalidateQueries({
        queryKey: queries.families.profileTableRows._def,
      }),
      queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      }),
    ]);
  }

  function invalidateFamilyDerivedCaches(familyId: string) {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: queries.children.byFamilyId(familyId).queryKey,
      }),
      queryClient.invalidateQueries({
        queryKey: queries.children.approvedProfileTableRows._def,
      }),
      queryClient.invalidateQueries({
        queryKey: queries.families.profileTableRows._def,
      }),
    ]);
  }

  function invalidateGiftDerivedCaches() {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: queries.children.approvedProfileTableRows._def,
      }),
      queryClient.invalidateQueries({
        queryKey: queries.storefront._def,
      }),
    ]);
  }

  async function persistChildUpdate(
    mutation: PendingMutation<Child, "update">,
  ) {
    const childId = mutation.key as string;
    const original = mutation.original as Child;
    const modified = mutation.modified as Child;

    let effectiveModified = modified;
    let uploadedPhotoUrl: string | undefined;

    if (
      modified.photoUrl &&
      modified.photoUrl.startsWith("data:") &&
      modified.photoUrl !== original.photoUrl
    ) {
      const uploaded = await uploadChildPictureStaff({
        data: { childId, dataUrl: modified.photoUrl },
      });
      uploadedPhotoUrl = uploaded.photoUrl;
      effectiveModified = { ...modified, photoUrl: uploaded.photoUrl };
    }

    const updates = diffChild(original, effectiveModified);
    if (uploadedPhotoUrl !== undefined) {
      delete updates.photoUrl;
    }
    if (Object.keys(updates).length > 0) {
      await updateChild({ data: { childId, updates } });
    }

    if (uploadedPhotoUrl !== undefined) {
      mutation.collection.utils.writeUpdate({
        id: childId,
        photoUrl: uploadedPhotoUrl,
      });
    }
  }

  async function persistFamilyUpdate(
    mutation: PendingMutation<Family, "update">,
  ) {
    const familyId = mutation.key as string;
    const original = mutation.original as Family;
    const modified = mutation.modified as Family;

    const profileUpdates = buildFamilyProfileUpdates(original, modified);
    const reviewChanged = reviewStatusChanged(original, modified);
    const privateNotesChanged =
      modified.privateNotes !== original.privateNotes;

    const tasks: Array<Promise<unknown>> = [];

    if (Object.keys(profileUpdates).length > 0) {
      tasks.push(
        updateFamily({
          data: { familyId, updates: profileUpdates },
        }),
      );
    }

    if (reviewChanged) {
      const reviewUpdates: FamilyReviewUpdates = {
        reviewStatus: {
          approved: modified.reviewStatus.approved,
          held: modified.reviewStatus.held,
          reviewNotes: modified.reviewStatus.reviewNotes ?? "",
          holdNotes: modified.reviewStatus.holdNotes ?? "",
        },
        ...(privateNotesChanged
          ? { privateNotes: modified.privateNotes ?? "" }
          : {}),
      };
      tasks.push(
        updateFamilyReviewStatus({
          data: { familyId, updates: reviewUpdates },
        }),
      );
    }

    if (tasks.length === 0) return { reviewChanged: false };
    await Promise.all(tasks);
    return { reviewChanged };
  }

  async function persistGiftUpdate(
    mutation: PendingMutation<Gift, "update">,
  ) {
    const giftId = mutation.key as string;
    const updates = diffGift(
      mutation.original as Gift,
      mutation.modified as Gift,
    );
    if (Object.keys(updates).length === 0) return;
    await updateGift({ data: { giftId, updates } });
  }

  async function persistGiftInsert(
    mutation: PendingMutation<Gift, "insert">,
  ) {
    const draft = mutation.modified as Gift;
    return createGift({
      data: {
        childId: draft.childId,
        title: draft.title,
        productUrl: draft.productUrl,
        listedPrice: draft.listedPrice,
        familyPublicNotes: draft.familyPublicNotes,
        active: draft.active,
      },
    });
  }

  const childrenCollection = createCollection(
    queryCollectionOptions({
      id: "children",
      queryClient,
      syncMode: "on-demand",
      getKey: (c: Child) => c.id,
      queryKey: (opts) => {
        const parsed = parseLoadSubsetOptions(opts);
        const idFilter = parsed.filters.find(
          (f) => f.field.join(".") === "id" && f.operator === "eq",
        );
        if (idFilter) return ["children-coll", "id", idFilter.value];

        const familyFilter = parsed.filters.find(
          (f) => f.field.join(".") === "familyId" && f.operator === "eq",
        );
        if (familyFilter)
          return ["children-coll", "family", familyFilter.value];

        return ["children-coll", "all"];
      },
      queryFn: async ({ meta }) => {
        const parsed = parseLoadSubsetOptions(
          meta?.loadSubsetOptions as Parameters<
            typeof parseLoadSubsetOptions
          >[0],
        );

        const idFilter = parsed.filters.find(
          (f) => f.field.join(".") === "id" && f.operator === "eq",
        );
        if (idFilter) {
          const child = await getChildById({
            data: { childId: idFilter.value as string },
          });
          return child ? [child] : [];
        }

        const familyFilter = parsed.filters.find(
          (f) => f.field.join(".") === "familyId" && f.operator === "eq",
        );
        if (familyFilter) {
          return getChildProfilesForFamily({
            data: { familyId: familyFilter.value as string },
          });
        }

        throw new Error("Unsupported children query");
      },
      onUpdate: async ({ transaction }) => {
        try {
          for (const m of transaction.mutations) {
            await persistChildUpdate(m);
          }
          await invalidateChildDerivedCaches();
          toast.success("Child profile updated successfully");
        } catch (error) {
          toast.error(getUpdateChildErrorMessage(error as Error));
          throw error;
        }
      },
    }),
  );

  const familiesCollection = createCollection(
    queryCollectionOptions({
      id: "families",
      queryClient,
      syncMode: "on-demand",
      getKey: (f: Family) => f.id,
      queryKey: (opts) => {
        const parsed = parseLoadSubsetOptions(opts);
        const idFilter = parsed.filters.find(
          (f) => f.field.join(".") === "id" && f.operator === "eq",
        );
        if (idFilter) return ["families-coll", "id", idFilter.value];
        return ["families-coll", "all"];
      },
      queryFn: async ({ meta }) => {
        const parsed = parseLoadSubsetOptions(
          meta?.loadSubsetOptions as Parameters<
            typeof parseLoadSubsetOptions
          >[0],
        );
        const idFilter = parsed.filters.find(
          (f) => f.field.join(".") === "id" && f.operator === "eq",
        );
        if (idFilter) {
          const family = await getFamilyById({
            data: { familyId: idFilter.value as string },
          });
          return family ? [family] : [];
        }
        throw new Error("Unsupported families query");
      },
      onUpdate: async ({ transaction }) => {
        try {
          let lastReviewChanged = false;
          for (const m of transaction.mutations) {
            const result = await persistFamilyUpdate(m);
            if (result.reviewChanged) lastReviewChanged = true;
            await invalidateFamilyDerivedCaches(m.key as string);
          }
          toast.success(
            lastReviewChanged
              ? "Family review status updated"
              : "Family information updated successfully",
          );
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          toast.error(`Failed to update family: ${message}`);
          throw error;
        }
      },
    }),
  );

  const giftsCollection = createCollection(
    queryCollectionOptions({
      id: "gifts",
      queryClient,
      syncMode: "on-demand",
      getKey: (g: Gift) => g.id,
      queryKey: (opts) => {
        const parsed = parseLoadSubsetOptions(opts);
        const childFilter = parsed.filters.find(
          (f) => f.field.join(".") === "childId" && f.operator === "eq",
        );
        if (childFilter)
          return ["gifts-coll", "child", childFilter.value];
        return ["gifts-coll", "all"];
      },
      queryFn: async ({ meta }) => {
        const parsed = parseLoadSubsetOptions(
          meta?.loadSubsetOptions as Parameters<
            typeof parseLoadSubsetOptions
          >[0],
        );
        const childFilter = parsed.filters.find(
          (f) => f.field.join(".") === "childId" && f.operator === "eq",
        );
        if (childFilter) {
          return getChildGiftsByChildId({
            data: { childId: childFilter.value as string },
          });
        }
        throw new Error("Unsupported gifts query");
      },
      onUpdate: async ({ transaction }) => {
        try {
          for (const m of transaction.mutations) {
            await persistGiftUpdate(m);
          }
          await invalidateGiftDerivedCaches();
          toast.success("Gift updated successfully");
        } catch (error) {
          toast.error(getUpdateGiftErrorMessage(error as Error));
          throw error;
        }
      },
      onInsert: async ({ transaction, collection }) => {
        try {
          for (const m of transaction.mutations) {
            const draft = m.modified as Gift;
            const created = await persistGiftInsert(m);
            if (created.id !== draft.id) {
              collection.utils.writeDelete(draft.id);
              collection.utils.writeInsert(created);
            } else {
              collection.utils.writeUpdate(created);
            }
          }
          await invalidateGiftDerivedCaches();
          toast.success("Gift added successfully");
          return { refetch: false };
        } catch (error) {
          toast.error(getCreateGiftErrorMessage(error as Error));
          throw error;
        }
      },
    }),
  );

  async function persistBatchMutation(transaction: {
    mutations: ReadonlyArray<PendingMutation<Record<string, unknown>>>;
  }) {
    const familyIdsTouched = new Set<string>();
    let touchedChild = false;
    let touchedGift = false;
    let createdGift = false;
    let touchedFamilyReview = false;

    for (const m of transaction.mutations) {
      const collectionId = m.collection.id;

      if (collectionId === "children" && m.type === "update") {
        try {
          await persistChildUpdate(
            m as unknown as PendingMutation<Child, "update">,
          );
          touchedChild = true;
        } catch (error) {
          toast.error(getUpdateChildErrorMessage(error as Error));
          throw error;
        }
        continue;
      }

      if (collectionId === "families" && m.type === "update") {
        try {
          const result = await persistFamilyUpdate(
            m as unknown as PendingMutation<Family, "update">,
          );
          familyIdsTouched.add(m.key as string);
          if (result.reviewChanged) touchedFamilyReview = true;
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Unknown error";
          toast.error(`Failed to update family: ${message}`);
          throw error;
        }
        continue;
      }

      if (collectionId === "gifts" && m.type === "update") {
        try {
          await persistGiftUpdate(
            m as unknown as PendingMutation<Gift, "update">,
          );
          touchedGift = true;
        } catch (error) {
          toast.error(getUpdateGiftErrorMessage(error as Error));
          throw error;
        }
        continue;
      }

      if (collectionId === "gifts" && m.type === "insert") {
        try {
          const created = await persistGiftInsert(
            m as unknown as PendingMutation<Gift, "insert">,
          );
          const draft = m.modified as Gift;
          if (created.id !== draft.id) {
            m.collection.utils.writeDelete(draft.id);
            m.collection.utils.writeInsert(created);
          } else {
            m.collection.utils.writeUpdate(created);
          }
          createdGift = true;
        } catch (error) {
          toast.error(getCreateGiftErrorMessage(error as Error));
          throw error;
        }
        continue;
      }

      throw new Error(
        `Unsupported mutation: ${collectionId} / ${m.type}`,
      );
    }

    const invalidations: Array<Promise<unknown>> = [];
    if (touchedChild) invalidations.push(invalidateChildDerivedCaches());
    if (touchedGift || createdGift)
      invalidations.push(invalidateGiftDerivedCaches());
    for (const familyId of familyIdsTouched) {
      invalidations.push(invalidateFamilyDerivedCaches(familyId));
    }
    await Promise.all(invalidations);

    if (touchedFamilyReview) {
      toast.success("Family review status updated");
    } else if (touchedChild) {
      toast.success("Child profile updated successfully");
    } else if (createdGift) {
      toast.success("Gift added successfully");
    } else if (touchedGift) {
      toast.success("Gift updated successfully");
    } else if (familyIdsTouched.size > 0) {
      toast.success("Family information updated successfully");
    }
  }

  return {
    children: childrenCollection,
    families: familiesCollection,
    gifts: giftsCollection,
    persistBatchMutation,
  };
}
