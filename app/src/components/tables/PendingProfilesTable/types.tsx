export type ApplicationStatus = "pending" | "approved" | "holdfile";

export type PendingProfileTableRow = {
  id: string;
  parentGuardian: string;
  numberOfChildren: number;
  publishedChildren: number;
  status: ApplicationStatus;
  submissionDate: string;
  adminComments: string;
};
