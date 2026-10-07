import { expect, test } from "@playwright/test";
import { app, loginStaff } from "./helpers/auth";
import {
  activeDrive,
  defined,
  getDoc,
  queryDocs,
  seed,
  seededUser,
} from "./helpers/seed";
import type { Locator, Page } from "@playwright/test";
import type { FormLink, GiftDrive } from "common";
import type { SeedData } from "./helpers/seed";

const db = app.firestore();
const DAY = 24 * 60 * 60 * 1000;

let data: SeedData;

test.beforeEach(async () => {
  data = await seed();
});

function completedDrive() {
  return defined(
    data.giftDrives.find((d) => Date.parse(d.endDate) < Date.now()),
    "a completed seeded drive",
  );
}

async function updateDrive(id: string, fields: Partial<GiftDrive>) {
  await db.collection("gift-drives").doc(id).update(fields);
}

async function drivesWithCycle(cycle: string) {
  return queryDocs<GiftDrive>("gift-drives", "cycle", cycle);
}

async function openDrivesPage(page: Page) {
  await loginStaff(page, seededUser(data, "director_1"), "/staff/admin/drives");
}

function driveCard(page: Page, cycle: string) {
  return page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByText(cycle, { exact: true }) });
}

/** yyyy-MM-dd in local time, matching DayPicker's data-day attribute. */
function isoDay(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Picks a range in the create dialog's calendar, which opens on the current
 * month and shows two months at a time.
 */
async function pickDateRange(
  page: Page,
  dialog: Locator,
  start: Date,
  end: Date,
) {
  const now = new Date();
  const monthsAhead =
    (start.getFullYear() - now.getFullYear()) * 12 +
    start.getMonth() -
    now.getMonth();

  await dialog.getByRole("button", { name: "Pick a date range" }).click();
  const picker = page.locator('[data-slot="popover-content"]');
  for (let i = 0; i < monthsAhead; i++) {
    await picker.getByRole("button", { name: "Go to the Next Month" }).click();
  }
  for (const day of [start, end]) {
    await picker
      .locator(`[data-day="${isoDay(day)}"]:not([data-outside]) button`)
      .click();
  }
  await page.keyboard.press("Escape");
  await expect(picker).toBeHidden();
}

/** A window a few months out, after the seeded active drive ends. */
function futureWindow() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth() + 4, 10),
    end: new Date(now.getFullYear(), now.getMonth() + 4, 20),
  };
}

