import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";

type AddGiftFormProps = {
  canAddToStorefront: boolean;
  disabled?: boolean;
  isSubmitting?: boolean;
  onSubmit: (gift: {
    title: string;
    productUrl: string;
    listedPrice?: number;
    active: boolean;
  }) => Promise<void>;
};

export function AddGiftForm({
  canAddToStorefront,
  disabled = false,
  isSubmitting = false,
  onSubmit,
}: AddGiftFormProps) {
  const [title, setTitle] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [listedPrice, setListedPrice] = useState("");
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
        active: canAddToStorefront ? addToStorefront : false,
      });

      setTitle("");
      setProductUrl("");
      setListedPrice("");
      setWantsStorefrontPlacement(canAddToStorefront);
    } catch {
      // Error toast is handled by the mutation hook.
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
    >
      <div className="space-y-1">
        <h2 className="text-xl font-semibold tracking-tight">Add Gift</h2>
        <p className="text-sm text-muted-foreground">
          Add a gift directly to this child's profile.
        </p>
      </div>

      <div className="grid gap-3">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Gift name"
          disabled={disabled || isSubmitting}
          required
        />
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

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={addToStorefront}
          onChange={(event) =>
            setWantsStorefrontPlacement(event.target.checked)
          }
          disabled={disabled || isSubmitting || !canAddToStorefront}
          className="size-4 rounded border border-input"
        />
        Add to storefront now
      </label>

      {!canAddToStorefront && (
        <p className="text-sm text-muted-foreground">
          This child already has 3 storefront gifts. New gifts will be added as
          backup gifts.
        </p>
      )}

      {disabled && (
        <p className="text-sm text-muted-foreground">
          Save or cancel the current edits before adding another gift.
        </p>
      )}

      <Button
        type="submit"
        disabled={disabled || isSubmitting}
        className="w-full sm:w-auto"
      >
        {isSubmitting ? "Adding..." : "Add Gift"}
      </Button>
    </form>
  );
}
