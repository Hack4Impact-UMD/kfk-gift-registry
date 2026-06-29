import type { DonorPurchaseReminderPayload } from "../../common/src/types/email-job";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

interface DonorPurchaseReminderEmailProps {
  payload?: DonorPurchaseReminderPayload;
  donorPortalUrl?: string;
  baseUrl?: string;
}

const previewPayload: DonorPurchaseReminderPayload = {
  donorId: "preview-donor",
  donorName: "Alex",
  donorEmail: "alex@example.com",
  driveId: "preview-drive",
  claimIds: ["claim-1", "claim-2"],
  giftIds: ["gift-1", "gift-2"],
  claimedAt: "2026-06-21T14:00:00.000Z",
  reminderReason:
    "We noticed these gifts have not been marked as purchased yet. Please confirm your order when you can.",
  gifts: [
    {
      giftId: "gift-1",
      childId: "child-1",
      childName: "Maya",
      familyId: "family-1",
      familyName: "The Johnson Family",
      giftTitle: "Art Supply Set",
      listedPrice: 28,
      familyPublicNotes: "Loves painting and drawing.",
    },
    {
      giftId: "gift-2",
      childId: "child-2",
      childName: "Noah",
      familyId: "family-2",
      familyName: "The Rivera Family",
      giftTitle: "LEGO Building Set",
      listedPrice: 42,
    },
  ],
  shippingByFamily: [
    {
      familyId: "family-1",
      familyName: "The Johnson Family",
      contactName: "Erica Johnson",
      addressLine1: "123 Maple Street",
      city: "Philadelphia",
      state: "PA",
      zipCode: "19103",
      phone: "(215) 555-0123",
    },
    {
      familyId: "family-2",
      familyName: "The Rivera Family",
      contactName: "Luis Rivera",
      addressLine1: "456 Pine Avenue",
      addressLine2: "Apt 3B",
      city: "Camden",
      state: "NJ",
      zipCode: "08102",
      phone: "(856) 555-0456",
      deliveryNotes: "Please leave packages with the front desk.",
    },
  ],
};

function formatCurrency(amount?: number) {
  if (amount == null) {
    return "Price not listed";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function DonorPurchaseReminderEmail({
  payload = previewPayload,
  donorPortalUrl = "http://localhost:5002/donor/home",
  baseUrl = "http://localhost:5002",
}: DonorPurchaseReminderEmailProps) {
  return (
    <Tailwind
      config={{
        theme: {
          extend: {
            colors: {
              "kfk-blue": "#0839b1",
              "kfk-yellow": "#ffca15",
            },
            fontFamily: {
              sans: ["Helvetica Neue", "Arial", "sans-serif"],
            },
          },
        },
      }}
    >
      <Html lang="en">
        <Head />
        <Preview>
          Reminder: please confirm your KFK gift purchases in the donor portal
        </Preview>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-[640px] py-10">
            <Section className="rounded-t-lg bg-gray-200 px-8 py-5 text-center">
              <Img
                src={`${baseUrl}/kfk-logo.png`}
                alt="Kisses for Kyle Foundation"
                width={220}
                className="mx-auto"
              />
            </Section>

            <Section className="rounded-b-lg border border-t-0 border-gray-200 bg-white px-8 py-8">
              <Text className="my-0 text-base text-gray-500">
                Hi {payload.donorName},
              </Text>
              <Heading className="m-0 mb-2 text-2xl font-bold text-gray-900">
                Friendly reminder to confirm your gift purchases
              </Heading>
              <Text className="mt-0 text-base text-gray-600">
                Thank you again for supporting Kisses for Kyle. If you have
                already purchased the gifts below, please confirm your purchase
                in the donor portal and share any tracking information you have.
              </Text>

              {payload.reminderReason ? (
                <Text className="mt-4 rounded-lg bg-kfk-yellow/20 px-4 py-3 text-sm text-gray-800">
                  {payload.reminderReason}
                </Text>
              ) : null}

              <Hr className="my-6 border-gray-200" />

              <Text className="m-0 text-sm font-semibold uppercase tracking-widest text-gray-400">
                Gifts awaiting purchase confirmation
              </Text>

              {payload.gifts.map(
                (gift: DonorPurchaseReminderPayload["gifts"][number]) => (
                  <Section
                    key={gift.giftId}
                    className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-5 py-4"
                  >
                    <Text className="m-0 text-base font-semibold text-gray-900">
                      {gift.giftTitle}
                    </Text>
                    <Text className="mt-1 mb-0 text-sm text-gray-600">
                      Child: {gift.childName}
                    </Text>
                    <Text className="mt-1 mb-0 text-sm text-gray-600">
                      Family: {gift.familyName}
                    </Text>
                    <Text className="mt-1 mb-0 text-sm text-gray-600">
                      Listed Price: {formatCurrency(gift.listedPrice)}
                    </Text>
                    {gift.familyPublicNotes ? (
                      <Text className="mt-2 mb-0 text-sm text-gray-700">
                        <span className="font-semibold">Family notes:</span>{" "}
                        {gift.familyPublicNotes}
                      </Text>
                    ) : null}
                  </Section>
                )
              )}

              <Hr className="my-6 border-gray-200" />

              <Text className="mb-6 text-sm text-gray-600">
                You can use the donor portal to confirm purchases, upload proof
                of purchase, and add tracking information for each gift.
              </Text>

              <Button
                href={donorPortalUrl}
                className="block rounded-lg bg-kfk-blue px-6 py-3.5 text-center text-sm font-semibold text-white no-underline"
              >
                Open Donor Portal
              </Button>
            </Section>

            <Text className="mt-6 text-center text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Kisses for Kyle Foundation. All
              rights reserved.
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
