/**
 * Verifies that every Firestore query in the codebase is backed by an index
 * declared in firestore.indexes.json.
 *
 * The emulator never enforces composite indexes, so a query that works
 * locally can fail in production with FAILED_PRECONDITION. This script parses
 * the source with the TypeScript compiler, finds every `.where()` /
 * `.orderBy()` chain on a Firestore collection, works out which composite
 * index (if any) the query needs, and checks it against the JSON file.
 *
 * Usage:
 *   pnpm lint:indexes            # report and exit 1 if an index is missing
 *   pnpm lint:indexes --write    # also add missing indexes to the JSON file
 *   pnpm lint:indexes --verbose  # list every query found
 */
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";

// Run from anywhere in the repo: walk up to the directory holding the indexes.
function findRoot(dir: string): string {
  if (fs.existsSync(path.join(dir, "firestore.indexes.json"))) return dir;
  const parent = path.dirname(dir);
  if (parent === dir) throw new Error("firestore.indexes.json not found");
  return findRoot(parent);
}

const ROOT = findRoot(process.cwd());
const INDEX_FILE = path.join(ROOT, "firestore.indexes.json");
const SCAN_DIRS = ["app/src", "functions/src", "common/src", "scripts"];
const IGNORED_DIRS = new Set(["node_modules", "build", "dist", ".output"]);

const args = new Set(process.argv.slice(2));
const WRITE = args.has("--write");
const VERBOSE = args.has("--verbose");

// Methods that can appear in a Firestore query chain.
const QUERY_METHODS = new Set([
  "where",
  "orderBy",
  "limit",
  "limitToLast",
  "offset",
  "startAt",
  "startAfter",
  "endAt",
  "endBefore",
  "select",
]);
const EQUALITY_OPS = new Set(["==", "in"]);
const ARRAY_OPS = new Set(["array-contains", "array-contains-any"]);
const INEQUALITY_OPS = new Set(["<", "<=", ">", ">=", "!=", "not-in"]);

type Direction = "ASCENDING" | "DESCENDING";
type Filter = { field: string; op: string };
type Order = { field: string; direction: Direction };
type Scope = "COLLECTION" | "COLLECTION_GROUP";

type Query = {
  location: string;
  collection: string;
  scope: Scope;
  filters: Array<Filter>;
  orders: Array<Order>;
};

type IndexField = {
  fieldPath: string;
  order?: Direction;
  arrayConfig?: "CONTAINS";
};
type Index = {
  collectionGroup: string;
  queryScope: Scope;
  fields: Array<IndexField>;
};
type FieldOverride = {
  collectionGroup: string;
  fieldPath: string;
  indexes: Array<{
    queryScope: Scope;
    order?: Direction;
    arrayConfig?: "CONTAINS";
  }>;
};
type IndexFile = {
  indexes: Array<Index>;
  fieldOverrides: Array<FieldOverride>;
};

type Requirement =
  | { kind: "single-field" | "index-merge" }
  | {
      kind: "composite";
      // Equality fields: any order, any direction.
      equality: Array<{ field: string; array: boolean }>;
      // Fields fixed by an explicit orderBy: exact order and direction.
      ordered: Array<Order>;
      // Inequality fields not covered by orderBy: any order.
      ranges: Array<{ field: string; direction: Direction }>;
    };

// ---------------------------------------------------------------------------
// Source scanning

function listSourceFiles(dir: string): Array<string> {
  if (!fs.existsSync(dir)) return [];
  const out: Array<string> = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) out.push(...listSourceFiles(full));
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out;
}

const files = SCAN_DIRS.flatMap((d) => listSourceFiles(path.join(ROOT, d)));
const sources = files.map((file) =>
  ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  ),
);

function walk(node: ts.Node, visit: (node: ts.Node) => void) {
  visit(node);
  node.forEachChild((child) => walk(child, visit));
}

