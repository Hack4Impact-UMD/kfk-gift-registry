import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { userProfileQueries } from "./userProfileQueries";

export const queries = mergeQueryKeys(userProfileQueries)
