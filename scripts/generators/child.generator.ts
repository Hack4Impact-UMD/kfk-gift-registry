import { faker } from "@faker-js/faker";
import { v7 as uuidv7 } from "uuid";
import type { Child, ChildStatus } from "../../common/src/index.ts";

type WarriorStatus = Exclude<
  ChildStatus,
  "sibling_in_treatment" | "bereaved_sibling" | "bereaved_sibling_5yr+"
>;
type SiblingStatus = Exclude<ChildStatus, WarriorStatus>;
type ChildTimePeriod = NonNullable<Child["diagnosisLengthYears"]>;

const warriorStatuses = [
  "recently_diagnosed_relapse",
  "diagnosed_in_treatment_1yr+",
  "recently_off_treatment",
  "off_treatment_5yr+",
] as const satisfies ReadonlyArray<WarriorStatus>;

const siblingStatuses = [
  "sibling_in_treatment",
  "bereaved_sibling",
  "bereaved_sibling_5yr+",
] as const satisfies ReadonlyArray<SiblingStatus>;

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

const recentTimePeriods = [
  "<6m",
  "6m-1y",
] as const satisfies ReadonlyArray<ChildTimePeriod>;
const extendedTimePeriods = [
  "1-2y",
  "3-4y",
  "5+y",
] as const satisfies ReadonlyArray<ChildTimePeriod>;

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

type GenerateChildOptions = {
  familyId: string;
  giftDriveId: string;
  allowPublishing?: boolean;
  createdAfter?: Date;
};

function getLifecycleFields(
  status: ChildStatus,
): Pick<Child, "diagnosisLengthYears" | "offTreatmentDurationYears"> {
  switch (status) {
    case "recently_diagnosed_relapse":
      return {
        diagnosisLengthYears: faker.helpers.arrayElement(recentTimePeriods),
        offTreatmentDurationYears: undefined,
      };
    case "diagnosed_in_treatment_1yr+":
      return {
        diagnosisLengthYears: faker.helpers.arrayElement(extendedTimePeriods),
        offTreatmentDurationYears: undefined,
      };
    case "recently_off_treatment":
      return {
        diagnosisLengthYears: undefined,
        offTreatmentDurationYears:
          faker.helpers.arrayElement(recentTimePeriods),
      };
    case "off_treatment_5yr+":
      return {
        diagnosisLengthYears: undefined,
        offTreatmentDurationYears: "5+y",
      };
    default:
      return {
        diagnosisLengthYears: undefined,
        offTreatmentDurationYears: undefined,
      };
  }
}

export function generateChild({
  familyId,
  giftDriveId,
  allowPublishing = true,
  createdAfter,
}: GenerateChildOptions): Child {
  const category = faker.helpers.weightedArrayElement([
    { value: "warrior" as const, weight: 4 },
    { value: "super_sib" as const, weight: 1 },
  ]);
  const status =
    category === "warrior"
      ? faker.helpers.arrayElement(warriorStatuses)
      : faker.helpers.arrayElement(siblingStatuses);
  const createdAt = (
    createdAfter
      ? faker.date.between({ from: createdAfter, to: new Date() })
      : faker.date.recent({ days: 30 })
  ).toISOString();
  const published =
    allowPublishing && faker.datatype.boolean({ probability: 0.75 });
  const lifecycleFields = getLifecycleFields(status);
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();

  return {
    id: uuidv7(),
    name: `${firstName} ${lastName}`,
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
    diagnosisLengthYears: lifecycleFields.diagnosisLengthYears,
    offTreatmentDurationYears: lifecycleFields.offTreatmentDurationYears,
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
