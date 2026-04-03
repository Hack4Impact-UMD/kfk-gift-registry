import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { Child, ChildStatus } from "../../common/src/index.ts";

const warriorStatuses = [
  "recently_diagnosed_relapse",
  "diagnosed_in_treatment_1yr+",
  "recently_off_treatment",
  "off_treatment_5yr+",
] as const satisfies ReadonlyArray<ChildStatus>;

const siblingStatuses = [
  "sibling_in_treatment",
  "bereaved_sibling",
  "bereaved_sibling_5yr+",
] as const satisfies ReadonlyArray<ChildStatus>;

const diagnoses = [
  "Leukemia",
  "Lymphoma",
  "Neuroblastoma",
  "Wilms tumor",
  "Medulloblastoma",
  "Osteosarcoma",
] as const;

const hospitals = [
  "Children's National",
  "Nemours Children's Health",
  "Children's Hospital of Philadelphia",
  "St. Christopher's Hospital for Children",
  "Cooper University Hospital",
] as const;

const timePeriods = ["<6m", "6m-1y", "1-2y", "3-4y", "5+y"] as const;

const warriorBlurbs = [
  "Loves building sets, art projects, and movie nights.",
  "Enjoys gaming, puzzles, and cheering on favorite teams.",
  "Big fan of crafts, music, and hands-on activities.",
  "Likes science kits, books, and outdoor play when feeling up to it.",
] as const;

const siblingBlurbs = [
  "Enjoys crafts, stuffed animals, and quiet reading time.",
  "Loves music, board games, and family movie nights.",
  "Big fan of creative projects and cozy indoor activities.",
  "Enjoys coloring, pretend play, and collecting small treasures.",
] as const;

const staffPrivateNotes = [
  "Keep unpublished until staff confirms the family review is complete.",
  "Photo and blurb are ready, but the profile should stay internal for now.",
  "Staff requested one more verification step before this child is published.",
] as const;

export function generateChild(
  familyId: string,
  giftDriveId: string,
  allowPublishing = true,
): Child {
  const category = faker.helpers.weightedArrayElement([
    { value: "warrior" as const, weight: 4 },
    { value: "super_sib" as const, weight: 1 },
  ]);
  const status =
    category === "warrior"
      ? faker.helpers.arrayElement(warriorStatuses)
      : faker.helpers.arrayElement(siblingStatuses);
  const createdAt = faker.date.recent({ days: 30 }).toISOString();
  const published =
    allowPublishing && faker.datatype.boolean({ probability: 0.75 });

  return {
    id: uuidv7(),
    name: faker.person.firstName(),
    status,
    category,
    treatmentLevel:
      category === "warrior" && faker.datatype.boolean({ probability: 0.55 })
        ? faker.number.int({ min: 0, max: 3 })
        : undefined,
    familyId,
    diagnosis:
      category === "super_sib"
        ? "Sibling support case"
        : faker.helpers.arrayElement(diagnoses),
    diagnosisLengthYears:
      status === "recently_diagnosed_relapse"
        ? faker.helpers.arrayElement(timePeriods.slice(0, 2))
        : status === "diagnosed_in_treatment_1yr+"
          ? faker.helpers.arrayElement(timePeriods.slice(2))
          : undefined,
    offTreatmentDurationYears:
      status === "recently_off_treatment"
        ? faker.helpers.arrayElement(timePeriods.slice(0, 2))
        : status === "off_treatment_5yr+"
          ? "5+y"
          : status === "bereaved_sibling_5yr+"
            ? faker.helpers.arrayElement(["3-4y", "5+y"] as const)
            : undefined,
    livesAtHome: true,
    publicBlurb: faker.datatype.boolean({ probability: 0.8 })
      ? category === "warrior"
        ? faker.helpers.arrayElement(warriorBlurbs)
        : faker.helpers.arrayElement(siblingBlurbs)
      : undefined,
    createdAt,
    hospital: faker.helpers.arrayElement(hospitals),
    age: faker.number.int({ min: 3, max: 16 }),
    childSocialWorker: faker.person.fullName(),
    giftDrive: giftDriveId,
    staffPrivateNotes: published
      ? undefined
      : faker.helpers.arrayElement(staffPrivateNotes),
    published,
  };
}
