import { describe, expect, it } from "vitest";
import { serializeCsv } from "./csv";

describe("serializeCsv", () => {
  it("serializes headers and row values", () => {
    const csv = serializeCsv(
      [
        { name: "Blanket", status: "claimed" },
        { name: "Puzzle", status: "unclaimed" },
      ],
      [
        { header: "Gift Name", value: (row) => row.name },
        { header: "Status", value: (row) => row.status },
      ],
    );

    expect(csv).toBe(
      ["Gift Name,Status", "Blanket,claimed", "Puzzle,unclaimed"].join("\r\n"),
    );
  });

  it("escapes commas, quotes, and newlines", () => {
    const csv = serializeCsv(
      [{ note: 'Needs "large", blue\nbox' }],
      [{ header: "Note", value: (row) => row.note }],
    );

    expect(csv).toBe('Note\r\n"Needs ""large"", blue\nbox"');
  });

  it("serializes nullish values as empty cells", () => {
    const csv = serializeCsv(
      [{ name: undefined, email: null }],
      [
        { header: "Name", value: (row) => row.name },
        { header: "Email", value: (row) => row.email },
      ],
    );

    expect(csv).toBe("Name,Email\r\n,");
  });
});
