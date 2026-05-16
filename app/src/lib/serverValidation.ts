type ValidationPath = Array<string | number>;

type ValidationIssue = {
  code?: string;
  maximum?: number;
  minimum?: number;
  path?: ValidationPath;
};

type ValidationRule = {
  code?: string;
  maximum?: number;
  minimum?: number;
  message: string;
  path: ValidationPath;
};

function isValidationIssue(value: unknown): value is ValidationIssue {
  if (typeof value !== "object" || value === null) return false;
  const issue = value as Record<string, unknown>;

  const validPath =
    issue.path === undefined ||
    (Array.isArray(issue.path) &&
      issue.path.every(
        (segment) => typeof segment === "string" || typeof segment === "number",
      ));

  const validCode = issue.code === undefined || typeof issue.code === "string";
  const validMaximum =
    issue.maximum === undefined || typeof issue.maximum === "number";
  const validMinimum =
    issue.minimum === undefined || typeof issue.minimum === "number";

  return validPath && validCode && validMaximum && validMinimum;
}

function pathsEqual(left: ValidationPath, right: ValidationPath) {
  return (
    left.length === right.length &&
    left.every((segment, index) => segment === right[index])
  );
}

export function getServerValidationIssues(
  error: unknown,
): Array<ValidationIssue> {
  if (!(error instanceof Error)) {
    return [];
  }

  try {
    const parsed = JSON.parse(error.message);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isValidationIssue);
  } catch {
    return [];
  }
}

export function getValidationMessage(
  error: unknown,
  rules: Array<ValidationRule>,
) {
  const issues = getServerValidationIssues(error);

  for (const rule of rules) {
    const matchingIssue = issues.find((issue) => {
      if (!issue.path || !pathsEqual(issue.path, rule.path)) {
        return false;
      }

      if (rule.code !== undefined && issue.code !== rule.code) {
        return false;
      }

      if (rule.maximum !== undefined && issue.maximum !== rule.maximum) {
        return false;
      }

      if (rule.minimum !== undefined && issue.minimum !== rule.minimum) {
        return false;
      }

      return true;
    });

    if (matchingIssue) {
      return rule.message;
    }
  }

  return null;
}
