import type { DonorPostClaimConfirmationPayload } from "../../common/src/types/email-job";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from "react-email";

const CLAIMED_AT_TIME_ZONE = "UTC";

interface DonorPostClaimConfirmationEmailProps {
  payload?: DonorPostClaimConfirmationPayload;
  baseUrl?: string;
  donorPortalUrl?: string;
}

// example payload for development and previewing design
const previewPayload: DonorPostClaimConfirmationPayload = {
  donorId: "preview-donor",
  donorName: "Alex",
  donorEmail: "alex@example.com",
  driveId: "preview-drive",
  claimIds: ["claim-1", "claim-2", "claim-3"],
  giftIds: ["gift-1", "gift-2", "gift-3"],
  claimedAt: "2026-06-21T14:00:00.000Z",
  gifts: [
    {
      giftId: "gift-1",
      childId: "child-1",
      childName: "Maya",
      familyId: "family-1",
      familyName: "The Johnson Family",
      giftTitle: "Art Supply Set",
      productUrl: "https://example.com/art-supply-set",
      listedPrice: 28,
      familyPublicNotes: "Loves painting and drawing.",
    },
    {
      giftId: "gift-3",
      childId: "child-3",
      childName: "Eli",
      familyId: "family-1",
      familyName: "The Johnson Family",
      giftTitle: "Soccer Ball",
      productUrl: "https://example.com/soccer-ball",
      listedPrice: 19.99,
    },
    {
      giftId: "gift-2",
      childId: "child-2",
      childName: "Noah",
      familyId: "family-2",
      familyName: "The Rivera Family",
      giftTitle: "LEGO Building Set",
      productUrl: "https://example.com/lego-building-set",
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

function formatClaimedAt(claimedAt: string) {
  const date = new Date(claimedAt);
  if (Number.isNaN(date.getTime())) {
    return claimedAt;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: CLAIMED_AT_TIME_ZONE,
  }).format(date);
}

function formatAddress(params: {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}) {
  const street = [params.addressLine1, params.addressLine2]
    .filter(Boolean)
    .join(", ");
  const locality = [params.city, params.state].filter(Boolean).join(", ");
  const postalLine = [locality, params.zipCode].filter(Boolean).join(" ");
  const addressLines = [street, postalLine].filter(Boolean);

  if (addressLines.length === 0 || !params.addressLine1) {
    return "Address not available - contact KFK";
  }

  return addressLines.join(", ");
}

type GiftSummary = DonorPostClaimConfirmationPayload["gifts"][number];

function groupGiftsByFamily(gifts: Array<GiftSummary>) {
  const giftsByFamily: Record<string, Array<GiftSummary>> = {};
  for (const gift of gifts) {
    (giftsByFamily[gift.familyId] ??= []).push(gift);
  }
  return giftsByFamily;
}

export default function DonorPostClaimConfirmationEmail({
  payload = previewPayload,
  donorPortalUrl = "http://localhost:5002/donor/home",
  baseUrl = "http://localhost:5002",
}: DonorPostClaimConfirmationEmailProps) {
  const giftsByFamily = groupGiftsByFamily(payload.gifts);

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
          Thank you for claiming gifts through the Kisses for Kyle Holiday Gift Drive
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
              <Text className="my-1 text-base text-gray-500">
                Hi {payload.donorName},
              </Text>
              <Heading className="m-0 mb-2 text-2xl font-bold text-gray-900">
                Thank you for claiming gifts to support our Kisses for Kyle families facing a childhood cancer diagnosis!
              </Heading>
              <Text className="mt-0 text-base text-gray-500">
                We appreciate your support. Below is a summary of the gifts you
                claimed, grouped by the address each gift ships to.
              </Text>

              <Section className="mt-4 rounded-lg border-0 border-l-4 border-solid border-kfk-yellow bg-kfk-yellow/20 px-5 py-4">
                <Text className="m-0 text-xs font-semibold uppercase tracking-widest text-gray-700">
                  Next step
                </Text>
                <Text className="mb-0 mt-1 text-base font-semibold text-gray-900">
                  Once you purchase your gifts, please return to the donor
                  portal to confirm your purchase and share any tracking
                  information.
                </Text>
              </Section>

              <Button
                href={donorPortalUrl}
                className="mt-4 block rounded-lg bg-kfk-blue px-6 py-3.5 text-center text-sm font-semibold text-white no-underline"
              >
                Open Donor Portal
              </Button>

              <Hr className="my-6 border-gray-200" />

              <Text className="m-0 text-sm font-semibold uppercase tracking-widest text-gray-400">
                Claim details
              </Text>

              <table className="mt-3 w-full">
                <tbody>
                  <tr>
                    <td className="py-1.5 text-sm text-gray-500">Claim date</td>
                    <td className="py-1.5 text-right text-sm font-medium text-gray-900">
                      {formatClaimedAt(payload.claimedAt)}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-sm text-gray-500">
                      Gifts claimed
                    </td>
                    <td className="py-1.5 text-right text-sm font-medium text-gray-900">
                      {payload.gifts.length}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-sm text-gray-500">
                      Families included
                    </td>
                    <td className="py-1.5 text-right text-sm font-medium text-gray-900">
                      {payload.shippingByFamily.length}
                    </td>
                  </tr>
                </tbody>
              </table>

              <Hr className="my-6 border-gray-200" />

              <Text className="m-0 text-sm font-semibold uppercase tracking-widest text-gray-400">
                Gifts by shipping address
              </Text>

              {payload.shippingByFamily.map(
                (
                  family: DonorPostClaimConfirmationPayload["shippingByFamily"][number],
                ) => {
                  const addressDisplay = formatAddress(family);
                  const familyGifts = giftsByFamily[family.familyId] ?? [];

                  return (
                    <Section
                      key={family.familyId}
                      className="mt-4 rounded-lg border border-gray-200 bg-white px-5 py-4"
                    >
                      <Text className="m-0 text-base font-semibold text-gray-900">
                        {family.familyName}
                      </Text>

                      <table className="mt-2 w-full">
                        <tbody>
                          {family.contactName ? (
                            <tr>
                              <td className="py-1 text-sm text-gray-500">
                                Contact
                              </td>
                              <td className="py-1 text-right text-sm font-medium text-gray-900">
                                {family.contactName}
                              </td>
                            </tr>
                          ) : null}
                          <tr>
                            <td className="py-1 text-sm text-gray-500">
                              Address
                            </td>
                            <td className="py-1 text-right text-sm font-medium text-gray-900">
                              {addressDisplay}
                            </td>
                          </tr>
                          {family.phone ? (
                            <tr>
                              <td className="py-1 text-sm text-gray-500">
                                Phone
                              </td>
                              <td className="py-1 text-right text-sm font-medium text-gray-900">
                                {family.phone}
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>

                      {family.deliveryNotes ? (
                        <Text className="mb-0 mt-3 text-sm text-gray-700">
                          <span className="font-semibold">Delivery notes:</span>{" "}
                          {family.deliveryNotes}
                        </Text>
                      ) : null}

                      <Text className="mb-0 mt-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                        Gifts to ship here ({familyGifts.length})
                      </Text>

                      {familyGifts.map((gift) => (
                        <Section
                          key={gift.giftId}
                          className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3"
                        >
                          <Text className="m-0 text-base font-semibold text-gray-900">
                            {gift.productUrl ? (
                              <Link
                                href={gift.productUrl}
                                className="text-kfk-blue underline"
                              >
                                {gift.giftTitle}
                              </Link>
                            ) : (
                              gift.giftTitle
                            )}
                          </Text>

                          <table className="mt-2 w-full">
                            <tbody>
                              <tr>
                                <td className="py-1 text-sm text-gray-500">
                                  Child
                                </td>
                                <td className="py-1 text-right text-sm font-medium text-gray-900">
                                  {gift.childName}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-1 text-sm text-gray-500">
                                  Listed price
                                </td>
                                <td className="py-1 text-right text-sm font-medium text-gray-900">
                                  {formatCurrency(gift.listedPrice)}
                                </td>
                              </tr>
                            </tbody>
                          </table>

                          {gift.familyPublicNotes ? (
                            <Text className="mb-0 mt-3 text-sm text-gray-700">
                              <span className="font-semibold">
                                Family notes:
                              </span>{" "}
                              {gift.familyPublicNotes}
                            </Text>
                          ) : null}
                        </Section>
                      ))}
                    </Section>
                  );
                },
              )}
            </Section>

            <Text className="mt-6 text-center">
              Have questions? You may contact us at: <Link href="mailto:info@kissesforkyle.org">info@kissesforkyle.org</Link>
            </Text>

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
