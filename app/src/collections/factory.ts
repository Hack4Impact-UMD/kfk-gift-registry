import { createCollection, createTransaction } from "@tanstack/react-db";
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
} from "@/server/functions/child";
import {
  getFamilyById,
  updateFamily,
  updateFamilyReviewStatus,
} from "@/server/functions/family";
import { queries } from "@/queries";
import { toast } from "@/lib/toast";
import { getValidationMessage } from "@/lib/serverValidation";
import type { Child, Family, Gift } from "common";
import {
  CHILD_PUBLIC_BLURB_TOO_LONG_MESSAGE,
  GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE,
  GIFT_TITLE_TOO_LONG_MESSAGE,
  MAX_CHILD_PUBLIC_BLURB_LENGTH,
  MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH,
  MAX_GIFT_TITLE_LENGTH,
} from "common";
import { uploadChildProfilePicture } from "@/services/storageService";
import { getDownloadURL } from "firebase/storage";

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

function getUpdateFamilyErrorMessage(error: Error) {
  return `Failed to update family: ${error.message}`;
}

function isUpdateMutation<T extends object>(
  m: PendingMutation<T>,
): m is PendingMutation<T, "update"> {
  return m.type === "update";
}

function isInsertMutation<T extends object>(
  m: PendingMutation<T>,
): m is PendingMutation<T, "insert"> {
  return m.type === "insert";
}

export type Collections = ReturnType<typeof createCollections>;

export function createCollections(queryClient: QueryClient) {
  function invalidateChildDerivedCaches() {
    return Promise.all([
      queryClient.invalidateQueries({ queryKey: ["children-coll"] }),
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
        queryKey: ["families-coll", "id", familyId],
      }),
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
      queryClient.invalidateQueries({ queryKey: ["gifts-coll"] }),
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
    const modified = mutation.modified;
    const deletedPhoto = modified.photoUrl === "";

    // Firebase Storage returns the same download URL/token on re-upload to
    // the same path, so a cache-busting query param is required or the
    // browser will keep showing the previous image for that URL.
    let photoUrl = modified.photoUrl;
    if (photoUrl?.startsWith("data:")) {
      const res = await uploadChildProfilePicture(childId, photoUrl);
      photoUrl = (await getDownloadURL(res)) + `&cb=${Date.now()}`;
      mutation.collection.utils.writeUpdate({ id: childId, photoUrl });
    }

    const updates = {
      ...(Object.fromEntries(
        UPDATABLE_CHILD_FIELDS.filter(
          (k): k is Exclude<UpdatableChildField, "photoUrl"> =>
            !(k === "photoUrl"),
        ).map((k) => [k, modified[k]]),
      ) as Pick<Child, Exclude<UpdatableChildField, "photoUrl">>),
      ...(photoUrl !== undefined ? { photoUrl } : {}),
    };

    await updateChild({ data: { childId, updates } });

    if (deletedPhoto) {
      mutation.collection.utils.writeUpdate({
        id: childId,
        photoUrl: undefined,
      });
    }
  }

  async function persistFamilyUpdate(
    mutation: PendingMutation<Family, "update">,
  ) {
    const familyId = mutation.key as string;
    const modified = mutation.modified;
    const reviewChanged = reviewStatusChanged(mutation.original, modified);

    const tasks: Array<Promise<unknown>> = [
      updateFamily({
        data: {
          familyId,
          updates: {
            contactName: modified.contactName,
            guardianRelationship: modified.guardianRelationship,
            email: modified.email,
            phone: modified.phone,
            address: modified.address,
            privateNotes: modified.privateNotes,
          },
        },
      }),
    ];

    if (reviewChanged) {
      tasks.push(
        updateFamilyReviewStatus({
          data: {
            familyId,
            updates: {
              reviewStatus: {
                approved: modified.reviewStatus.approved,
                held: modified.reviewStatus.held,
                reviewNotes: modified.reviewStatus.reviewNotes ?? "",
                holdNotes: modified.reviewStatus.holdNotes ?? "",
              },
            },
          },
        }),
      );
    }

    await Promise.all(tasks);
    return { reviewChanged };
  }

  async function persistGiftUpdate(mutation: PendingMutation<Gift, "update">) {
    const giftId = mutation.key as string;
    const updates = Object.fromEntries(
      UPDATABLE_GIFT_FIELDS.map((k) => [k, mutation.modified[k]]),
    ) as Pick<Gift, UpdatableGiftField>;
    await updateGift({ data: { giftId, updates } });
  }

  async function persistGiftInsert(mutation: PendingMutation<Gift, "insert">) {
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

        return ["children-coll"];
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
          for (const m of transaction.mutations) {
            await persistFamilyUpdate(m);
            await invalidateFamilyDerivedCaches(m.key as string);
          }
        } catch (error) {
          toast.error(getUpdateFamilyErrorMessage(error as Error));
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
        if (childFilter) return ["gifts-coll", "child", childFilter.value];
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
        } catch (error) {
          toast.error(getUpdateGiftErrorMessage(error as Error));
          throw error;
        }
      },
      onInsert: async ({ transaction }) => {
        try {
          for (const m of transaction.mutations) {
            await persistGiftInsert(m);
          }
          await invalidateGiftDerivedCaches();
          return { refetch: false };
        } catch (error) {
          toast.error(getCreateGiftErrorMessage(error as Error));
          throw error;
        }
      },
    }),
  );

  function createChildTransaction() {
    return createTransaction<Child>({
      autoCommit: false,
      mutationFn: async ({ transaction }) => {
        for (const m of transaction.mutations) {
          if (!isUpdateMutation(m)) continue;
          await persistChildUpdate(m);
        }
        await invalidateChildDerivedCaches();
      },
    });
  }

  function createFamilyTransaction() {
    return createTransaction<Family>({
      autoCommit: false,
      mutationFn: async ({ transaction }) => {
        for (const m of transaction.mutations) {
          if (!isUpdateMutation(m)) continue;
          await persistFamilyUpdate(m);
          await invalidateFamilyDerivedCaches(m.key as string);
        }
      },
    });
  }

  function createGiftsTransaction() {
    return createTransaction<Gift>({
      autoCommit: false,
      mutationFn: async ({ transaction }) => {
        for (const m of transaction.mutations) {
          if (isUpdateMutation(m)) {
            await persistGiftUpdate(m);
          } else if (isInsertMutation(m)) {
            await persistGiftInsert(m);
          }
        }
        await invalidateGiftDerivedCaches();
      },
    });
  }

  return {
    children: childrenCollection,
    families: familiesCollection,
    gifts: giftsCollection,
    createChildTransaction,
    createFamilyTransaction,
    createGiftsTransaction,
    invalidateGiftDerivedCaches,
  };
}