async function createDrive(
  page: Page,
  { cycle, isTestDrive }: { cycle: string; isTestDrive: boolean },
) {
  await page.getByRole("button", { name: "New gift drive" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Cycle").fill(cycle);
  const { start, end } = futureWindow();
  await pickDateRange(page, dialog, start, end);
  if (isTestDrive) {
    await dialog.getByRole("checkbox", { name: "Test drive" }).check();
  }
  await dialog.getByRole("button", { name: "Create drive" }).click();
  await expect(dialog).toBeHidden();
  return { start, end };
}

test("creates an upcoming drive", async ({ page }) => {
  const cycle = "E2E Winter Drive";
  await openDrivesPage(page);
  const { start, end } = await createDrive(page, { cycle, isTestDrive: false });

  const card = driveCard(page, cycle);
  await expect(card).toContainText("Upcoming");
  await expect(card.getByTestId("test-drive-badge")).toHaveCount(0);

  const [drive] = await drivesWithCycle(cycle);
  expect(drive).toMatchObject({ cycle, isTestDrive: false });
  // stored as the full local days, in UTC
  expect(new Date(drive.startDate).getTime()).toBe(start.getTime());
  expect(new Date(drive.endDate).getTime()).toBe(
    new Date(end.getTime() + DAY - 1).getTime(),
  );
});

test("creates a test drive", async ({ page }) => {
  const cycle = "E2E Test Drive";
  await openDrivesPage(page);
  await createDrive(page, { cycle, isTestDrive: true });

  await expect(
    driveCard(page, cycle).getByTestId("test-drive-badge"),
  ).toBeVisible();
  expect(await drivesWithCycle(cycle)).toEqual([
    expect.objectContaining({ isTestDrive: true }),
  ]);
});

test("rejects a drive overlapping the active drive", async ({ page }) => {
  const active = activeDrive(data);
  const cycle = "E2E Overlapping Drive";
  await openDrivesPage(page);

  await page.getByRole("button", { name: "New gift drive" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Cycle").fill(cycle);
  const tomorrow = new Date(Date.now() + DAY);
  await pickDateRange(
    page,
    dialog,
    tomorrow,
    new Date(tomorrow.getTime() + 2 * DAY),
  );
  await dialog.getByRole("button", { name: "Create drive" }).click();

  await expect(
    page.getByText(`Gift drive dates overlap with ${active.cycle}`),
  ).toBeVisible();
  await expect(dialog).toBeVisible();
  expect(await drivesWithCycle(cycle)).toEqual([]);
});

test("edits a drive's cycle and test flag", async ({ page }) => {
  const drive = completedDrive();
  const renamed = "E2E Renamed Drive";
  await openDrivesPage(page);

  // seeded drives have no isTestDrive field at all
  await expect(page.getByTestId("test-drive-badge")).toHaveCount(0);

  const dialog = page.getByRole("dialog");
  const checkbox = dialog.getByRole("checkbox", { name: "Test drive" });

  await driveCard(page, drive.cycle)
    .getByRole("button", { name: "Edit" })
    .click();
  await expect(dialog.getByLabel("Cycle")).toHaveValue(drive.cycle);
  await expect(checkbox).not.toBeChecked();
  await dialog.getByLabel("Cycle").fill(renamed);
  await checkbox.check();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).toBeHidden();

  const card = driveCard(page, renamed);
  await expect(card.getByTestId("test-drive-badge")).toBeVisible();
  await expect
    .poll(() => getDoc<GiftDrive>("gift-drives", drive.id))
    .toMatchObject({
      cycle: renamed,
      isTestDrive: true,
      // an unchanged end day keeps its exact timestamp
      endDate: drive.endDate,
    });

  await card.getByRole("button", { name: "Edit" }).click();
  await expect(checkbox).toBeChecked();
  await checkbox.uncheck();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  await expect(dialog).toBeHidden();
  await expect(card.getByTestId("test-drive-badge")).toHaveCount(0);
  await expect
    .poll(
      async () =>
        (await getDoc<GiftDrive>("gift-drives", drive.id))?.isTestDrive,
    )
    .toBe(false);
});

test("deactivates the active drive and its form links", async ({ page }) => {
  const drive = activeDrive(data);
  await openDrivesPage(page);

  const card = driveCard(page, drive.cycle);
  await expect(card).toContainText("Active");
  await card.getByRole("button", { name: "Deactivate" }).click();
  await page
    .getByRole("alertdialog")
    .getByRole("button", { name: "Deactivate" })
    .click();

  await expect(card).toContainText("Completed");
  const saved = defined(
    await getDoc<GiftDrive>("gift-drives", drive.id),
    "deactivated drive",
  );
  expect(Date.parse(saved.endDate)).toBeLessThanOrEqual(Date.now());
  expect(saved.formLinksDeactivatedAt).toBeDefined();
  const links = await queryDocs<FormLink>("form-links", "driveId", drive.id);
  expect(links.length).toBeGreaterThan(0);
  for (const link of links) {
    expect(link).toMatchObject({ active: false, showOnStorefront: false });
  }
});

test("active test drive is labeled in the staff sidebar and storefront", async ({
  page,
}) => {
  const drive = activeDrive(data);

  await page.goto("/");
  await expect(
    page.getByText(`${drive.cycle} Gift Drive`).filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByTestId("test-drive-badge")).toHaveCount(0);

  await updateDrive(drive.id, { isTestDrive: true });

  await page.goto("/");
  await expect(
    page.getByTestId("test-drive-badge").filter({ visible: true }),
  ).toHaveCount(1);

  await loginStaff(page, seededUser(data, "director_1"), "/staff/home");
  const trigger = page
    .locator('[data-slot="sidebar"]')
    .locator('[data-slot="select-trigger"]');
  await expect(trigger).toContainText(drive.cycle);
  await expect(trigger.getByTestId("test-drive-badge")).toBeVisible();
});

test("off-season stats skip test drives", async ({ page }) => {
  const recent = activeDrive(data);
  const older = completedDrive();
  const recentCycle = "E2E Recently Ended Drive";

  // end the active drive yesterday so the storefront is off-season
  await updateDrive(recent.id, {
    cycle: recentCycle,
    endDate: new Date(Date.now() - DAY).toISOString(),
  });

  const statsHeading = page.getByRole("heading", {
    name: /Gift Drive Stats$/,
  });

  await page.goto("/");
  await expect(statsHeading).toHaveText(`${recentCycle} Gift Drive Stats`);

  await updateDrive(recent.id, { isTestDrive: true });

  await page.goto("/");
  await expect(statsHeading).toHaveText(`${older.cycle} Gift Drive Stats`);
});
