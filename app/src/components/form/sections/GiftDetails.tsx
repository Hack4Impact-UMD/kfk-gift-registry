import { GiftIcon } from "@heroicons/react/24/solid";
import type { useGiftsForm } from "@/hooks/family-form/formHooks";
import { CardDescription } from "@/components/ui/card";
import { useState, useRef } from "react";
import { fetchProductDetails } from "@/server/functions/giftLinks";

type GiftDetailsFormProps = {
  form: ReturnType<typeof useGiftsForm>;
  childIndex: number;
  childName: string;
  disabled?: boolean;
};

const GIFT_NAME_MAX_CHARS = 50;

export function GiftDetailsForm({
  form,
  childIndex,
  disabled = false,
}: GiftDetailsFormProps) {
  const [fetchStatus, setFetchStatus] = useState<
    Record<string, { loading: boolean; error: string | null }>
  >({});
  const manuallyEditedRef = useRef<Set<string>>(new Set());
  const lastFetchedUrlRef = useRef<Record<string, string>>({});

  type GiftType = "gifts" | "backupGifts";

  const handleUrlBlur = async (
    key: string,
    giftType: GiftType,
    giftIndex: number,
    url: string,
  ) => {
    if (!url) return;

    const requestedUrl = url;
    const getNameValue = () =>
      form.state.values.giftSelections[childIndex]?.[giftType][giftIndex]
        ?.giftName ?? "";

    const nameIsEmpty = getNameValue().trim() === "";

    if (requestedUrl !== lastFetchedUrlRef.current[key]) {
      manuallyEditedRef.current.delete(key);
    }

    if (requestedUrl === lastFetchedUrlRef.current[key] && !nameIsEmpty) {
      return;
    }

    lastFetchedUrlRef.current[key] = requestedUrl;
    setFetchStatus((prev) => ({
      ...prev,
      [key]: { loading: true, error: null },
    }));

    try {
      const result = await fetchProductDetails({ data: { url: requestedUrl } });

      if (lastFetchedUrlRef.current[key] !== requestedUrl) {
        return;
      }

      setFetchStatus((prev) => ({
        ...prev,
        [key]: { loading: false, error: null },
      }));

      if (getNameValue().trim() === "" || !manuallyEditedRef.current.has(key)) {
        if (giftType === "gifts") {
          const nameFieldPath = `giftSelections[${childIndex}].${giftType}[${giftIndex as 0 | 1 | 2}].giftName` as const;
          form.setFieldValue(nameFieldPath, result.productName);
        } else {
          const nameFieldPath = `giftSelections[${childIndex}].${giftType}[${giftIndex as 0 | 1}].giftName` as const;
          form.setFieldValue(nameFieldPath, result.productName);
        }
      }
    } catch {
      if (lastFetchedUrlRef.current[key] !== requestedUrl) {
        return;
      }

      setFetchStatus((prev) => ({
        ...prev,
        [key]: {
          loading: false,
          error:
            "Unable to fetch product item, please double check and make sure link is correct",
        },
      }));
    }
  };

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
                      if (i !== 0 && !value) return undefined;
                      if (!value) return "URL is required";
                      try {
                        const url = new URL(value);
                        if (!["http:", "https:"].includes(url.protocol)) {
                          return "URL must start with http or https";
                        }
                        return undefined;
                      } catch {
                        return "Please enter a valid URL";
                      }
                    },
                  }
              }
            >
              {(field) => {
                const key = `${childIndex}-gifts-${i}`;
                const status = fetchStatus[key];
                return (
                  <>
                    <div
                      onBlur={() =>
                        handleUrlBlur(key, "gifts", i, field.state.value)
                      }
                    >
                      <field.FormFieldInput
                        Icon={GiftIcon}
                        label={`Gift #${i + 1} URL${i !== 0 ? " (Optional)" : ""}`}
                        placeholder="e.g. amazon.com/Monopoly-Family-Board-Players"
                        required={i === 0}
                        disabled={disabled}
                      />
                    </div>
                    {status?.loading && (
                      <p className="text-xs text-slate-500 mt-1 pl-1">
                        Fetching product info...
                      </p>
                    )}
                    {status?.error && (
                      <p className="text-xs text-red-500 mt-1 pl-1">
                        {status.error}
                      </p>
                    )}
                  </>
                );
              }}
            </form.AppField>
            <form.AppField
              name={`giftSelections[${childIndex}].gifts[${i}].giftName`}
              validators={
                disabled
                  ? undefined
                  : {
                    onChange: ({ value }) => {
                      if (i !== 0 && !value) return undefined;
                      if (!value) return "Gift name is required";
                      if (value.length > GIFT_NAME_MAX_CHARS)
                        return `Gift name is too long: ${value.length}/${GIFT_NAME_MAX_CHARS} characters`;
                      return undefined;
                    },
                  }
              }
            >
              {(field) => {
                const key = `${childIndex}-gifts-${i}`;
                return (
                  <div onChange={() => manuallyEditedRef.current.add(key)}>
                    <field.FormFieldInput
                      Icon={GiftIcon}
                      label={`Gift #${i + 1} Name${i !== 0 ? " (Optional)" : ""}`}
                      placeholder="e.g. Monopoly"
                      required={i === 0}
                      disabled={disabled}
                    />
                  </div>
                );
              }}
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
                      if (!value) return "URL is required";
                      try {
                        const url = new URL(value);
                        if (!["http:", "https:"].includes(url.protocol)) {
                          return "URL must start with http or https";
                        }
                        return undefined;
                      } catch {
                        return "Please enter a valid URL";
                      }
                    },
                  }
              }
            >
              {(field) => {
                const key = `${childIndex}-backupGifts-${i}`;
                const status = fetchStatus[key];
                return (
                  <>
                    <div
                      onBlur={() =>
                        handleUrlBlur(key, "backupGifts", i, field.state.value)
                      }
                    >
                      <field.FormFieldInput
                        Icon={GiftIcon}
                        label={`Backup Gift #${i + 1} URL`}
                        placeholder="e.g. amazon.com/Monopoly-Family-Board-Players"
                        required
                        disabled={disabled}
                      />
                    </div>
                    {status?.loading && (
                      <p className="text-xs text-slate-500 mt-1 pl-1">
                        Fetching product info...
                      </p>
                    )}
                    {status?.error && (
                      <p className="text-xs text-red-500 mt-1 pl-1">
                        {status.error}
                      </p>
                    )}
                  </>
                );
              }}
            </form.AppField>
            <form.AppField
              name={`giftSelections[${childIndex}].backupGifts[${i}].giftName`}
              validators={
                disabled
                  ? undefined
                  : {
                    onChange: ({ value }) => {
                      const str = value;
                      if (!str) return "Gift name is required";
                      if (str.length > GIFT_NAME_MAX_CHARS)
                        return `Gift name is too long: ${value.length}/${GIFT_NAME_MAX_CHARS} characters`;
                      return undefined;
                    },
                  }
              }
            >
              {(field) => {
                const key = `${childIndex}-backupGifts-${i}`;
                return (
                  <div onChange={() => manuallyEditedRef.current.add(key)}>
                    <field.FormFieldInput
                      Icon={GiftIcon}
                      label={`Backup Gift #${i + 1} Name`}
                      placeholder="e.g. Monopoly"
                      required
                      disabled={disabled}
                    />
                  </div>
                );
              }}
            </form.AppField>
          </div>
        ))}
      </div>

      <form.AppField name={`giftSelections[${childIndex}].verified`}>
        {(field) => (
          <field.FormCheckbox disabled={disabled}>
            I verify that all selected gifts are $25 or under based on the
            original price.
          </field.FormCheckbox>
        )}
      </form.AppField>
    </div>
  );
}
