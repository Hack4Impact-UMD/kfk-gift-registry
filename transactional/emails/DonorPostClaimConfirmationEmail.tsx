/// <reference path="../react-jsx-runtime.d.ts" />
/// <reference path="./jsx.d.ts" />
import type { DonorPostClaimConfirmationPayload } from "common";
import {
  Body,
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

interface DonorPostClaimConfirmationEmailProps {
  payload: DonorPostClaimConfirmationPayload;
  baseUrl?: string;
}

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
  }).format(date);
}

export default function DonorPostClaimConfirmationEmail({
  payload,
  baseUrl = "http://localhost:5002",
}: DonorPostClaimConfirmationEmailProps) {
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
          Thank you for claiming gifts through the KFK Gift Registry
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
                Thank you for claiming gifts!
              </Heading>
              <Text className="mt-0 text-base text-gray-600">
                We appreciate your support. Below is a summary of the gifts you
                claimed on {formatClaimedAt(payload.claimedAt)} and the shipping
                information for each family.
              </Text>

              <Hr className="my-6 border-gray-200" />

              <Text className="m-0 text-sm font-semibold uppercase tracking-widest text-gray-400">
                Claimed gifts
              </Text>

              {payload.gifts.map((gift) => (
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
              ))}

              <Hr className="my-6 border-gray-200" />

              <Text className="m-0 text-sm font-semibold uppercase tracking-widest text-gray-400">
                Shipping information
              </Text>

              {payload.shippingByFamily.map((family) => (
                <Section
                  key={family.familyId}
                  className="mt-4 rounded-lg border border-gray-200 bg-white px-5 py-4"
                >
                  <Text className="m-0 text-base font-semibold text-gray-900">
                    {family.familyName}
                  </Text>
                  {family.contactName ? (
                    <Text className="mt-2 mb-0 text-sm text-gray-700">
                      <span className="font-semibold">Contact:</span>{" "}
                      {family.contactName}
                    </Text>
                  ) : null}
                  <Text className="mt-1 mb-0 text-sm text-gray-700">
                    <span className="font-semibold">Address:</span>{" "}
                    {family.addressLine1}
                    {family.addressLine2 ? `, ${family.addressLine2}` : ""}
                    {family.city ? `, ${family.city}` : ""}
                    {family.state ? `, ${family.state}` : ""}
                    {family.zipCode ? ` ${family.zipCode}` : ""}
                  </Text>
                  {family.phone ? (
                    <Text className="mt-1 mb-0 text-sm text-gray-700">
                      <span className="font-semibold">Phone:</span>{" "}
                      {family.phone}
                    </Text>
                  ) : null}
                  {family.deliveryNotes ? (
                    <Text className="mt-2 mb-0 text-sm text-gray-700">
                      <span className="font-semibold">Delivery notes:</span>{" "}
                      {family.deliveryNotes}
                    </Text>
                  ) : null}
                </Section>
              ))}

              <Hr className="my-6 border-gray-200" />

              <Text className="mb-0 text-sm text-gray-600">
                Once you purchase your gifts, please return to the donor portal
                to confirm your purchase and share any tracking information.
              </Text>
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
