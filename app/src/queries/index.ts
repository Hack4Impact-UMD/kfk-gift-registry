import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { userProfileQueries } from "./userProfileQueries";
import { familyLinkQueries } from "./familyLink";

export const queries = mergeQueryKeys(userProfileQueries, familyLinkQueries);
