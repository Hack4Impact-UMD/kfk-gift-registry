import { createFileRoute, Link } from "@tanstack/react-router";
import { GiftDriveStats } from "@/components/storefront/GiftDriveStats";
import { ChildCard, ChildCardData } from "@/components/storefront/ChildCard";
import { Child, Family, Gift } from "../../../../common/src/types";
import { useState } from "react";
import { z } from "zod";
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from "@heroicons/react/24/outline";

export const Route = createFileRoute("/_storefront/")({
  // STEP 1: define the search param for TanStack Router
  validateSearch: z.object({
    search: z.string().optional(),
  }),
  component: App,
});

const familyColors = ["kfk-red", "kfk-brown", "kfk-green", "kfk-blue"];
const familyBgColors = ["bg-kfk-red", "bg-kfk-yellow", "bg-kfk-green", "bg-kfk-blue"];

const getPaginationRange = (
  pages:Array<number>,
  currentPage: number,
  totalPages: number,
  maxButtons: number,
  immediatePages: number
) => {
  let range = [];

  if (pages.length <= maxButtons)
    range = pages;
  else if (currentPage <= immediatePages)
    range = [...pages.slice(0, immediatePages + 3), -1, totalPages]; // -1 represents the ellipsis
  else if (currentPage > totalPages - immediatePages)
    range = [1, -1, ...pages.slice(totalPages - immediatePages - 3, totalPages)];
  else
    range = [1, -1, ...pages.slice(currentPage - 1 - immediatePages/2, currentPage + immediatePages/2), -1, totalPages];

  return range;
}

// Pagination
interface PaginationProp {
  totalChildren: number,
  childrenPerPage: number,
  setCurrentPage: (page: number) => any,
  currentPage: number,
  MAX_BUTTONS: number,
  IMMEDIATE_PAGES: number,
}
const Pagination = ( {totalChildren, childrenPerPage, setCurrentPage, currentPage, MAX_BUTTONS, IMMEDIATE_PAGES} : PaginationProp ) => {
  const totalPages = Math.ceil(totalChildren/childrenPerPage)
  let pages = [];

  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  const range = getPaginationRange(pages, currentPage, totalPages, MAX_BUTTONS, IMMEDIATE_PAGES);

  return (
    <div className="mx-auto mt-10 flex justify-center gap-2 text-xl">
      {/* Left Arrow */}
      <button 
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage == 1}
        className={`rounded-full pl-2 w-10 h-10 ${currentPage == 1 ? "text-gray-400" : "bg-transparent text-primary hover:bg-gray-100"} transition-all text-xl`}
      >
        <ChevronDoubleLeftIcon className="size-5"/>
      </button>
      {/* Pages */}
      {range.map((page) => {
        return (
          <button 
            onClick={() => setCurrentPage(page)}
            disabled={page == -1}
            className={`rounded-full text-primary w-10 h-10 ${page != -1 ? page == currentPage ? "bg-kfk-blue text-white" : "bg-transparent hover:bg-gray-100" : ""} transition-all text-xl`}
          >{page == -1 ? "..." : page}</button>
        )
      })}
      {/* Right Arrow */}
      <button 
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage == Math.ceil(totalChildren/childrenPerPage)}
        className={`rounded-full pl-3 w-10 h-10 ${currentPage == totalPages ? "text-gray-400" : "bg-transparent text-primary hover:bg-gray-100"} transition-all text-xl`}
      >
        <ChevronDoubleRightIcon className="size-5"/>
      </button>
    </div>
  )
}

// Mock families
const mockFamilies: Family[] = [
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
const mockChildrenFull: Child[] = mockFamilies.flatMap((family) =>
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
  }))
);

const mockChildren: (ChildCardData & { familyId: string })[] =
  mockChildrenFull.map((child) => ({
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
  ;

function App() {
  const [childrenPerPage] = useState<number>(25);
  const [currentPage, setCurrentPage] = useState<number>(1);
 
  // STEP 2: read search param from URL
  const { search } = Route.useSearch();
 
  // STEP 3: filter children by search term (name or diagnosis)
  const filteredChildren = search
    ? mockChildren.filter(
        (child) =>
          child.name.toLowerCase().includes(search.toLowerCase()) ||
          child.diagnosis?.toLowerCase().includes(search.toLowerCase())
      )
    : mockChildren;

  const lastChildIndex = currentPage * childrenPerPage;
  const firstChildIndex = lastChildIndex - childrenPerPage;
  const currentChildrenProfiles = filteredChildren.slice(firstChildIndex, lastChildIndex);

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
              (f) => f.id === child.familyId
            );

            const bgColor =
              familyBgColors[familyIndex % familyBgColors.length];
            const color =
              familyColors[familyIndex % familyColors.length];

            return (
              <Link
                key={child.id}
                to={`/`} // TEMP for `/child/${child.id}`
                className="block transition-transform duration-200 ease-out hover:scale-105 hover:z-10"
              >
                <ChildCard
                  key={child.id}
                  child={child}
                  color={color}
                  bgColor={bgColor}
                />
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