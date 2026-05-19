import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Tailwind,
  Text,
} from "react-email";

interface WelcomeEmailProps {
  name: string;
}

export default function WelcomeEmail({ name = "there" }: WelcomeEmailProps) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Welcome to KFK Gift Registry</Preview>
        <Body className="bg-white font-sans">
          <Container className="mx-auto py-12 max-w-xl px-4">
            <Heading className="text-2xl font-bold mt-10 mb-6">
              Welcome, {name}!
            </Heading>
            <Text className="text-base leading-relaxed text-gray-700">
              You&apos;ve been invited to a gift registry. Start adding gifts or
              viewing your list below.
            </Text>
            <Button
              href="https://example.com"
              className="bg-black text-white rounded-md text-base px-5 py-3 block text-center no-underline"
            >
              View Registry
            </Button>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}