// String constants (e.g. `export const GIFT_COLLECTION = "gifts"`), keyed by
// name across all files so collection constants resolve wherever they're used.
const stringConstants = new Map<string, string>();
for (const sf of sources) {
  walk(sf, (node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isStringLiteralLike(node.initializer) &&
      ts.getCombinedNodeFlags(node) & ts.NodeFlags.Const
    ) {
      stringConstants.set(node.name.text, node.initializer.text);
    }
  });
}

function resolveString(expr: ts.Expression | undefined): string | undefined {
  if (!expr) return undefined;
  if (ts.isStringLiteralLike(expr)) return expr.text;
  if (ts.isIdentifier(expr)) return stringConstants.get(expr.text);
  if (ts.isPropertyAccessExpression(expr)) {
    return stringConstants.get(expr.name.text);
  }
  return undefined;
}

// Typed collection accessors such as `db.gifts`, found from object literals
// like `{ gifts: collection<Gift>(GIFT_COLLECTION) }`.
const collectionProps = new Map<string, string>();
for (const sf of sources) {
  walk(sf, (node) => {
    if (
      ts.isPropertyAssignment(node) &&
      ts.isIdentifier(node.name) &&
      ts.isCallExpression(node.initializer)
    ) {
      const callee = node.initializer.expression;
      const calleeName = ts.isIdentifier(callee)
        ? callee.text
        : ts.isPropertyAccessExpression(callee)
          ? callee.name.text
          : undefined;
      if (calleeName !== "collection") return;
      const name = resolveString(node.initializer.arguments[0]);
      if (name) collectionProps.set(node.name.text, name);
    }
  });
}

function location(node: ts.Node) {
  const sf = node.getSourceFile();
  const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
  return `${path.relative(ROOT, sf.fileName)}:${line + 1}`;
}

function methodName(node: ts.Node): string | undefined {
  if (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression)
  ) {
    return node.expression.name.text;
  }
  return undefined;
}

function resolveField(expr: ts.Expression | undefined): string | undefined {
  if (!expr) return undefined;
  const str = resolveString(expr);
  if (str !== undefined) return str;
  // FieldPath.documentId()
  if (methodName(expr) === "documentId") return "__name__";
  // new FieldPath("a", "b")
  if (ts.isNewExpression(expr) && expr.arguments) {
    const parts = expr.arguments.map((a) => resolveString(a));
    if (parts.every((p) => p !== undefined)) return parts.join(".");
  }
  return undefined;
}

// Find the variable declaration for an identifier within its source file.
function findDeclaration(
  id: ts.Identifier,
): ts.VariableDeclaration | undefined {
  let found: ts.VariableDeclaration | undefined;
  walk(id.getSourceFile(), (node) => {
    if (
      !found &&
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === id.text &&
      node.getStart() < id.getStart()
    ) {
      found = node;
    }
  });
  return found;
}

const warnings: Array<string> = [];

type Base = { collection: string; scope: Scope };

