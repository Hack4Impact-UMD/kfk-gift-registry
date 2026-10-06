// talks to the mock resend server (e2e/mocks/resend-server.ts)
export const MOCK_RESEND_URL = "http://127.0.0.1:4010";

export type SentEmail = {
  from: string;
  to: string | Array<string>;
  subject: string;
  html?: string;
};

export async function getSentEmails(to?: string) {
  const res = await fetch(`${MOCK_RESEND_URL}/__emails`);
  const emails = (await res.json()) as Array<SentEmail>;
  return to ? emails.filter((e) => [e.to].flat().includes(to)) : emails;
}

export async function clearSentEmails() {
  await fetch(`${MOCK_RESEND_URL}/__emails`, { method: "DELETE" });
}
