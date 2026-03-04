import { useForm } from '@tanstack/react-form'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { z } from 'zod'
import { 
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  GiftIcon
} from "@heroicons/react/24/solid"
import { useState } from 'react';
import { useFormContext } from "@/components/providers/FormProvider";
import { FormCheckbox, FormFieldInput, FormSelect } from "@/components/form/formcomponents"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormItem } from '@/components/ui/form';



export const Route = createFileRoute('/family/form/gift-details')({
  component: GiftsStep,
})

const giftSchema = z.object({
  giftName: z.string(),
  giftUrl: z.string(),
}).refine((data) => {
  const hasName = data.giftName.trim().length > 0;
  const hasUrl = data.giftUrl.trim().length > 0;
  return (hasName && hasUrl) || (!hasName && !hasUrl);
}, {
  message: "Both Name and URL are required if this gift is selected",
});

export const childGiftSchema = z.object({
  childName: z.string(),
  gifts: z.tuple([
    z.object({
      giftName: z.string().min(1, "Gift Name is required"),
      giftUrl: z.string().url("Valid URL is required"),
    }),
    giftSchema,
    giftSchema, 
  ]),
  backupGifts: z.tuple([
    z.object({
      giftName: z.string().min(1, "Gift Name is required"),
      giftUrl: z.string().url("Valid URL is required"),
    }),
    z.object({
      giftName: z.string().min(1, "Gift Name is required"),
      giftUrl: z.string().url("Valid URL is required"),
    }),
  ]),
  verified: z
    .boolean()
    .refine((val) => val === true, {
    message: "You must agree the conditions",
    }),
});

export const giftsFormSchema = z.object({
  giftSelections: z.array(childGiftSchema),
});

type GiftSelection = {
  giftUrl: string;
  giftName: string;
};

export type ChildInfo = {
  name: string;
  age: string;
  diagnosis: string;
  hospitalTreatedAt: string;
  socialWorkerName: string;
  photoUrl?: string;
};
const patient: ChildInfo = {
  name: "Alex",
  age: "8", 
  diagnosis: "Leukemia",
  hospitalTreatedAt: "Holy Cross",
  socialWorkerName: "Jane Doe",
  photoUrl: "https://example.com/photos/alex.jpg" 
};

