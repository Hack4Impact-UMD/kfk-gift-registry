import { expect, test } from "@playwright/test";
import { loginStaff } from "./helpers/auth";
import { defined, getDoc, seed, seededUser } from "./helpers/seed";
import type { Page } from "@playwright/test";
import type { Child } from "common";
import type { SeedData } from "./helpers/seed";

let data: SeedData;
let warrior: Child;

test.beforeEach(async ({ page }) => {
  data = await seed();
  warrior = defined(
    data.children.find((c) => c.category === "warrior"),
    "a seeded warrior child",
  );
  await loginStaff(
    page,
    seededUser(data, "volunteer_1"),
    `/staff/review/${warrior.familyId}`,
  );
});

function childCard(page: Page, child: Child) {
  return page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByRole("heading", { name: child.name }) });
}

async function switchToSuperSib(page: Page, child: Child) {
  const card = childCard(page, child);
  await card.getByRole("button", { name: "Edit" }).click();
  await card.getByLabel(`Category for ${child.name}`).click();
  await page.getByRole("option", { name: "SuperSib", exact: true }).click();
  return card;
}

test("staff can switch a warrior to a supersib", async ({ page }) => {
  const card = await switchToSuperSib(page, warrior);
  await card.getByRole("button", { name: "Save" }).click();

  await expect(card.getByText("SuperSib", { exact: true })).toBeVisible();
  await expect(card.getByText("Diagnosis:")).toBeHidden();
  await expect
    .poll(async () => (await getDoc<Child>("children", warrior.id))?.category)
    .toBe("super_sib");
});

test("cancel reverts the category change", async ({ page }) => {
  const card = await switchToSuperSib(page, warrior);
  await card.getByRole("button", { name: "Cancel" }).click();

  await expect(card.getByText("Warrior", { exact: true })).toBeVisible();
  await expect(card.getByText("Diagnosis:")).toBeVisible();
  expect((await getDoc<Child>("children", warrior.id))?.category).toBe(
    "warrior",
  );
});
