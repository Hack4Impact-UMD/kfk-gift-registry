export type AdminDashboardGiftBreakdown = {
  unpurchased: number;
  purchasedByDonors: number;
  purchasedByAdmins: number;
};

export type AdminDashboardGiftStatusBreakdown = {
  unclaimed: number;
  unordered: number;
  inTransit: number;
  delivered: number;
  received: number;
};

export type AdminDashboardFamilyProfileBreakdown = {
  approved: number;
  pending: number;
  holdfile: number;
};

export type AdminDashboardMetrics = {
  driveId: string;
  lastUpdatedAt: string;
  gifts: {
    total: number;
    breakdown: AdminDashboardGiftBreakdown;
    statusBreakdown: AdminDashboardGiftStatusBreakdown;
  };
  familyProfiles: {
    total: number;
    breakdown: AdminDashboardFamilyProfileBreakdown;
  };
  approvedChildProfiles: {
    total: number;
    published: number;
    unpublished: number;
    publishedPercentage: number;
  };
  donationAmount: number;
  peopleDonated: number;
};
