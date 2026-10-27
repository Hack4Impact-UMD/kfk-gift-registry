import { describe, expect, it } from "vitest";
import { isInjectedScriptStackOverflow } from "./sentry";

const pageUrl =
  "https://gifts.kissesforkyle.org/family/form/01a11286-c39a-719a-bde8-ac7f057958c0/consent";

const stackOverflowException = (filenames: Array<string>) => ({
  type: "RangeError",
  value: "Maximum call stack size exceeded.",
  stacktrace: { frames: filenames.map((filename) => ({ filename })) },
});

const stackOverflow = (filenames: Array<string>) => ({
  exception: { values: [stackOverflowException(filenames)] },
});

describe("isInjectedScriptStackOverflow", () => {
  it("drops stack overflows whose frames are all the page URL", () => {
    expect(
      isInjectedScriptStackOverflow(stackOverflow([pageUrl, pageUrl])),
    ).toBe(true);
  });

  it("keeps stack overflows without frames", () => {
    expect(isInjectedScriptStackOverflow(stackOverflow([]))).toBe(false);
    expect(
      isInjectedScriptStackOverflow({
        exception: {
          values: [
            {
              type: "RangeError",
              value: "Maximum call stack size exceeded.",
            },
          ],
        },
      }),
    ).toBe(false);
  });

  it("keeps stack overflows with a frame missing its filename", () => {
    expect(
      isInjectedScriptStackOverflow({
        exception: {
          values: [
            {
              ...stackOverflowException([pageUrl]),
              stacktrace: { frames: [{ filename: pageUrl }, {}] },
            },
          ],
        },
      }),
    ).toBe(false);
  });

  it("drops multi-exception events only when every exception matches", () => {
    expect(
      isInjectedScriptStackOverflow({
        exception: {
          values: [
            stackOverflowException([pageUrl]),
            stackOverflowException([pageUrl]),
          ],
        },
      }),
    ).toBe(true);
    expect(
      isInjectedScriptStackOverflow({
        exception: {
          values: [
            stackOverflowException([pageUrl]),
            { type: "TypeError", value: "x is undefined" },
          ],
        },
      }),
    ).toBe(false);
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