// Resolve the query chain rooted at `expr`, collecting filters/orders
// (outermost first) and returning the collection it targets.
function resolveChain(
  expr: ts.Expression,
  filters: Array<Filter>,
  orders: Array<Order>,
  depth = 0,
): Base | undefined {
  if (depth > 10) return undefined;

  const method = methodName(expr);
  if (method && QUERY_METHODS.has(method)) {
    const call = expr as ts.CallExpression;
    if (method === "where") {
      const [fieldArg, opArg] = call.arguments;
      const field = resolveField(fieldArg);
      const op = resolveString(opArg);
      if (field === undefined || op === undefined) {
        warnings.push(
          `${location(call)}: could not resolve where(${call.arguments
            .map((a) => a.getText())
            .join(", ")})`,
        );
      } else {
        filters.unshift({ field, op });
      }
    } else if (method === "orderBy") {
      const field = resolveField(call.arguments[0]);
      const dir = resolveString(call.arguments[1]);
      if (field === undefined) {
        warnings.push(`${location(call)}: could not resolve orderBy field`);
      } else {
        orders.unshift({
          field,
          direction: dir === "desc" ? "DESCENDING" : "ASCENDING",
        });
      }
    }
    const receiver = (call.expression as ts.PropertyAccessExpression)
      .expression;
    return resolveChain(receiver, filters, orders, depth + 1);
  }

  if (method === "withConverter") {
    const call = expr as ts.CallExpression;
    const receiver = (call.expression as ts.PropertyAccessExpression)
      .expression;
    return resolveChain(receiver, filters, orders, depth + 1);
  }

  if (method === "collection" || method === "collectionGroup") {
    const name = resolveString((expr as ts.CallExpression).arguments[0]);
    if (!name) return undefined;
    return {
      collection: name,
      scope: method === "collection" ? "COLLECTION" : "COLLECTION_GROUP",
    };
  }

  // Local `collection(NAME)` helper.
  if (
    ts.isCallExpression(expr) &&
    ts.isIdentifier(expr.expression) &&
    expr.expression.text === "collection"
  ) {
    const name = resolveString(expr.arguments[0]);
    return name ? { collection: name, scope: "COLLECTION" } : undefined;
  }

  // Typed accessor, e.g. `db.gifts`.
  if (ts.isPropertyAccessExpression(expr)) {
    const name = collectionProps.get(expr.name.text);
    return name ? { collection: name, scope: "COLLECTION" } : undefined;
  }

  // A query stored in a variable, e.g. `const q = db.gifts.where(...)`.
  if (ts.isIdentifier(expr)) {
    const decl = findDeclaration(expr);
    if (decl?.initializer) {
      return resolveChain(decl.initializer, filters, orders, depth + 1);
    }
  }

  if (ts.isParenthesizedExpression(expr) || ts.isAwaitExpression(expr)) {
    return resolveChain(expr.expression, filters, orders, depth + 1);
  }

  return undefined;
}

// A query-method call is the top of its chain when no further query method
// is called on it.
function isChainTop(call: ts.CallExpression) {
  const parent = call.parent;
  return !(
    ts.isPropertyAccessExpression(parent) &&
    parent.expression === call &&
    QUERY_METHODS.has(parent.name.text) &&
    ts.isCallExpression(parent.parent)
  );
}

// The where/orderBy calls in the chain ending at `call`.
function filterCalls(call: ts.CallExpression): Array<ts.CallExpression> {
  const calls: Array<ts.CallExpression> = [];
  let expr: ts.Expression = call;
  let method = methodName(expr);
  while (method && QUERY_METHODS.has(method)) {
    const current = expr as ts.CallExpression;
    if (method === "where" || method === "orderBy") calls.push(current);
    expr = (current.expression as ts.PropertyAccessExpression).expression;
    method = methodName(expr);
  }
  return calls;
}

// Firestore `where` calls take a field path; TanStack DB and other query
// builders pass callbacks, so skip chains that do.
function isFirestoreChain(calls: Array<ts.CallExpression>) {
  return calls.every((call) => {
    const first = call.arguments[0];
    return (
      first !== undefined &&
      !ts.isArrowFunction(first) &&
      !ts.isFunctionExpression(first)
    );
  });
}

const queries: Array<Query> = [];
for (const sf of sources) {
  walk(sf, (node) => {
    if (!ts.isCallExpression(node)) return;
    const method = methodName(node);
    if (!method || !QUERY_METHODS.has(method) || !isChainTop(node)) return;
    const calls = filterCalls(node);
    if (calls.length === 0 || !isFirestoreChain(calls)) return;

    const filters: Array<Filter> = [];
    const orders: Array<Order> = [];
    const base = resolveChain(node, filters, orders);
    if (!base) {
      warnings.push(
        `${location(node)}: could not resolve the collection for this query`,
      );
      return;
    }
    queries.push({ location: location(node), ...base, filters, orders });
  });
}

// ---------------------------------------------------------------------------
// Index requirements

