import path from "node:path";
import { expect, test } from "@playwright/test";
import { app, login } from "./helpers/auth";
import { clearSentEmails, getSentEmails } from "./helpers/emails";
import {
  activeDrive,
  defined,
  getDoc,
  queryDocs,
  seed,
  seededUser,
  storageFileExists,
} from "./helpers/seed";
import type { Page } from "@playwright/test";
import type { Claim, FamilyNotification, Gift, UserProfile } from "common";
import type { SeedData } from "./helpers/seed";

const RECEIPT = path.join(import.meta.dirname, "fixtures/receipt.pdf");

let data: SeedData;

test.beforeEach(async () => {
  data = await seed();
  await clearSentEmails();
});

/** A published child in the active drive with at least two claimable gifts. */
function claimableChild() {
  const driveId = activeDrive(data).id;
  for (const child of data.children) {
    if (child.giftDrive !== driveId || !child.published) continue;
    const gifts = data.gifts.filter(
      (g) =>
        g.childId === child.id &&
        g.active &&
        !g.backup &&
        g.status === "AVAILABLE",
    );
    if (gifts.length >= 2) return { child, gifts };
  }
  throw new Error("seed has no published child with 2 available gifts");
}

async function addToCart(page: Page, childId: string, gifts: Array<Gift>) {
  // the storefront lists children by first name + last initial
  await page.goto("/", { waitUntil: "networkidle" });
  await page.locator(`a[href="/child/${childId}"]`).first().click();
  await expect(page).toHaveURL(new RegExp(`/child/${childId}`));
  for (const gift of gifts) {
    await page
      .getByTestId(`gift-row-${gift.id}`)
      .getByRole("button", { name: "Claim Gift!" })
      .click();
    await expect(
      page
        .getByTestId(`gift-row-${gift.id}`)
        .getByRole("button", { name: "Remove Claim" }),
    ).toBeVisible();
  }
}

function cartRow(page: Page, title: string) {
  return page
    .locator(`[data-tour="gift-drive-cart"]`)
    .getByRole("row")
    .filter({ hasText: title });
}

async function openCheckoutAuth(page: Page) {
  await page.getByRole("button", { name: "Claim Gifts" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByText("Wait! Before checking out")).toBeVisible();
  return dialog;
}

test("claims cart gifts after logging in at checkout", async ({ page }) => {
  test.setTimeout(60_000);
  const { child, gifts } = claimableChild();
  const [kept, removed] = gifts;
  const donor = seededUser(data, "donor_1");

  await addToCart(page, child.id, [kept, removed]);
  const cartCount = page.getByTestId("cart-count").filter({ visible: true });
  await expect(cartCount).toHaveText("2");

  // the badge sits inside the navbar's cart link
  await cartCount.click();
  await expect(page).toHaveURL(/\/checkout/);
  await expect(cartRow(page, kept.title)).toBeVisible();
  await cartRow(page, removed.title)
    .getByRole("button", { name: "Remove gift from cart" })
    .click();
  await expect(cartRow(page, removed.title)).toBeHidden();
  await expect(cartCount).toHaveText("1");

  const dialog = await openCheckoutAuth(page);
  await dialog.getByRole("button", { name: "Log-in" }).click();
  await dialog.locator("#email").fill(donor.email);
  await dialog.locator("#password").fill(donor.password);
  await dialog.getByRole("button", { name: "Login", exact: true }).click();
  await page.waitForURL("**/donor/home");

  // database
  expect(await getDoc<Gift>("gifts", kept.id)).toMatchObject({
    status: "CLAIMED",
    claimedByDonorId: donor.uid,
  });
  expect(await getDoc<Gift>("gifts", removed.id)).toMatchObject({
    status: "AVAILABLE",
  });
  const claims = await queryDocs<Claim>("claims", "giftId", kept.id);
  expect(claims).toEqual([
    expect.objectContaining({
      donorId: donor.uid,
      childId: child.id,
      active: true,
    }),
  ]);
  const notifications = await queryDocs<FamilyNotification>(
    "notifications",
    "familyId",
    child.familyId,
  );
  expect(notifications.map((n) => n.type)).toContain("GIFT_CLAIMED");
  await expect.poll(() => getSentEmails(donor.email)).toHaveLength(1);

  // donor home
  const card = page.getByTestId(`commitment-${child.id}`);
  await expect(card).toContainText(child.name);
  await expect(card).toContainText(kept.title);
  await expect(card).toContainText("Action Request");
  await expect(card).not.toContainText(removed.title);
});

test("claims a gift after creating an account at checkout", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const { child, gifts } = claimableChild();
  const email = "new.donor@example.com";

  await addToCart(page, child.id, [gifts[0]]);
  await page.goto("/checkout", { waitUntil: "networkidle" });
  await expect(cartRow(page, gifts[0].title)).toBeVisible();

  const dialog = await openCheckoutAuth(page);
  await dialog.getByRole("button", { name: "Create Account" }).click();
  await dialog.locator("#fullName").fill("New Donor");
  await dialog.locator("#phoneNumber").fill("4105550199");
  await dialog.locator("#email").fill(email);
  await dialog.locator("#password").fill("Password123!");
  await dialog.locator("#confirmPassword").fill("Password123!");
  await dialog.locator('button[type="submit"]').click();
  await page.waitForURL("**/donor/home");

  // database
  const authUser = await app.auth().getUserByEmail(email);
  expect(authUser.customClaims).toMatchObject({ role: "DONOR" });
  expect(await getDoc<UserProfile>("users", authUser.uid)).toMatchObject({
    email,
    name: "New Donor",
    role: "DONOR",
    phone: "+14105550199",
  });
  expect(await getDoc<Gift>("gifts", gifts[0].id)).toMatchObject({
    status: "CLAIMED",
    claimedByDonorId: authUser.uid,
  });

  await expect(page.getByTestId(`commitment-${child.id}`)).toContainText(
    gifts[0].title,
  );
});

