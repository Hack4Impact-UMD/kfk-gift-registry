import path from "node:path";
import { expect, test } from "@playwright/test";
import { clearSentEmails, getSentEmails } from "./helpers/emails";
import {
  activeDrive,
  defined,
  getDoc,
  queryDocs,
  seed,
  storageFileExists,
} from "./helpers/seed";
import type { Page } from "@playwright/test";
import type { Child, Family, FamilyLink, Gift } from "common";
import type { SeedData } from "./helpers/seed";

const PHOTO = path.join(import.meta.dirname, "fixtures/child-photo.png");

let data: SeedData;
let formLinkId: string;

test.beforeEach(async () => {
  data = await seed();
  await clearSentEmails();
  const link = data.formLinks.find((l) => l.driveId === activeDrive(data).id);
  if (!link) throw new Error("seed has no form link for the active drive");
  formLinkId = link.id;
});

const family = {
  parentName: "Jordan Rivera",
  email: "Jordan.Rivera@Example.com",
  phone: "4105550123",
  street: "10 Mountain View Way",
  city: "Baltimore",
  state: "Maryland",
  zip: "21201",
};

type GiftInput = { url: string; name: string; price: string; notes: string };

const warrior = {
  name: "Avery Rivera",
  age: "8",
  diagnosis: "Leukemia",
  gifts: [
    gift("Lego Castle", "24.99"),
    gift("Art Easel", "18.50"),
  ] as Array<GiftInput>,
  backups: [gift("Puzzle Set", "9.99"), gift("Kite", "12")],
};
const sibling = {
  name: "Riley Rivera",
  age: "11",
  gifts: [gift("Soccer Ball", "15")] as Array<GiftInput>,
  backups: [gift("Sketchbook", "7.25"), gift("Yo-yo", "5")],
};

function gift(name: string, price: string): GiftInput {
  const slug = name.toLowerCase().replace(/\W+/g, "-");
  return {
    url: `https://www.amazon.com/dp/${slug}`,
    name,
    price,
    notes: `${name} notes`,
  };
}

async function gotoStep(page: Page, step: string) {
  // the form is client-rendered (ssr: false); wait for it before typing
  await page.goto(`/family/form/${formLinkId}/${step}`, {
    waitUntil: "networkidle",
  });
}

async function selectOption(page: Page, testId: string, option: string) {
  await page.getByTestId(testId).click();
  await page.getByRole("option", { name: option, exact: true }).click();
}

async function completeConsent(page: Page) {
  await gotoStep(page, "consent");
  const agree = page.getByRole("button", { name: "Agree and Continue" });
  await expect(agree).toBeDisabled();
  await page.getByLabel(/I agree to the sharing of my mailing address/).check();
  await expect(agree).toBeDisabled();
  await page.getByLabel(/I certify my legal guardianship/).check();
  await agree.click();
  await expect(page).toHaveURL(/\/general-info$/);
}

async function fillGeneralInfo(page: Page) {
  await page.getByTestId("parentName").fill(family.parentName);
  await page.getByTestId("email").fill(family.email);
  await page.getByTestId("emailConfirm").fill(family.email);
  await page.getByTestId("phoneNumber").fill(family.phone);
  await page.getByTestId("phoneNumberConfirm").fill(family.phone);
  await page.getByTestId("streetAddress").fill(family.street);
  await page.getByTestId("city").fill(family.city);
  await selectOption(page, "state", family.state);
  await page.getByTestId("zipCode").fill(family.zip);
}

async function fillGifts(
  page: Page,
  childIndex: number,
  child: { gifts: Array<GiftInput>; backups: Array<GiftInput> },
) {
  const fill = async (prefix: string, g: GiftInput) => {
    await page.getByTestId(`${prefix}.giftUrl`).fill(g.url);
    await page.getByTestId(`${prefix}.giftName`).fill(g.name);
    await page.getByTestId(`${prefix}.listedPrice`).fill(g.price);
    await page.getByTestId(`${prefix}.familyPublicNotes`).fill(g.notes);
  };
  for (const [i, g] of child.gifts.entries()) {
    await fill(`giftSelections[${childIndex}].gifts[${i}]`, g);
  }
  for (const [i, g] of child.backups.entries()) {
    await fill(`giftSelections[${childIndex}].backupGifts[${i}]`, g);
  }
}

