import { generateSeedData, type SeedOptions } from "./seed-data.ts";

type Args = Omit<SeedOptions, "now">;

const defaults: Args = {
  families: 100,
  children: 4,
  gifts: 4,
  seed: 42,
};

function parseIntegerArg(
  args: Array<string>,
  name: keyof Args,
  fallback: number,
): number {
  const flag = `--${name}`;

  for (let i = 0; i < args.length; i += 1) {
    const current = args[i];

    if (current === flag) {
      const next = args[i + 1];
      if (!next) {
        throw new Error(`Missing value for ${flag}`);
      }

      return parseRequiredInteger(next, flag);
    }

    if (current.startsWith(`${flag}=`)) {
      return parseRequiredInteger(current.slice(flag.length + 1), flag);
    }
  }

  return fallback;
}

function parseRequiredInteger(rawValue: string, flag: string): number {
  const value = Number.parseInt(rawValue, 10);

  if (Number.isNaN(value) || value < 0) {
    throw new Error(`${flag} must be a non-negative integer`);
  }

  return value;
}

function parseArgs(): Args {
  const args = process.argv.slice(2);

  return {
    families: parseIntegerArg(args, "families", defaults.families),
    children: parseIntegerArg(args, "children", defaults.children),
    gifts: parseIntegerArg(args, "gifts", defaults.gifts),
    seed: parseIntegerArg(args, "seed", defaults.seed),
  };
}

console.log(JSON.stringify(generateSeedData(parseArgs()), null, 2));
