import { driver } from "driver.js";
import type { DriveStep } from "driver.js";

// Some tour targets render twice (a mobile version and a desktop version)
// and only one is actually on screen at a given viewport width.
function getVisibleTourElement(name: string): Element | undefined {
  const candidates = document.querySelectorAll(`[data-tour="${name}"]`);
  for (const el of candidates) {
    if ((el as HTMLElement).getClientRects().length > 0) return el;
  }
  return undefined;
}

function clickAllTourElements(name: string) {
  document
    .querySelectorAll<HTMLElement>(`[data-tour="${name}"]`)
    .forEach((el) => el.click());
}

const steps: Array<DriveStep> = [
  {
    element: '[data-tour="gift-drive-stats"]',
    popover: {
      title: "Track the drive's progress",
      description:
        "See how many gifts have been claimed, how many children have been helped, and how many people have donated so far.",
    },
  },
  {
    element: '[data-tour="first-child-card"]',
    popover: {
      title: "Browse the children",
      description:
        "Each card shows a child and how many of their requested gifts have been fulfilled. Click Next to see what a profile looks like.",
      onNextClick: (element, _step, { driver: tourDriver }) => {
        (element as HTMLElement | undefined)?.click();
        tourDriver.moveNext();
      },
    },
  },
  {
    element: '[data-tour="child-info-card"]',
    waitForElement: 5000,
    popover: {
      title: "Meet the child",
      description: "Read a bit about them before browsing their wish list.",
    },
  },
  {
    element: () => getVisibleTourElement("claim-gift-button") as Element,
    waitForElement: 5000,
    popover: {
      title: "Claim a gift",
      description:
        'Click "Claim Gift!" to reserve a gift for this child — it\'s added to your cart, not purchased yet.',
      onNextClick: (_element, _step, { driver: tourDriver }) => {
        clickAllTourElements("nav-cart-link");
        tourDriver.moveNext();
      },
    },
  },
  {
    element: '[data-tour="confirmation-panel"]',
    waitForElement: 5000,
    popover: {
      title: "Review & confirm",
      description:
        'Review your claimed gifts here, then click "Claim Gifts" to confirm your commitment. That\'s the whole flow — thanks for helping make the holidays brighter!',
      doneBtnText: "Got it!",
    },
  },
];

export function startStorefrontTour() {
  driver({
    showProgress: true,
    allowClose: true,
    stagePadding: 6,
    steps,
  }).drive();
}