test("an ended drive's form link is not found", async ({ page }) => {
  const endedLink = data.formLinks.find(
    (l) => l.driveId !== activeDrive(data).id,
  );
  if (!endedLink) throw new Error("seed has no ended drive form link");

  await page.goto(`/family/form/${endedLink.id}/consent`);
  await expect(page.getByText("Form Not Found")).toBeVisible();
});

test("shows validation errors on each step", async ({ page }) => {
  test.setTimeout(90_000);
  await completeConsent(page);

  // general info
  const next = page.getByRole("button", { name: "Next" });
  await page.getByTestId("parentName").fill("x");
  await page.getByTestId("parentName").fill("");
  await expect(
    page.getByText("Parent/Guardian name is required"),
  ).toBeVisible();
  await page.getByTestId("email").fill("jordan@example.com");
  await page.getByTestId("emailConfirm").fill("jordan@example.org");
  await page.getByTestId("emailConfirm").blur();
  await expect(page.getByText("Emails do not match")).toBeVisible();
  await page.getByTestId("phoneNumber").fill("4105550123");
  await page.getByTestId("phoneNumberConfirm").fill("4105550124");
  await page.getByTestId("phoneNumberConfirm").blur();
  await expect(page.getByText(/Phone numbers do not match/i)).toBeVisible();
  await page.getByTestId("zipCode").fill("123");
  await page.getByTestId("zipCode").blur();
  await expect(page.getByText(/Please enter a valid zip code/)).toBeVisible();
  await expect(next).toBeDisabled();

  await fillGeneralInfo(page);
  await expect(page.getByText("Emails do not match")).toBeHidden();
  await next.click();
  await expect(page).toHaveURL(/\/children$/);

  // children
  await page.getByTestId("numChildren").fill("1");
  await page.getByTestId("children[0].name").fill(warrior.name);
  await page.getByTestId("children[0].age").fill("25");
  await page.getByTestId("children[0].age").blur();
  await expect(
    page.getByText("Age must be a whole number between 1 and 18"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/children$/);

  await page.getByTestId("children[0].age").fill(warrior.age);
  await page.getByTestId("children[0].diagnosis").fill(warrior.diagnosis);
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/gift-details$/);

  // gifts
  await page
    .getByRole("button", { name: `${warrior.name}'s Gift Selection` })
    .click();
  const price = page.getByTestId("giftSelections[0].gifts[0].listedPrice");
  await price.fill("45");
  await price.blur();
  await expect(
    page.getByText(
      "Price must be a valid non-negative number no greater than $30.",
    ),
  ).toBeVisible();

  // a non-amazon/macy's url only warns
  const url = page.getByTestId("giftSelections[0].gifts[0].giftUrl");
  await url.fill("https://www.example.com/toy");
  await url.blur();
  await expect(
    page.getByText(/Double-check that the gift listing link works/),
  ).toBeVisible();

  // no backups yet, so the child isn't complete
  await page.getByTestId("giftSelections[0].gifts[0].giftName").fill("Toy");
  await price.fill("20");
  await page
    .getByTestId("giftSelections[0].gifts[0].familyPublicNotes")
    .fill("Blue");
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeDisabled();

  await page
    .getByRole("button", { name: `${warrior.name}'s Gift Selection` })
    .click();
  await fillGifts(page, 0, { gifts: [], backups: warrior.backups });
  await page.getByRole("button", { name: "Done" }).click();
  await expect(page.getByRole("button", { name: "Next" })).toBeEnabled();
});

