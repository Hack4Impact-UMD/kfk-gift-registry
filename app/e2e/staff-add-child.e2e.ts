import path from "node:path";
import { expect, test } from "@playwright/test";
import { loginStaff } from "./helpers/auth";
import {
  defined,
  queryDocs,
  seed,
  seededUser,
  storageFileExists,
} from "./helpers/seed";
import type { Locator, Page } from "@playwright/test";
import type { Child, Family, Gift } from "common";
import type { SeedData } from "./helpers/seed";

const PHOTO = path.join(import.meta.dirname, "fixtures/child-photo.png");

let data: SeedData;
let family: Family;

test.beforeEach(async ({ page }) => {
  data = await seed();
  family = data.families[0];
  await loginStaff(
    page,
    seededUser(data, "volunteer_1"),
    `/staff/review/${family.id}`,
  );
});

type GiftInput = { url: string; name: string; price: string };

function gift(name: string, price: string): GiftInput {
  const slug = name.toLowerCase().replace(/\W+/g, "-");
  return { url: `https://www.amazon.com/dp/${slug}`, name, price };
}

const mainGift = gift("Lego Castle", "24.99");
const backups = [gift("Puzzle Set", "9.99"), gift("Kite", "12")];

async function openDialog(page: Page) {
  await page.getByRole("button", { name: "Add Child" }).click();
  return page.getByRole("dialog", { name: "Add Child" });
}

async function selectStatus(page: Page, dialog: Locator, option: string) {
  await dialog.getByTestId("children[0].status").click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function fillGift(dialog: Locator, prefix: string, g: GiftInput) {
  await dialog.getByTestId(`${prefix}.giftUrl`).fill(g.url);
  await dialog.getByTestId(`${prefix}.giftName`).fill(g.name);
  await dialog.getByTestId(`${prefix}.listedPrice`).fill(g.price);
}

async function fillGifts(dialog: Locator, withBackups = true) {
  await fillGift(dialog, "giftSelections[0].gifts[0]", mainGift);
  if (!withBackups) return;
  for (const [i, g] of backups.entries()) {
    await fillGift(dialog, `giftSelections[0].backupGifts[${i}]`, g);
  }
}

async function childrenOf(familyId: string) {
  return queryDocs<Child>("children", "familyId", familyId);
}

test("adds a child with a photo and gifts", async ({ page }) => {
  test.setTimeout(60_000);
  const before = await childrenOf(family.id);
  const countBadge = page.getByText(
    `${before.length + 1} ${before.length + 1 === 1 ? "child" : "children"}`,
    { exact: true },
  );

  const dialog = await openDialog(page);
  await selectStatus(
    page,
    dialog,
    "Recently diagnosed or relapsed with cancer (within 1 year)",
  );
  await dialog.getByTestId("children[0].name").fill("Avery Staffadded");
  await dialog.getByTestId("children[0].age").fill("8");
  await dialog.getByTestId("children[0].diagnosis").fill("Leukemia");
  await dialog
    .getByLabel("Upload photo for Avery Staffadded")
    .setInputFiles(PHOTO);
  await fillGifts(dialog);
  await dialog.getByRole("button", { name: "Add Child" }).click();

  await expect(dialog).toBeHidden();
  await expect(countBadge).toBeVisible();
  await expect(page.getByText("Avery Staffadded").first()).toBeVisible();

  let child: Child | undefined;
  await expect
    .poll(async () => {
      child = (await childrenOf(family.id)).find(
        (c) => c.name === "Avery Staffadded",
      );
      return child?.photoUrl;
    })
    .toBeTruthy();
  const saved = defined(child, "the added child");
  expect(saved).toMatchObject({
    age: 8,
    status: "recently_diagnosed_relapse",
    category: "warrior",
    diagnosis: "Leukemia",
    familyId: family.id,
    giftDrive: family.giftDrive,
    published: false,
  });
  expect(await storageFileExists(`children/pfps/${saved.id}`)).toBe(true);

  const gifts = await queryDocs<Gift>("gifts", "childId", saved.id);
  expect(gifts).toHaveLength(3);
  expect(
    gifts
      .map((g) => ({ title: g.title, backup: g.backup }))
      .sort((a, b) => a.title.localeCompare(b.title)),
  ).toEqual([
    { title: "Kite", backup: true },
    { title: "Lego Castle", backup: false },
    { title: "Puzzle Set", backup: true },
  ]);
  expect(
    gifts.every(
      (g) =>
        g.familyId === family.id &&
        g.giftDrive === family.giftDrive &&
        g.status === "AVAILABLE" &&
        g.active,
    ),
  ).toBe(true);
});

test("adds a sibling without a photo", async ({ page }) => {
  const dialog = await openDialog(page);
  await selectStatus(
    page,
    dialog,
    "Sibling of child diagnosed with cancer (in or off treatment)",
  );
  await expect(dialog.getByTestId("children[0].diagnosis")).toBeHidden();
  await dialog.getByTestId("children[0].name").fill("Riley Staffadded");
  await dialog.getByTestId("children[0].age").fill("11");
  await fillGifts(dialog);
  await dialog.getByRole("button", { name: "Add Child" }).click();
  await expect(dialog).toBeHidden();

  await expect
    .poll(async () =>
      (await childrenOf(family.id)).find((c) => c.name === "Riley Staffadded"),
    )
    .toMatchObject({
      category: "super_sib",
      status: "sibling_in_treatment",
      diagnosis: "",
      published: false,
    });
});

test("missing backup gifts block submission", async ({ page }) => {
  const before = await childrenOf(family.id);

  const dialog = await openDialog(page);
  await selectStatus(
    page,
    dialog,
    "Recently diagnosed or relapsed with cancer (within 1 year)",
  );
  await dialog.getByTestId("children[0].name").fill("Blocked Child");
  await dialog.getByTestId("children[0].age").fill("6");
  await dialog.getByTestId("children[0].diagnosis").fill("Leukemia");
  await fillGifts(dialog, false);
  await dialog.getByRole("button", { name: "Add Child" }).click();

  await expect(dialog.getByText("URL is required").first()).toBeVisible();
  await expect(dialog).toBeVisible();
  expect(await childrenOf(family.id)).toHaveLength(before.length);
});
