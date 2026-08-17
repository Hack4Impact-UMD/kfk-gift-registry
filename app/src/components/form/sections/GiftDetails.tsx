import { CurrencyDollarIcon, GiftIcon } from "@heroicons/react/24/solid";
import type { useGiftsForm } from "@/hooks/family-form/formHooks";
import { CardDescription } from "@/components/ui/card";
import {
  GIFT_LISTING_URL_WARNING_MESSAGE,
  GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE,
  GIFT_PRICE_INVALID_MESSAGE,
  GIFT_TITLE_REQUIRED_MESSAGE,
  GIFT_TITLE_TOO_LONG_MESSAGE,
  MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH,
  MAX_GIFT_PRICE,
  MAX_GIFT_TITLE_LENGTH,
  getGiftTitleTooLongCounterMessage,
  isValidGiftListingUrl,
} from "common";

type GiftDetailsFormProps = {
  form: ReturnType<typeof useGiftsForm>;
  childIndex: number;
  childName: string;
  disabled?: boolean;
};

export function GiftDetailsForm({
  form,
  childIndex,
  disabled = false,
}: GiftDetailsFormProps) {
  type GiftType = "gifts" | "backupGifts";
  type GiftFieldOverrides = {
    giftName?: string;
    giftUrl?: string;
    listedPrice?: string;
    familyPublicNotes?: string;
  };
  const isGiftRowSelected = (
    giftType: GiftType,
    giftIndex: number,
    overrides?: GiftFieldOverrides,
  ) => {
    const gift =
      form.state.values.giftSelections[childIndex]?.[giftType][giftIndex];
    if (!gift) return false;

    return (
      (overrides?.giftName ?? gift.giftName).trim() !== "" ||
      (overrides?.giftUrl ?? gift.giftUrl).trim() !== "" ||
      (overrides?.listedPrice ?? gift.listedPrice).trim() !== "" ||
      (overrides?.familyPublicNotes ?? gift.familyPublicNotes ?? "").trim() !==
        ""
    );
  };

  const validateGiftRowFields = (giftType: GiftType, giftIndex: number) => {
    if (giftType === "gifts") {
      void form.validateField(
        `giftSelections[${childIndex}].gifts[${giftIndex as 0 | 1 | 2}].giftUrl`,
        "change",
      );
      void form.validateField(
        `giftSelections[${childIndex}].gifts[${giftIndex as 0 | 1 | 2}].giftName`,
        "change",
      );
      void form.validateField(
        `giftSelections[${childIndex}].gifts[${giftIndex as 0 | 1 | 2}].listedPrice`,
        "change",
      );
      return;
    }

    void form.validateField(
      `giftSelections[${childIndex}].backupGifts[${giftIndex as 0 | 1}].giftUrl`,
      "change",
    );
    void form.validateField(
      `giftSelections[${childIndex}].backupGifts[${giftIndex as 0 | 1}].giftName`,
      "change",
    );
    void form.validateField(
      `giftSelections[${childIndex}].backupGifts[${giftIndex as 0 | 1}].listedPrice`,
      "change",
    );
  };

  //TODO: update the child status dropdown wording/options

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-7">
        {([0, 1, 2] as const).map((i) => (
          <div key={i}>
            <CardDescription className="text-md text-kfk-blue -mb-2">
              Gift #{i + 1}
            </CardDescription>
            <form.AppField
              name={`giftSelections[${childIndex}].gifts[${i}].giftUrl`}
              validators={
                disabled
                  ? undefined
                  : {
                      onChange: ({ value }) => {
                        const trimmedValue = value.trim();
                        const urlIsRequired =
                          i === 0 ||
                          isGiftRowSelected("gifts", i, {
                            giftUrl: trimmedValue,
                          });
                        if (!trimmedValue) {
                          return urlIsRequired ? "URL is required" : undefined;
                        }

                        if (!isValidGiftListingUrl(trimmedValue)) {
                          return GIFT_LISTING_URL_WARNING_MESSAGE;
                        }

                        return undefined;
                      },
                    }
              }
            >
              {(field) => (
                <field.FormFieldInput
                  Icon={GiftIcon}
                  label={`Gift #${i + 1} URL${i !== 0 ? " (Optional)" : ""}`}
                  placeholder="e.g. amazon.com/Monopoly-Family-Board-Players"
                  required={i === 0}
                  disabled={disabled}
                  warningMessages={[GIFT_LISTING_URL_WARNING_MESSAGE]}
                />
              )}
            </form.AppField>
            <form.AppField
              name={`giftSelections[${childIndex}].gifts[${i}].giftName`}
              validators={
                disabled
                  ? undefined
                  : {
                      onChange: ({ value }) => {
                        const trimmedValue = value.trim();
                        const nameIsRequired =
                          i === 0 ||
                          isGiftRowSelected("gifts", i, {
                            giftName: trimmedValue,
                          });
                        if (!trimmedValue) {
                          return nameIsRequired
                            ? GIFT_TITLE_REQUIRED_MESSAGE
                            : undefined;
                        }
                        if (value.length > MAX_GIFT_TITLE_LENGTH) {
                          return getGiftTitleTooLongCounterMessage(
                            value.length,
                          );
                        }
                        return undefined;
                      },
                    }
              }
            >
              {(field) => (
                <field.FormFieldInput
                  Icon={GiftIcon}
                  label={`Gift #${i + 1} Name${i !== 0 ? " (Optional)" : ""}`}
                  placeholder="e.g. Monopoly"
                  characterLimit={MAX_GIFT_TITLE_LENGTH}
                  required={i === 0}
                  maxCharactersErrorMessage={GIFT_TITLE_TOO_LONG_MESSAGE}
                  showMaxCharactersError
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField
              name={`giftSelections[${childIndex}].gifts[${i}].listedPrice`}
              validators={
                disabled
                  ? undefined
                  : {
                      onChange: ({ value }) => {
                        const priceIsRequired =
                          i === 0 ||
                          isGiftRowSelected("gifts", i, {
                            listedPrice: value,
                          });
                        if (!value.trim()) {
                          return priceIsRequired
                            ? "Price is required"
                            : undefined;
                        }
                        const price = Number(value);
                        if (
                          !Number.isFinite(price) ||
                          price < 0 ||
                          price > MAX_GIFT_PRICE
                        ) {
                          return GIFT_PRICE_INVALID_MESSAGE;
                        }
                        return undefined;
                      },
                    }
              }
            >
              {(field) => (
                <field.FormFieldInput
                  Icon={CurrencyDollarIcon}
                  label={`Gift #${i + 1} Price${i !== 0 ? " (Optional unless selected)" : ""}`}
                  placeholder="e.g. 19.99"
                  inputMode="decimal"
                  required={i === 0}
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField
              name={`giftSelections[${childIndex}].gifts[${i}].familyPublicNotes`}
              validators={{
                onChange: ({ value }) => {
                  validateGiftRowFields("gifts", i);
                  if (!value) return undefined;
                  if (value.length > MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH) {
                    return GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE;
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.FormTextarea
                  className="mt-2"
                  label={`Gift #${i + 1} Public Notes`}
                  placeholder="Add any additional information to be displayed alongside the gift listing"
                  maxLength={MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH}
                  maxCharactersErrorMessage={
                    GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE
                  }
                  showMaxCharactersErrorImmediately
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-7">
        {([0, 1] as const).map((i) => (
          <div key={i}>
            <CardDescription className="text-md text-[var(--color-kfk-blue)] -mb-2">
              Backup Gift #{i + 1}
            </CardDescription>
            <form.AppField
              name={`giftSelections[${childIndex}].backupGifts[${i}].giftUrl`}
              validators={
                disabled
                  ? undefined
                  : {
                      onChange: ({ value }) => {
                        const trimmedValue = value.trim();
                        if (!trimmedValue) return "URL is required";
                        if (!isValidGiftListingUrl(trimmedValue)) {
                          return GIFT_LISTING_URL_WARNING_MESSAGE;
                        }
                        return undefined;
                      },
                    }
              }
            >
              {(field) => (
                <field.FormFieldInput
                  Icon={GiftIcon}
                  label={`Backup Gift #${i + 1} URL`}
                  placeholder="e.g. amazon.com/Monopoly-Family-Board-Players"
                  required
                  disabled={disabled}
                  warningMessages={[GIFT_LISTING_URL_WARNING_MESSAGE]}
                />
              )}
            </form.AppField>
            <form.AppField
              name={`giftSelections[${childIndex}].backupGifts[${i}].giftName`}
              validators={
                disabled
                  ? undefined
                  : {
                      onChange: ({ value }) => {
                        const str = value;
                        if (!str) return GIFT_TITLE_REQUIRED_MESSAGE;
                        if (str.length > MAX_GIFT_TITLE_LENGTH) {
                          return getGiftTitleTooLongCounterMessage(
                            value.length,
                          );
                        }
                        return undefined;
                      },
                    }
              }
            >
              {(field) => (
                <field.FormFieldInput
                  Icon={GiftIcon}
                  label={`Backup Gift #${i + 1} Name`}
                  placeholder="e.g. Monopoly"
                  characterLimit={MAX_GIFT_TITLE_LENGTH}
                  required
                  maxCharactersErrorMessage={GIFT_TITLE_TOO_LONG_MESSAGE}
                  showMaxCharactersError
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField
              name={`giftSelections[${childIndex}].backupGifts[${i}].listedPrice`}
              validators={
                disabled
                  ? undefined
                  : {
                      onChange: ({ value }) => {
                        if (!value.trim()) return "Price is required";
                        const price = Number(value);
                        if (
                          !Number.isFinite(price) ||
                          price < 0 ||
                          price > MAX_GIFT_PRICE
                        ) {
                          return GIFT_PRICE_INVALID_MESSAGE;
                        }
                        return undefined;
                      },
                    }
              }
            >
              {(field) => (
                <field.FormFieldInput
                  Icon={CurrencyDollarIcon}
                  label={`Backup Gift #${i + 1} Price`}
                  placeholder="e.g. 19.99"
                  inputMode="decimal"
                  required
                  disabled={disabled}
                />
              )}
            </form.AppField>

            <form.AppField
              name={`giftSelections[${childIndex}].backupGifts[${i}].familyPublicNotes`}
              validators={{
                onChange: ({ value }) => {
                  validateGiftRowFields("backupGifts", i);
                  if (!value) return undefined;
                  if (value.length > MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH) {
                    return GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE;
                  }
                  return undefined;
                },
              }}
            >
              {(field) => (
                <field.FormTextarea
                  className="mt-2"
                  label={`Backup Gift #${i + 1} Public Notes`}
                  placeholder="Add any additional information to be displayed alongside the gift listing"
                  maxLength={MAX_GIFT_FAMILY_PUBLIC_NOTES_LENGTH}
                  maxCharactersErrorMessage={
                    GIFT_FAMILY_PUBLIC_NOTES_TOO_LONG_MESSAGE
                  }
                  showMaxCharactersErrorImmediately
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>
        ))}
      </div>
    </div>
  );
}