// Mirrors Firestore's rules: single-field indexes cover queries on one field,
// equality-only queries are served by merging single-field indexes, and
// anything combining a range filter or orderBy with other fields needs a
// composite index.
function requirementFor(query: Query): Requirement {
  const filters = query.filters.filter((f) => f.field !== "__name__");
  const equality = new Map<string, boolean>();
  const ranges = new Set<string>();
  for (const f of filters) {
    if (EQUALITY_OPS.has(f.op))
      equality.set(f.field, equality.get(f.field) ?? false);
    else if (ARRAY_OPS.has(f.op)) equality.set(f.field, true);
    else if (INEQUALITY_OPS.has(f.op)) ranges.add(f.field);
    else warnings.push(`${query.location}: unknown operator "${f.op}"`);
  }
  // orderBy on an equality-filtered field is a no-op.
  const ordered = query.orders.filter(
    (o) => o.field !== "__name__" && !equality.has(o.field),
  );

  const allFields = new Set([
    ...equality.keys(),
    ...ranges,
    ...ordered.map((o) => o.field),
  ]);
  if (allFields.size <= 1) return { kind: "single-field" };
  if (ranges.size === 0 && ordered.length === 0) return { kind: "index-merge" };

  const orderedFields = new Set(ordered.map((o) => o.field));
  const defaultDirection = ordered.at(-1)?.direction ?? "ASCENDING";
  return {
    kind: "composite",
    equality: [...equality].map(([field, array]) => ({ field, array })),
    ordered,
    ranges: [...ranges]
      .filter((f) => !orderedFields.has(f))
      .sort()
      .map((field) => ({ field, direction: defaultDirection })),
  };
}

function satisfies(
  index: Index,
  query: Query,
  req: Extract<Requirement, { kind: "composite" }>,
) {
  if (index.collectionGroup !== query.collection) return false;
  if (index.queryScope !== query.scope) return false;

  const fields = index.fields.filter((f) => f.fieldPath !== "__name__");
  const expected = req.equality.length + req.ordered.length + req.ranges.length;
  if (fields.length !== expected) return false;

  let i = 0;
  const equalityFields = fields.slice(i, (i += req.equality.length));
  for (const eq of req.equality) {
    const match = equalityFields.find((f) => f.fieldPath === eq.field);
    if (!match) return false;
    if (eq.array !== (match.arrayConfig === "CONTAINS")) return false;
  }

  for (const order of req.ordered) {
    const f = fields[i++];
    if (f.fieldPath !== order.field || f.order !== order.direction) {
      return false;
    }
  }

  const rangeFields = fields.slice(i);
  return req.ranges.every((r) =>
    rangeFields.some((f) => f.fieldPath === r.field && f.order !== undefined),
  );
}

function indexFor(
  query: Query,
  req: Extract<Requirement, { kind: "composite" }>,
): Index {
  return {
    collectionGroup: query.collection,
    queryScope: query.scope,
    fields: [
      ...req.equality.map(
        (eq): IndexField =>
          eq.array
            ? { fieldPath: eq.field, arrayConfig: "CONTAINS" }
            : { fieldPath: eq.field, order: "ASCENDING" },
      ),
      ...req.ordered.map((o) => ({ fieldPath: o.field, order: o.direction })),
      ...req.ranges.map((r) => ({ fieldPath: r.field, order: r.direction })),
    ],
  };
}

function describe(query: Query) {
  const parts = [
    ...query.filters.map((f) => `${f.field} ${f.op}`),
    ...query.orders.map(
      (o) =>
        `orderBy ${o.field} ${o.direction === "ASCENDING" ? "asc" : "desc"}`,
    ),
  ];
  return `${query.collection} [${parts.join(", ")}]`;
}

function describeIndex(index: Index) {
  const fields = index.fields
    .map(
      (f) =>
        `${f.fieldPath} ${f.arrayConfig ?? (f.order === "DESCENDING" ? "desc" : "asc")}`,
    )
    .join(", ");
  return `${index.collectionGroup} (${fields})`;
}

