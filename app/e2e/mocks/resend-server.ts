// Stand-in for the Resend API. The app server sends email itself, so
// page.route can't see it; RESEND_BASE_URL points the SDK here instead.
import { randomUUID } from "node:crypto";
import { createServer } from "node:http";
import type { IncomingMessage } from "node:http";

const PORT = Number(process.env.MOCK_RESEND_PORT ?? 4010);

type SentEmail = {
  from: string;
  to: string | Array<string>;
  subject: string;
  html?: string;
};

let sent: Array<SentEmail> = [];

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

createServer(async (req, res) => {
  const json = (status: number, data: unknown) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  if (req.method === "POST" && req.url === "/emails") {
    sent.push(JSON.parse(await readBody(req)));
    return json(200, { id: randomUUID() });
  }
  if (req.method === "POST" && req.url === "/emails/batch") {
    const emails = JSON.parse(await readBody(req)) as Array<SentEmail>;
    sent.push(...emails);
    return json(200, { data: emails.map(() => ({ id: randomUUID() })) });
  }
  // test-only endpoints
  if (req.url === "/__emails") {
    if (req.method === "GET") return json(200, sent);
    if (req.method === "DELETE") {
      sent = [];
      return json(200, {});
    }
  }
  // playwright's webServer readiness check
  if (req.method === "GET" && req.url === "/") return json(200, {});

  json(404, { message: `mock resend: unhandled ${req.method} ${req.url}` });
}).listen(PORT, "127.0.0.1", () => {
  console.log(`mock resend listening on ${PORT}`);
});