test("submits the form and shows the family home page", async ({ page }) => {
  test.setTimeout(120_000);
  await completeConsent(page);
  await fillGeneralInfo(page);
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/children$/);

  // children
  await page.getByTestId("numChildren").fill("2");
  await page.getByTestId("children[0].name").fill(warrior.name);
  await page.getByTestId("children[0].age").fill(warrior.age);
  await page.getByTestId("children[0].diagnosis").fill(warrior.diagnosis);
  await page
    .getByLabel(`Upload photo for ${warrior.name}`)
    .setInputFiles(PHOTO);
  await expect(
    page.getByAltText(`${warrior.name} photo preview`),
  ).toBeVisible();

  await selectOption(
    page,
    "children[1].status",
    "Sibling of child diagnosed with cancer (in or off treatment)",
  );
  await expect(page.getByTestId("children[1].diagnosis")).toBeHidden();
  await page.getByTestId("children[1].name").fill(sibling.name);
  await page.getByTestId("children[1].age").fill(sibling.age);
  await page.getByLabel(/I consent to having all photos/).check();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/gift-details$/);

  // gifts
  await page
    .getByRole("button", { name: `${warrior.name}'s Gift Selection` })
    .click();
  await fillGifts(page, 0, warrior);
  await page.getByRole("button", { name: "Next" }).click();
  await fillGifts(page, 1, sibling);
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Next" }).click();
  await expect(page).toHaveURL(/\/review$/);

  // review shows what was entered
  await expect(page.getByTestId("parentName")).toHaveValue(family.parentName);
  await expect(page.getByTestId("children[1].name")).toHaveValue(sibling.name);
  await expect(
    page.getByTestId("giftSelections[0].gifts[1].giftName"),
  ).toHaveValue(warrior.gifts[1].name);

  await page.getByRole("button", { name: "Submit!" }).click();
  await expect(page.getByText("Thank you for submitting!")).toBeVisible();
  const linkId = defined(
    new URL(page.url()).searchParams.get("linkId"),
    "a family link id in the thank-you url",
  );

  // database
  const email = family.email.toLowerCase();
  const [savedFamily] = await queryDocs<Family>("families", "email", email);
  expect(savedFamily).toMatchObject({
    contactName: family.parentName,
    giftDrive: activeDrive(data).id,
    address: {
      street: family.street,
      city: family.city,
      state: "MD",
      zipCode: family.zip,
    },
    reviewStatus: { approved: false, held: false },
  });
  const familyLink = await getDoc<FamilyLink>("family-links", linkId);
  expect(familyLink).toMatchObject({
    familyId: savedFamily.id,
    active: true,
  });

  const children = await queryDocs<Child>(
    "children",
    "familyId",
    savedFamily.id,
  );
  const savedWarrior = defined(
    children.find((c) => c.name === warrior.name),
    "the warrior child doc",
  );
  const savedSibling = defined(
    children.find((c) => c.name === sibling.name),
    "the sibling child doc",
  );
  expect(children).toHaveLength(2);
  expect(savedWarrior).toMatchObject({
    age: 8,
    category: "warrior",
    diagnosis: warrior.diagnosis,
    published: false,
  });
  expect(savedSibling).toMatchObject({
    age: 11,
    category: "super_sib",
    status: "sibling_in_treatment",
    published: false,
  });

  const gifts = await queryDocs<Gift>("gifts", "familyId", savedFamily.id);
  const summarize = (childId: string) =>
    gifts
      .filter((g) => g.childId === childId)
      .map((g) => ({ title: g.title, price: g.listedPrice, backup: g.backup }))
      .sort((a, b) => a.title.localeCompare(b.title));
  const expected = (child: typeof warrior | typeof sibling) =>
    [
      ...child.gifts.map((g) => ({ ...g, backup: false })),
      ...child.backups.map((g) => ({ ...g, backup: true })),
    ]
      .map((g) => ({ title: g.name, price: Number(g.price), backup: g.backup }))
      .sort((a, b) => a.title.localeCompare(b.title));
  expect(summarize(savedWarrior.id)).toEqual(expected(warrior));
  expect(summarize(savedSibling.id)).toEqual(expected(sibling));
  expect(gifts.every((g) => g.status === "AVAILABLE")).toBe(true);

  // the photo uploads after submit
  await expect
    .poll(
      async () => (await getDoc<Child>("children", savedWarrior.id))?.photoUrl,
    )
    .toBeTruthy();
  expect(await storageFileExists(`children/pfps/${savedWarrior.id}`)).toBe(
    true,
  );

  // portal email
  const emails = await getSentEmails(email);
  expect(emails).toHaveLength(1);
  expect(emails[0].html).toContain(`/family/${linkId}/home`);

  // family home
  await page.getByRole("link", { name: "Go To Family Page" }).click();
  await expect(page).toHaveURL(new RegExp(`/family/${linkId}/home`));
  await expect(page.getByText(`Welcome, ${family.parentName}!`)).toBeVisible();
  await expect(page.getByText("No notifications")).toBeVisible();
  await expect(page.getByRole("link", { name: sibling.name })).toBeVisible();

  // child page lists the main gifts, not the backups
  await page.getByRole("link", { name: warrior.name }).click();
  await expect(page).toHaveURL(
    new RegExp(`/family/${linkId}/child/${savedWarrior.id}`),
  );
  for (const g of warrior.gifts) {
    await expect(page.getByText(g.name, { exact: true })).toBeVisible();
    await expect(
      page.getByText(`$${Number(g.price).toFixed(2)}`),
    ).toBeVisible();
  }
  for (const g of warrior.backups) {
    await expect(page.getByText(g.name, { exact: true })).toBeHidden();
  }
});
