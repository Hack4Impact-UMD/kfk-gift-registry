import { expect, test } from "@playwright/test";
import { app, loginStaff } from "./helpers/auth";
import { activeDrive, defined, getDoc, seed, seededUser } from "./helpers/seed";
import type { Gift } from "common";
import type { SeedData } from "./helpers/seed";

const db = app.firestore();
const SEEDED_NOTE = "e2e-seeded-private-note";

let data: SeedData;
let gift: Gift;

test.beforeEach(async ({ page }) => {
  data = await seed();
  const driveId = activeDrive(data).id;
  const publishedChildIds = new Set(
    data.children
      .filter((c) => c.giftDrive === driveId && c.published)
      .map((c) => c.id),
  );
  gift = defined(
    data.gifts.find((g) => !g.backup && publishedChildIds.has(g.childId)),
    "a non-backup gift for a published child in the active drive",
  );
  // A unique note lets the table search narrow to exactly this gift's row.
  await db.collection("gifts").doc(gift.id).update({
    privateNotes: SEEDED_NOTE,
  });

  await loginStaff(page, seededUser(data, "volunteer_1"), "/staff/gifts");
  await page.getByLabel("Search gifts").fill(SEEDED_NOTE);
});

test("staff sees and edits a gift's private notes", async ({ page }) => {
  const trigger = page.getByRole("button", {
    name: `Edit notes for ${gift.title}`,
  });
  await expect(trigger).toContainText(SEEDED_NOTE);

  await trigger.click();
  const textarea = page.getByLabel("Private Notes");
  await expect(textarea).toHaveValue(SEEDED_NOTE);
  await textarea.fill("  Ship to grandma instead  ");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(textarea).toBeHidden();
  await expect
    .poll(async () => (await getDoc<Gift>("gifts", gift.id))?.privateNotes)
    .toBe("Ship to grandma instead");
});

test("cancel discards unsaved note edits", async ({ page }) => {
  await page
    .getByRole("button", { name: `Edit notes for ${gift.title}` })
    .click();
  await page.getByLabel("Private Notes").fill("discard me");
  await page.getByRole("button", { name: "Cancel" }).click();

  await expect(page.getByLabel("Private Notes")).toBeHidden();
  expect((await getDoc<Gift>("gifts", gift.id))?.privateNotes).toBe(
    SEEDED_NOTE,
  );
});
