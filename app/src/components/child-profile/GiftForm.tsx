import { useState } from "react";
import type { FormEvent } from "react";
import type { Gift } from "common";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  GIFT_TITLE_TOO_LONG_MESSAGE,
  MAX_GIFT_TITLE_LENGTH,
  isGiftTitleTooLong,
} from "common";

export type GiftFormValues = {
  title: string;
  productUrl: string;
  listedPrice?: number;
  active: boolean;
};

type GiftFormProps = {
  mode?: "add" | "edit";
  initial?: Gift;
  canAddToStorefront?: boolean;
  disabled?: boolean;
  isSubmitting?: boolean;
  onSubmit: (gift: GiftFormValues) => Promise<void>;
};

export function GiftForm({
  mode = "add",
  initial,
  canAddToStorefront = false,
  disabled = false,
  isSubmitting = false,
  onSubmit,
}: GiftFormProps) {
  const isEdit = mode === "edit";
  const [title, setTitle] = useState(initial?.title ?? "");
  const [productUrl, setProductUrl] = useState(initial?.productUrl ?? "");
  const [listedPrice, setListedPrice] = useState(
    initial?.listedPrice != null ? String(initial.listedPrice) : "",
  );
  const [wantsStorefrontPlacement, setWantsStorefrontPlacement] =
    useState(canAddToStorefront);
  const addToStorefront = canAddToStorefront && wantsStorefrontPlacement;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedProductUrl = productUrl.trim();
    const trimmedPrice = listedPrice.trim();

    if (!trimmedTitle || !trimmedProductUrl) {
      toast.error("Gift name and link are required");
      return;
    }

    if (isGiftTitleTooLong(trimmedTitle)) {
      toast.error(GIFT_TITLE_TOO_LONG_MESSAGE);
      return;
    }

    let parsedPrice: number | undefined;
    if (trimmedPrice) {
      parsedPrice = Number(trimmedPrice);
      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        toast.error("Price must be a valid number");
        return;
      }
    }

    try {
      await onSubmit({
        title: trimmedTitle,
        productUrl: trimmedProductUrl,
        listedPrice: parsedPrice,
        active: isEdit
          ? (initial?.active ?? false)
          : canAddToStorefront
            ? addToStorefront
            : false,
      });

      if (!isEdit) {
        setTitle("");
        setProductUrl("");
        setListedPrice("");
        setWantsStorefrontPlacement(canAddToStorefront);
      }
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit Gift" : "Add Gift"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update this gift's details."
            : "Add a gift directly to this child's profile."}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3">
          <div className="space-y-1">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Gift name"
              disabled={disabled || isSubmitting}
              required
            />
            <p
              className={`text-right text-xs ${
                title.length <= MAX_GIFT_TITLE_LENGTH
                  ? "text-muted-foreground"
                  : "text-destructive"
              }`}
            >
              {title.length}/{MAX_GIFT_TITLE_LENGTH} characters
            </p>
          </div>
          <Input
            type="url"
            value={productUrl}
            onChange={(event) => setProductUrl(event.target.value)}
            placeholder="Gift link"
            disabled={disabled || isSubmitting}
            required
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            value={listedPrice}
            onChange={(event) => setListedPrice(event.target.value)}
            placeholder="Price (optional)"
            disabled={disabled || isSubmitting}
          />
        </div>

        {!isEdit && canAddToStorefront && (
          <label className="flex items-center gap-2 text-sm text-foreground">
            <Checkbox
              checked={addToStorefront}
              onCheckedChange={(c) => {
                setWantsStorefrontPlacement(c === true);
              }}
              disabled={disabled || isSubmitting || !canAddToStorefront}
              className="size-4 rounded border border-input"
            />
            Add to storefront now
          </label>
        )}

        {!isEdit && !canAddToStorefront && (
          <p className="text-sm text-muted-foreground">
            This child already has 3 storefront gifts. New gifts will be added
            as backup gifts.
          </p>
        )}

        {disabled && (
          <p className="text-sm text-muted-foreground">
            Save or cancel the current edits before{" "}
            {isEdit ? "editing" : "adding"} another gift.
          </p>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={disabled || isSubmitting}
            className="w-full sm:w-auto"
          >
            {isEdit
              ? isSubmitting
                ? "Saving..."
                : "Save Changes"
              : isSubmitting
                ? "Adding..."
                : "Add Gift"}
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