const patient2: ChildInfo = {
  name: "He",
  age: "8", 
  diagnosis: "Leukemia",
  hospitalTreatedAt: "Holy Cross",
  socialWorkerName: "Jane Doe",
  photoUrl: "https://example.com/photos/alex.jpg" 
};

 function GiftsStep() {
  const { updateSection, formState } = useFormContext();
  const navigate = useNavigate();
  const childrenList = formState.children?.children || [patient, patient2];
  
  // -1: "Dashboard". 
  // 0, 1, 2: Specific forms for that child
  const [activeChildIndex, setActiveChildIndex] = useState<number>(-1);

  const handleBack = () => {
    const currentValues = form.state.values;
    updateSection("gifts", currentValues);
    navigate({ to: "/family/form/general-info" }); // Change this to child info when it's added
  }

  const form = useForm({
    defaultValues: {
      giftSelections: formState.gifts?.giftSelections ?? 
        childrenList.map(c => ({ 
          childName: c.name, 
          gifts: [
            { giftName: '', giftUrl: '' },
            { giftName: '', giftUrl: '' },
            { giftName: '', giftUrl: '' }
          ] as [GiftSelection, GiftSelection, GiftSelection], 
          backupGifts: [
            { giftName: '', giftUrl: '' },
            { giftName: '', giftUrl: '' }
          ] as [GiftSelection, GiftSelection],
          verified: false 
      })),
    },
    onSubmit: ({ value }) => {
      console.log(value);
      const result = giftsFormSchema.safeParse(value);
      if (!result.success) {
            const firstError = result.error.issues[0];
            console.log(result);
            alert(`Error: ${firstError.message}`);
            return;
      }

      updateSection("gifts", value);
      console.log(formState);
      navigate({ to: "/family/form/consent" }) // Change this to review info when it's added
    },
  });

  const isChildComplete = (index: number): 'completed' | 'pristine' | 'dirty' => {
    const childData = form.state.values.giftSelections[index];
    const isComplete = childGiftSchema.safeParse(childData).success;
    
    if (isComplete) return "completed";

    const isPristine = childData.gifts.every(g => g.giftName === '' && g.giftUrl === '') && 
                      childData.verified === false;
    
    if (isPristine) return "pristine";

    return "dirty";
  };

  const allComplete = childrenList.every((_, index) => isChildComplete(index) === "completed");

  if (activeChildIndex === -1) {
    return (
      
      <Card>
        <CardContent className="flex flex-col justify-center">
          <div className="border-b-2 border-[var(--color-kfk-blue)] w-full mb-8">
            <h2 className="text-xl font-bold text-[var(--color-kfk-blue)] pb-1">Gift Details</h2>
          </div>
          <div className="flex flex-col border bg-green-50 border-green-500 text-green-900 p-5 rounded-lg gap-4">
            <h2 className="text-center text-lg font-bold">Gift Guidelines</h2>
            <div className="flex flex-col gap-3">
              <CardDescription className="text-green-900">To help us spread the love to as many children as possible, please follow these guidelines:</CardDescription>
              <ul className="flex flex-col gap-2 list-disc px-7">
                <li>🎁 Gifts must be <strong>$25 or less</strong>, based on the <strong>original price</strong> (not the sale price).</li>
                <li>🚫 <strong>No gift cards</strong> are allowed.</li>
                <li>✅ Gifts must be selected from <a href="https://amazon.com" className="underline">Amazon.com</a> or <a href="https://macys.com" className="underline">Macy’s.com</a></li>
              </ul>
            </div>
            <CardDescription className="font-bold text-center text-green-900">Thank you for helping us make this holiday special for every child!</CardDescription>
          </div>

            {childrenList.map((child, index) => (
              <button 
                key={index}
                className={`flex flex-row justify-around ${isChildComplete(index) == "completed" ? "bg-green-500" : "bg-yellow-300"} rounded-lg text-md p-4 mx-10 mt-7`}
                onClick={() => setActiveChildIndex(index)}
              >
                <span className="my-auto">{child.name}'s Gift Selection</span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-13 margin-auto">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm4.28 10.28a.75.75 0 0 0 0-1.06l-3-3a.75.75 0 1 0-1.06 1.06l1.72 1.72H8.25a.75.75 0 0 0 0 1.5h5.69l-1.72 1.72a.75.75 0 1 0 1.06 1.06l3-3Z" clipRule="evenodd" />
                </svg>
              </button>
            ))}
          <FormItem className="flex gap-4 pt-4 mx-5 mt-5">
            <Button type="button" onClick={handleBack} variant="outline" className="flex-1 h-14 rounded-xl border-2 border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] font-bold text-lg">
              <ChevronLeftIcon className="mr-2 h-6 w-6" />
              Back
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting, state.isPristine]}
              children={([canSubmit, isSubmitting]) => (
                <Button 
                  type="submit" 
                  disabled={!allComplete}
                  onClick={() => form.handleSubmit()}
                  size="lg" className="flex-1 h-14 rounded-xl bg-[var(--color-kfk-blue)] text-white font-bold text-lg"
                >
                  {isSubmitting ? '...' : 'Next'}
                  <ChevronRightIcon className="ml-2 h-6 w-6" />
                </Button>
              )}
            />
          </FormItem>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="flex flex-col justify-around gap-7">
        <CardTitle className="mx-auto text-2xl text-[var(--color-kfk-blue)] text-center">{childrenList[activeChildIndex].name}'s Gift Selection</CardTitle>
        <CardDescription className="mx-auto"><em>Please choose up to 3 gifts for your child.</em></CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-10">
          <div className="flex flex-col gap-7">
            {[0, 1, 2].map((i) => (
              <div key={i}>
                <CardDescription className="text-md text-[var(--color-kfk-blue)] -mb-2">Gift #{i + 1}</CardDescription>
                <form.Field name={`giftSelections[${activeChildIndex}].gifts[${i}].giftUrl`}>
                  {(field) => 
                    <FormFieldInput field={field} Icon={GiftIcon} label={`Gift #${i+1} URL`} placeholder="e.g. amazon.com/Monopoly-Family-Board-Players" required={i==0}/>
                  }
                </form.Field>
                <form.Field name={`giftSelections[${activeChildIndex}].gifts[${i}].giftName`}>
                  {(field) => 
                    <FormFieldInput field={field} Icon={GiftIcon} label={`Gift #${i+1} Name`} placeholder="e.g. Monopoly" required={i==0}/>            
                  }
                </form.Field>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-7">
          {[0, 1].map((i) => (
              <div key={i}>
                <CardDescription className="text-md text-[var(--color-kfk-blue)] -mb-2">Backup Gift #{i + 1}</CardDescription>
                <form.Field name={`giftSelections[${activeChildIndex}].backupGifts[${i}].giftUrl`}>
                  {(field) => 
                  <FormFieldInput field={field} Icon={GiftIcon} label={`Backup Gift #${i+1} URL`} placeholder="e.g. amazon.com/Monopoly-Family-Board-Players" required/>
                  }
                </form.Field>
                <form.Field name={`giftSelections[${activeChildIndex}].backupGifts[${i}].giftName`}>
                  {(field) => 
                    <FormFieldInput field={field} Icon={GiftIcon} label={`Backup Gift #${i+1} Name`} placeholder="e.g. Monopoly" required/> 
                  }
                </form.Field>
              </div>
            ))}
          </div>

          <form.Field name={`giftSelections[${activeChildIndex}].verified` as any}>
            {(field) => (
              <div className="verification-row">
                <input
                  type="checkbox"
                  id={`verify-${activeChildIndex}`}
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                />
                <label htmlFor={`verify-${activeChildIndex}`}>
                  I verify that all selected gifts are $25 or under based on the original price.
                </label>
                {field.state.meta.errors && (
                  <span className="error-text">{field.state.meta.errors}</span>
                )}
              </div>
            )}
          </form.Field>
          
          <Button type="button" onClick={() => setActiveChildIndex(-1)} variant="outline" className="flex h-14 rounded-xl border-2 border-[var(--color-kfk-blue)] text-[var(--color-kfk-blue)] font-bold text-lg">
              <ChevronLeftIcon className="mr-2 h-6 w-6" />
              Back
          </Button>
      </form>
    </CardContent>
    </Card>
  );
}
