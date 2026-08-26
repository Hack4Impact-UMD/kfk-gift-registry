import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import kfkLogo from "@/assets/kfk-logo.png";
import notFoundIllustration from "@/assets/404/404.png";
import cloud from "@/assets/404/cloud.png";
import blueGift from "@/assets/blue-gift.png";
import ladybug from "@/assets/ladybug-storefront.svg";

export function NotFoundScreen() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-kfk-light-blue/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 select-none"
      >
        <img src={cloud} alt="" className="absolute -top-6 -left-10 w-72" />
        <img src={cloud} alt="" className="absolute top-16 right-0 w-96" />
        <img src={cloud} alt="" className="absolute bottom-0 left-1/4 w-80" />
        <img src={cloud} alt="" className="absolute right-1/4 bottom-10 w-64" />
      </div>

      <header className="relative z-10 px-6 pt-6 sm:px-10">
        <Link to="/">
          <img
            src={kfkLogo}
            alt="Kisses for Kyle Foundation"
            className="h-12 w-auto"
          />
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-10 px-6 py-12 lg:flex-row lg:gap-16">
        <div className="relative flex w-full max-w-sm items-center justify-center lg:max-w-md pointer-events-none">
          <img
            src={ladybug}
            alt=""
            aria-hidden="true"
            className="absolute -top-2 -left-6 w-10 -rotate-130 sm:w-12"
          />
          <img
            src={blueGift}
            alt=""
            aria-hidden="true"
            className="absolute top-4 -right-7 w-16 rotate-6 sm:w-25"
          />
          <img
            src={blueGift}
            alt=""
            aria-hidden="true"
            className="absolute bottom-10 -left-10 w-16 -rotate-40 sm:w-25"
          />
          <img
            src={ladybug}
            alt=""
            aria-hidden="true"
            className="absolute -right-12 bottom-15 w-10 -rotate-30 sm:w-12"
          />
          <img
            src={notFoundIllustration}
            alt=""
            aria-hidden="true"
            className="w-full"
          />
        </div>

        <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
          <h1 className="font-gaegu text-6xl text-black sm:text-7xl">Oops!</h1>
          <span className="rounded-full bg-kfk-red px-4 py-1.5 text-sm font-semibold text-white">
            404 - Page not found
          </span>
          <p className="max-w-sm text-sm leading-6 text-black sm:text-base">
            Sorry, the page you were looking for does not exist. Please refresh
            the page or go back to the storefront.
          </p>
          <Button asChild size="lg" className="mt-2 rounded-full">
            <Link to="/">Go to Storefront</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