test("confirms purchase and delivery with receipts", async ({ page }) => {
  test.setTimeout(60_000);
  const driveId = activeDrive(data).id;
  const gift = data.gifts.find(
    (g) => g.giftDrive === driveId && g.status === "CLAIMED",
  );
  if (!gift?.claimedByDonorId) throw new Error("seed has no claimed gift");
  const claim = data.claims.find((c) => c.giftId === gift.id && c.active);
  if (!claim) throw new Error("seeded claimed gift has no active claim");
  const child = defined(
    data.children.find((c) => c.id === gift.childId),
    "the claimed gift's child",
  );
  const donor = seededUser(data, gift.claimedByDonorId);

  await login(page, donor);
  await page
    .getByTestId(`commitment-${child.id}`)
    .getByRole("link", { name: "View More" })
    .click();
  await expect(page).toHaveURL(new RegExp(`childId=${child.id}`));

  const card = page.getByTestId(`donor-gift-${gift.id}`);
  const confirm = page.getByRole("button", { name: "Yes, I am sure!" });

  // purchase
  await card.getByRole("button", { name: "Confirm Purchase" }).click();
  await confirm.click();
  await expect(card.getByText("Purchase Confirmed ✓")).toBeVisible();

  await card.locator(`[id="${gift.id}-tracking"]`).fill("1Z999AA10123456784");
  await card.getByRole("button", { name: "Save Tracking" }).click();
  await expect(card.getByText("Changes Saved")).toBeVisible();

  const receipts = card.getByLabel("Attach Receipt");
  await receipts.first().setInputFiles(RECEIPT);
  await expect(card.getByRole("button", { name: "View" })).toHaveCount(1);

  // delivery
  await card.getByRole("button", { name: "Confirm Delivery" }).click();
  await confirm.click();
  await expect(card.getByText("Delivery Confirmed ✓")).toBeVisible();
  await receipts.nth(1).setInputFiles(RECEIPT);
  await expect(card.getByRole("button", { name: "View" })).toHaveCount(2);

  // database + storage
  const purchasePath = `claims/purchase-confirmations/${donor.uid}/${gift.id}`;
  const deliveryPath = `claims/delivery-confirmations/${donor.uid}/${gift.id}`;
  expect(await getDoc<Gift>("gifts", gift.id)).toMatchObject({
    status: "DELIVERED",
  });
  const saved = await getDoc<Claim>("claims", claim.id);
  expect(saved?.purchaseConfirmation).toMatchObject({
    date: expect.any(String),
    trackingNumber: "1Z999AA10123456784",
    documentationUrl: purchasePath,
  });
  expect(saved?.deliveryConfirmed).toMatchObject({
    date: expect.any(String),
    documentationUrl: deliveryPath,
  });
  expect(await storageFileExists(purchasePath)).toBe(true);
  expect(await storageFileExists(deliveryPath)).toBe(true);

  // persists across a reload
  await page.reload();
  await expect(card.getByText("Purchase Confirmed ✓")).toBeVisible();
  await expect(card.getByText("Delivery Confirmed ✓")).toBeVisible();
  await expect(card.locator(`[id="${gift.id}-tracking"]`)).toHaveValue(
    "1Z999AA10123456784",
  );
  await expect(card.getByRole("button", { name: "View" })).toHaveCount(2);
});
