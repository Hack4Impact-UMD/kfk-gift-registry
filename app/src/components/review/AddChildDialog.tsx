import { useState } from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { ChildInfoFields } from "@/components/form/sections/ChildInfo";
import { GiftDetailsForm } from "@/components/form/sections/GiftDetails";
import {
  emptyGiftSelection,
  normalizeChildInfo,
  useAppForm,
} from "@/hooks/family-form/formHooks";
import { normalizeGiftsForSubmit } from "@/hooks/mutations/useSubmitFamilyForm";
import { useCreateChildWithGifts } from "@/hooks/mutations/useCreateChildWithGifts";
import { childInfoSchema, childrenFormDefaults } from "@/lib/formSchemas";
import type { GiftsFormData } from "@/lib/formSchemas";

interface AddChildDialogProps {
  familyId: string;
}

export function AddChildDialog({ familyId }: AddChildDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-12 w-full self-center rounded-md bg-kfk-blue px-6 text-white hover:bg-kfk-blue/90"
        >
          <PlusIcon className="size-5" aria-hidden />
          Add Child
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Child</DialogTitle>
          <DialogDescription>
            Add a child and their gift selections to this family.
          </DialogDescription>
        </DialogHeader>
        <AddChildForm familyId={familyId} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}

function AddChildForm({
  familyId,
  onDone,
}: {
  familyId: string;
  onDone: () => void;
}) {
  const createChild = useCreateChildWithGifts();

  const childForm = useAppForm({
    defaultValues: childrenFormDefaults,
  });
  const giftForm = useAppForm({
    defaultValues: {
      giftSelections: [emptyGiftSelection("")],
    } satisfies GiftsFormData,
  });

  const handleSubmit = async () => {
    const childResult = childInfoSchema.safeParse(
      normalizeChildInfo(childForm.state.values.children[0]),
    );

    let gifts = null;
    try {
      gifts = normalizeGiftsForSubmit(giftForm.state.values);
    } catch {
      // the gift fields show their own errors below
    }

    if (!childResult.success || !gifts) {
      await Promise.all([
        childForm.validateAllFields("submit"),
        giftForm.validateAllFields("submit"),
      ]);
      return;
    }

    const { photoUrl, ...child } = childResult.data;
    createChild.mutate(
      {
        familyId,
        child,
        gifts: { ...gifts.giftSelections[0], childName: child.name },
        photo: photoUrl || undefined,
      },
      { onSuccess: onDone },
    );
  };

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void handleSubmit();
      }}
      className="flex flex-col gap-8"
    >
      <section className="flex flex-col gap-4">
        <h2 className="border-b-2 border-kfk-blue pb-1 text-xl font-bold text-kfk-blue">
          Child Details
        </h2>
        <ChildInfoFields
          form={childForm}
          index={0}
          displayCount={1}
          disabled={createChild.isPending}
          showPhotoNotice={false}
        />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="border-b-2 border-kfk-blue pb-1 text-xl font-bold text-kfk-blue">
          Gifts
        </h2>
        <GiftDetailsForm
          form={giftForm}
          childIndex={0}
          childName=""
          disabled={createChild.isPending}
        />
      </section>
      <DialogFooter>
        <Button
          type="submit"
          disabled={createChild.isPending}
          className="h-11 rounded-md bg-kfk-blue px-6 text-white hover:bg-kfk-blue/90"
        >
          {createChild.isPending && <Spinner />}
          Add Child
        </Button>
      </DialogFooter>
    </form>
  );
}
