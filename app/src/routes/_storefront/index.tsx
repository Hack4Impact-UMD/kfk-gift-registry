import { createFileRoute, Link } from "@tanstack/react-router";
import { GiftDriveStats } from "@/components/storefront/GiftDriveStats";
import type { ChildCardData } from "@/components/storefront/ChildCard";
import { ChildCard } from "@/components/storefront/ChildCard";
import type { Child, Family } from "../../../../common/src/types";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Pagination } from "@/components/storefront/Pagination";

export const Route = createFileRoute("/_storefront/")({
  // STEP 1: define the search param for TanStack Router
  validateSearch: z.object({
    search: z.string().optional(),
    sort: z.enum(["age-asc", "age-desc", "gifts-asc", "gifts-desc"]).optional(),
  }),
  component: App,
});

const familyColors = ["kfk-red", "kfk-brown", "kfk-green", "kfk-blue"];

// Mock families
const mockFamilies: Array<Family> = [
  {
    id: "fam1",
    contactName: "John Smith",
    email: "smith@example.com",
    phone: "123-456-7890",
    address: {
      street: "123 Main St",
      city: "DC",
      state: "MD",
      zipCode: "20740",
    },
    giftDrive: "drive1",
    createdAt: new Date().toISOString(),
    reviewStatus: { approved: true, held: false },
  },
  {
    id: "fam2",
    contactName: "Sarah Johnson",
    email: "johnson@example.com",
    phone: "123-456-7891",
    address: {
      street: "456 Oak St",
      city: "DC",
      state: "MD",
      zipCode: "20740",
    },
    giftDrive: "drive2",
    createdAt: new Date().toISOString(),
    reviewStatus: { approved: true, held: false },
  },
  {
    id: "fam3",
    contactName: "Williams Family",
    email: "williams@example.com",
    phone: "123-456-7892",
    address: {
      street: "789 Pine St",
      city: "DC",
      state: "MD",
      zipCode: "20740",
    },
    giftDrive: "drive3",
    createdAt: new Date().toISOString(),
    reviewStatus: { approved: true, held: false },
  },
  {
    id: "fam4",
    contactName: "Brown Family",
    email: "brown@example.com",
    phone: "123-456-7893",
    address: {
      street: "101 Maple St",
      city: "DC",
      state: "MD",
      zipCode: "20740",
    },
    giftDrive: "drive4",
    createdAt: new Date().toISOString(),
    reviewStatus: { approved: true, held: false },
  },
  {
    id: "fam5",
    contactName: "Jones Family",
    email: "jones@example.com",
    phone: "123-456-7894",
    address: {
      street: "202 Birch St",
      city: "DC",
      state: "MD",
      zipCode: "20740",
    },
    giftDrive: "drive5",
    createdAt: new Date().toISOString(),
    reviewStatus: { approved: true, held: false },
  },
];

// Mock children per family
const mockChildrenFull: Array<Child> = mockFamilies.flatMap((family) =>
  Array.from({ length: 5 }, (_, i) => ({
    id: `${family.id}-child-${i + 1}`,
    name: `Ryan Peirce`,
    status: "recently_off_treatment",
    category: i % 5 === 0 ? "warrior" : "super_sib",
    treatmentLevel: i,
    familyId: family.id,
    diagnosis: "Acute Lymphocytic Leukemia",
    diagnosisLengthYears: 1,
    livesAtHome: true,
    createdAt: new Date().toISOString(),
    hospital: "Children’s National Hospital",
    age: 4 + i,
    childSocialWorker: "Jane Doe",
    giftDrive: family.giftDrive,
    public: true,
  })),
);

const mockChildren: Array<ChildCardData & { familyId: string }> =
  mockChildrenFull
    .map((child) => ({
      id: child.id,
      name: child.name,
      photoUrl: child.photoUrl,
      category: child.category,
      age: child.age,
      diagnosis: child.diagnosis,
      giftsRequested: 3,
      giftsReceived: Math.floor(Math.random() * 3),
      familyId: child.familyId,
    }))
    .sort((a, b) => a.familyId.localeCompare(b.familyId));

function App() {
  const [childrenPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // STEP 2: read search/sort param
  const { search, sort } = Route.useSearch();

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, sort]);

  // STEP 3: filter children by search term (name or diagnosis) and sorting filters
  const filteredChildren = (
    search
      ? mockChildren.filter(
          (child) =>
            child.name.toLowerCase().includes(search.toLowerCase()) ||
            child.diagnosis?.toLowerCase().includes(search.toLowerCase()),
        )
      : [...mockChildren]
  ).sort((a, b) => {
    if (sort === "age-asc") return a.age - b.age;
    if (sort === "age-desc") return b.age - a.age;
    if (sort === "gifts-asc") return a.giftsReceived - b.giftsReceived;
    if (sort === "gifts-desc") return b.giftsReceived - a.giftsReceived;
    return 0;
  });

  const lastChildIndex = currentPage * childrenPerPage;
  const firstChildIndex = lastChildIndex - childrenPerPage;
  const currentChildrenProfiles = filteredChildren.slice(
    firstChildIndex,
    lastChildIndex,
  );

  return (
    <div className="p-4 space-y-6">
      <GiftDriveStats
        days={22}
        giftsPurchased={876}
        totalGiftsPurchased={1212}
        giftsReceived={165}
        totalDonated={87}
      />

      <div className="px-16 py-4">
        <div className="grid grid-cols-5 gap-4">
          {currentChildrenProfiles.map((child) => {
            const familyIndex = mockFamilies.findIndex(
              (f) => f.id === child.familyId,
            );

            const color = familyColors[familyIndex % familyColors.length];

            return (
              <Link
                key={child.id}
                to={`/`} // TEMP for `/child/${child.id}`
                className="block transition-transform duration-200 ease-out hover:scale-105 hover:z-10"
              >
                <ChildCard child={child} color={color} />
              </Link>
            );
          })}
        </div>

        <Pagination
          totalChildren={filteredChildren.length}
          childrenPerPage={childrenPerPage}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
          MAX_BUTTONS={9}
          IMMEDIATE_PAGES={4}
        />
      </div>
    </div>
  );
}
