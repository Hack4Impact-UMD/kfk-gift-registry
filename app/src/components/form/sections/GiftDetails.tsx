import { GiftIcon } from "@heroicons/react/24/solid";
import type { useGiftsForm } from "@/hooks/form/FormHooks";
import { CardDescription } from "@/components/ui/card";

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
              {(field) => (
                <field.FormFieldInput
                  Icon={GiftIcon}
                  label={`Gift #${i + 1} URL${i !== 0 ? " (Optional)" : ""}`}
                  placeholder="e.g. amazon.com/Monopoly-Family-Board-Players"
                  required={i === 0}
                  disabled={disabled}
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
                      if (i !== 0 && !value) return undefined;
                      if (!value) return "Gift name is required";
                      if (value.length > 100) return "Gift name is too long";
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
                  required={i === 0}
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
              name={
                `giftSelections[${childIndex}].backupGifts[${i}].giftUrl`
              }
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
              {(field) => (
                <field.FormFieldInput
                  Icon={GiftIcon}
                  label={`Backup Gift #${i + 1} URL`}
                  placeholder="e.g. amazon.com/Monopoly-Family-Board-Players"
                  required
                  disabled={disabled}
                />
              )}
            </form.AppField>
            <form.AppField
              name={
                `giftSelections[${childIndex}].backupGifts[${i}].giftName`
              }
              validators={
                disabled
                  ? undefined
                  : {
                    onChange: ({ value }) => {
                      const str = value;
                      if (!str) return "Gift name is required";
                      if (str.length > 100) return "Gift name is too long";
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
                  required
                  disabled={disabled}
                />
              )}
            </form.AppField>
          </div>
        ))}
      </div>

      <form.AppField
        name={`giftSelections[${childIndex}].verified`}
      >
        {(field) => (
          <field.FormCheckbox disabled={disabled}>
            I verify that all selected gifts are $25 or under based on
            the original price.
          </field.FormCheckbox>
        )}
      </form.AppField>
    </div>
  );
}
