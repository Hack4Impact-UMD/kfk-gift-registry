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

interface FamilyPortalEmailProps {
  contactName: string;
  familyLink: string;
  baseUrl?: string;
}

export default function FamilyPortalEmail({
  contactName = "Family",
  familyLink = "https://example.com",
  baseUrl = "http://localhost:5002",
}: FamilyPortalEmailProps) {
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
        <Preview>Your KFK family page is ready</Preview>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-[560px] py-10">
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
                Hi {contactName},
              </Text>
              <Heading className="m-0 mb-2 text-2xl font-bold text-gray-900">
                Your family page is ready
              </Heading>
              <Text className="mt-0 text-base text-gray-500">
                Thank you for submitting your family&apos;s gift drive form. Use
                the unique link below to view your family page.
              </Text>

              <Hr className="my-6 border-gray-200" />

              <Button
                href={familyLink}
                className="block rounded-lg bg-kfk-blue px-6 py-3.5 text-center text-sm font-semibold text-white no-underline"
              >
                Open Family Page
              </Button>

              <Text className="mb-2 mt-6 text-sm font-semibold uppercase tracking-widest text-gray-400">
                Unique link
              </Text>
              <Text className="m-0 break-all rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                {familyLink}
              </Text>

              <Text className="mb-0 mt-6 text-sm text-gray-600">
                Please save this email so you can return to your family page
                later.
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
