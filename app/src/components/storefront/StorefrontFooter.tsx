import { EnvelopeIcon } from "@/components/icons";

const SUPPORT_EMAIL = "info@kissesforkyle.org";

export function StorefrontFooter() {
  return (
    <footer className="mt-10 border-t-2 border-dashed border-kfk-light-grey bg-kfk-light-blue/20 px-2 py-6 sm:px-4">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-left">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col items-start gap-1">
            <p className="font-gaegu text-xl text-kfk-blue">
              Kisses for Kyle Foundation
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-kfk-blue hover:underline"
            >
              <EnvelopeIcon className="size-4 shrink-0" />
              {SUPPORT_EMAIL}
            </a>
            <a
              href="https://kissesforkyle.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-600 hover:text-kfk-blue hover:underline"
            >
              kissesforkyle.org
            </a>
            <a
              href="https://kissesforkyle.org/donations/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold text-kfk-blue hover:underline"
            >
              Donate
            </a>
          </div>

          <p className="text-gray-600 sm:text-right">
            Made with <span className="text-kfk-red">❤️</span> by{" "}
            <a
              href="https://umd.hack4impact.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-kfk-blue hover:underline"
            >
              Hack4Impact-UMD
            </a>
          </p>
        </div>

        <p className="text-xs text-gray-500">
          © {new Date().getFullYear()} Kisses for Kyle Foundation — a non-profit
          organization with 501(c)(3) status, established in 2001.
        </p>
      </div>
    </footer>
  );
}
