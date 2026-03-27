import { createFileRoute, Link } from "@tanstack/react-router";
import { GiftDriveStats } from "@/components/storefront/GiftDriveStats";
import { ChildCard, ChildCardData } from "@/components/storefront/ChildCard";
import { Child, Family, Gift } from "../../../../common/src/types";

export const Route = createFileRoute("/_storefront/")({
  component: App,
});

const familyColors = ["kfk-red", "kfk-brown", "kfk-green", "kfk-blue"];
const familyBgColors = ["bg-kfk-red", "bg-kfk-yellow", "bg-kfk-green", "bg-kfk-blue"];

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
  }));

function App() {
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
          {mockChildren.map((child) => {
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
      </div>
      
    </div>
  );
}