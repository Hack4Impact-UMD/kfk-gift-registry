import { UserRole } from "common";
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

const ROLE_LABELS: Record<UserRole.DIRECTOR | UserRole.ADMIN | UserRole.VOLUNTEER, string> = {
  [UserRole.DIRECTOR]: "Director",
  [UserRole.ADMIN]: "Admin",
  [UserRole.VOLUNTEER]: "Volunteer",
};

interface StaffInviteEmailProps {
  name: string;
  role: UserRole.DIRECTOR | UserRole.ADMIN | UserRole.VOLUNTEER;
  inviteLink: string;
  baseUrl?: string;
}

export default function StaffInviteEmail({
  name = "Team Member",
  role = UserRole.VOLUNTEER,
  inviteLink = "https://example.com",
  baseUrl = "http://localhost:5002",
}: StaffInviteEmailProps) {
  const roleLabel = ROLE_LABELS[role];

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
        <Preview>You&apos;ve been invited to join KFK Gift Registry</Preview>
        <Body className="bg-gray-50 font-sans">
          <Container className="mx-auto max-w-[560px] py-10">
            {/* Header */}
            <Section className="bg-gray-200 rounded-t-lg px-8 py-5 text-center">
              <Img
                src={`${baseUrl}/kfk-logo.png`}
                alt="Kisses for Kyle Foundation"
                width={220}
                className="mx-auto"
              />
            </Section>

            {/* Body */}
            <Section className="rounded-b-lg border border-t-0 border-gray-200 bg-white px-8 py-8">
              <Text className="my-0 text-base text-gray-500">
                Hi {name},
              </Text>
              <Heading className="m-0 mb-2 text-2xl font-bold text-gray-900">
                You&apos;ve been invited!
              </Heading>
              <Text className="mt-0 text-base text-gray-500">
                You have been invited to join the Kisses for Kyle Gift Registry team.
              </Text>

              <Hr className="my-6 border-gray-200" />

              <Text className="m-0 text-sm font-semibold uppercase tracking-widest text-gray-400">
                Invitation details
              </Text>

              <table className="mt-3 w-full">
                <tbody>
                  <tr>
                    <td className="py-1.5 text-sm text-gray-500">Name</td>
                    <td className="py-1.5 text-right text-sm font-medium text-gray-900">
                      {name}
                    </td>
                  </tr>
                  <tr>
                    <td className="py-1.5 text-sm text-gray-500">Role</td>
                    <td className="py-1.5 text-right">
                      <span className="inline-block rounded-full bg-kfk-yellow px-3 py-0.5 text-xs font-semibold text-gray-900">
                        {roleLabel}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <Hr className="my-6 border-gray-200" />

              <Text className="mb-6 text-sm text-gray-600">
                Click the button below to complete your registration and access
                the platform.
              </Text>

              <Button
                href={inviteLink}
                className="block rounded-lg bg-kfk-blue px-6 py-3.5 text-center text-sm font-semibold text-white no-underline"
              >
                Accept Invitation
              </Button>

              <Text className="mt-6 text-xs text-gray-400">
                If you weren&apos;t expecting this invitation, you can safely
                ignore this email.
              </Text>
            </Section>

            {/* Footer */}
            <Text className="mt-6 text-center text-xs text-gray-400">
              &copy; {new Date().getFullYear()} Kisses for Kyle Foundation. All rights
              reserved.
            </Text>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
