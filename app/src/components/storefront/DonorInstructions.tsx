import type { ReactNode } from "react";

const steps: Array<ReactNode> = [
  "Select a child/children to view their requested gifts.",
  <>
    Select gifts by clicking on the blue &ldquo;Claim Gift&rdquo; button next to
    each gift.
  </>,
  <>
    When you finish selecting gifts, go to the yellow &ldquo;Claimed
    Gifts&rdquo; button in the top right corner of the page.
  </>,
  "Create an account and confirm.",
  <>
    <strong>CHECK YOUR EMAIL.</strong> You will automatically receive an email
    with all the info you need.
  </>,
  "Know how appreciative we all are for your kindness and generosity!",
];

export function DonorInstructions() {
  return (
    <div className="flex justify-center px-3 pt-3">
      <section className="w-full max-w-7xl rounded-md border border-kfk-blue/30 bg-kfk-blue/5 p-4">
        <h2 className="font-gaegu text-2xl font-bold text-kfk-blue">
          How to Donate
        </h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm md:text-base">
          {steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
