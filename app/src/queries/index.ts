import { mergeQueryKeys } from "@lukemorales/query-key-factory";
import { userProfileQueries } from "./userProfileQueries";
import { familyLinkQueries } from "./familyLink";
import { childQueries } from "./child";
import { familyQueries } from "./family";
import { giftDriveQueries } from "./giftDrive";
import { storefrontQueries } from "./storefront";
import { sessionQueries } from "./session";
import { giftQueries } from "./gift";
import { donorQueries } from "./donor";
import { claimQueries } from "./claim";
import { notificationQueries } from "./notifications";

export const queries = mergeQueryKeys(
  userProfileQueries,
  familyLinkQueries,
  childQueries,
  familyQueries,
  giftDriveQueries,
  storefrontQueries,
  sessionQueries,
  giftQueries,
  donorQueries,
  claimQueries,
  notificationQueries,
);
