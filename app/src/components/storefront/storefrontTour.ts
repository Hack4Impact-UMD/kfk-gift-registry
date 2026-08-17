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

const getSteps = (navigate: StorefrontNavigate): Array<DriveStep> => [
  {
    element: () => getVisibleTourElement("search-filters") as Element,
    waitForElement: 5000,
    popover: {
      title: "Search & sort",
      description: "Search for a child or sort the list to find gifts faster.",
    },
  },
  {
    element: '[data-tour="first-child-card"]',
    waitForElement: 5000,
    popover: {
      title: "Browse the children",
      description:
        "Each card shows a child and how many gifts still need to be claimed.",
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
      description: "Read a little about the child before choosing a gift.",
    },
  },
  {
    element: '[data-tour="child-wishlist"]',
    waitForElement: 5000,
    popover: {
      title: "Child wish list",
      description: "This section shows the child's requested gifts.",
    },
  },
  {
    element: () => getVisibleTourElement("claim-gift-button") as Element,
    waitForElement: 5000,
    popover: {
      title: "Claim a gift",
      description: 'Click "Claim Gift!" to add a gift to your cart.',
      onNextClick: (_element, _step, { driver: tourDriver }) => {
        navigate({ to: "/checkout" });
        tourDriver.moveNext();
      },
    },
  },
  {
    element: '[data-tour="gift-drive-cart"]',
    waitForElement: 5000,
    popover: {
      title: "Your cart",
      description: "Review the gifts you added and remove any you do not want.",
    },
  },
  {
    element: '[data-tour="confirmation-panel"]',
    waitForElement: 5000,
    popover: {
      title: "Review & confirm",
      description:
        'When everything looks right, click "Claim Gifts" to confirm.',
      doneBtnText: "Got it!",
    },
  },
];

type StorefrontNavigate = (opts: { to: string }) => void;

export function startStorefrontTour(navigate: StorefrontNavigate) {
  if (window.location.pathname !== "/") {
    navigate({ to: "/" });
  }

  driver({
    showProgress: true,
    allowClose: true,
    stagePadding: 6,
    steps: getSteps(navigate),
  }).drive();
}
