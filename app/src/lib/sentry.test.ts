import { describe, expect, it } from "vitest";
import { isInjectedScriptStackOverflow } from "./sentry";

const stackOverflow = (filenames: Array<string>) => ({
  exception: {
    values: [
      {
        type: "RangeError",
        value: "Maximum call stack size exceeded.",
        stacktrace: { frames: filenames.map((filename) => ({ filename })) },
      },
    ],
  },
});

describe("isInjectedScriptStackOverflow", () => {
  it("drops stack overflows whose frames are all the page URL", () => {
    const pageUrl =
      "https://gifts.kissesforkyle.org/family/form/01a11286-c39a-719a-bde8-ac7f057958c0/consent";

    expect(
      isInjectedScriptStackOverflow(stackOverflow([pageUrl, pageUrl])),
    ).toBe(true);
  });

  it("keeps stack overflows with a frame from our bundle", () => {
    expect(
      isInjectedScriptStackOverflow(
        stackOverflow([
          "https://gifts.kissesforkyle.org/family/form/abc/consent",
          "https://gifts.kissesforkyle.org/assets/index-DlsKqnSD.js",
        ]),
      ),
    ).toBe(false);
  });

  it("keeps other errors", () => {
    expect(
      isInjectedScriptStackOverflow({
        exception: { values: [{ type: "TypeError", value: "x is undefined" }] },
      }),
    ).toBe(false);
  });
});