// ---------------------------------------------------------------------------
// Report

const indexFile = JSON.parse(fs.readFileSync(INDEX_FILE, "utf8")) as IndexFile;
const usedIndexes = new Set<Index>();
const missing = new Map<string, { index: Index; locations: Array<string> }>();
const singleFieldErrors: Array<string> = [];

// Single-field indexes are automatic unless a fieldOverride replaces them.
// Queries that don't need a composite index rely on them, so make sure an
// override hasn't removed the one the query needs.
function disabledSingleFieldIndexes(query: Query): Array<string> {
  const needs = new Map<string, "order" | "array">();
  for (const f of query.filters) {
    if (f.field === "__name__") continue;
    needs.set(f.field, ARRAY_OPS.has(f.op) ? "array" : "order");
  }
  for (const o of query.orders) {
    if (o.field !== "__name__") needs.set(o.field, "order");
  }
  return [...needs].flatMap(([field, need]) => {
    const override = indexFile.fieldOverrides.find(
      (o) => o.collectionGroup === query.collection && o.fieldPath === field,
    );
    if (!override) return [];
    const enabled = override.indexes.some(
      (i) =>
        i.queryScope === query.scope &&
        (need === "array" ? i.arrayConfig === "CONTAINS" : i.order),
    );
    return enabled ? [] : [field];
  });
}

for (const query of queries) {
  const req = requirementFor(query);
  if (req.kind !== "composite") {
    const disabled = disabledSingleFieldIndexes(query);
    if (disabled.length > 0) {
      for (const field of disabled) {
        singleFieldErrors.push(
          `${query.location}: ${query.collection}.${field} has its single-field index disabled by a fieldOverride`,
        );
      }
      if (VERBOSE) console.log(`  MISS ${query.location}  ${describe(query)}`);
    } else if (VERBOSE) {
      console.log(`  ok   ${query.location}  ${describe(query)} (${req.kind})`);
    }
    continue;
  }
  const match = indexFile.indexes.find((index) => satisfies(index, query, req));
  if (match) {
    usedIndexes.add(match);
    if (VERBOSE) console.log(`  ok   ${query.location}  ${describe(query)}`);
    continue;
  }
  const index = indexFor(query, req);
  const key = JSON.stringify(index);
  const entry = missing.get(key) ?? { index, locations: [] };
  entry.locations.push(query.location);
  missing.set(key, entry);
  if (VERBOSE) console.log(`  MISS ${query.location}  ${describe(query)}`);
}

console.log(
  `Scanned ${files.length} files, found ${queries.length} Firestore queries.`,
);

for (const warning of warnings) console.warn(`warning: ${warning}`);

const unused = indexFile.indexes.filter((index) => !usedIndexes.has(index));
for (const index of unused) {
  console.warn(`warning: index not used by any query: ${describeIndex(index)}`);
}

for (const error of singleFieldErrors) console.error(`error: ${error}`);
if (singleFieldErrors.length > 0) {
  console.error(
    "\nFix the fieldOverrides above in firestore.indexes.json (--write does not change them).",
  );
  process.exit(1);
}

if (missing.size === 0) {
  console.log("All queries are covered by firestore.indexes.json.");
  process.exit(0);
}

console.error(`\nMissing ${missing.size} composite index(es):`);
for (const { index, locations } of missing.values()) {
  console.error(`\n  ${describeIndex(index)}`);
  for (const loc of locations) console.error(`    used at ${loc}`);
}

if (WRITE) {
  indexFile.indexes.push(...[...missing.values()].map((m) => m.index));
  fs.writeFileSync(INDEX_FILE, `${JSON.stringify(indexFile, null, 2)}\n`);
  console.log(`\nAdded ${missing.size} index(es) to firestore.indexes.json.`);
  process.exit(0);
}

console.error("\nRun `pnpm lint:indexes --write` to add them.");
process.exit(1);
