import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { userProfileQueries } from "./userProfileQueries";
import { familyLinkQueries } from "./familyLink";
import { childQueries } from "./child";

export const queries = mergeQueryKeys(userProfileQueries, familyLinkQueries, childQueries);
