import type { Application, ApplicationStatus } from "@/types/application";

export const APPLICATION_STATUS_ORDER: ApplicationStatus[] = [
  "Saved",
  "Applied",
  "OA",
  "Interview",
  "Final Interview",
  "Offer",
  "Rejected",
];

export function formatApplicationDate(dateString?: string) {
  if (!dateString) return "No date";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getDaysAgo(dateString?: string) {
  if (!dateString) return null;

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function getApplicationActivityTime(application: Application) {
  return (
    application.updatedAt ||
    application.createdAt ||
    application.dateApplied ||
    "1970-01-01"
  );
}

export function getApplicationActivityLabel(status: ApplicationStatus) {
  switch (status) {
    case "Saved":
      return "Saved role";
    case "Applied":
      return "Application submitted";
    case "OA":
      return "Online assessment started";
    case "Interview":
      return "Interview stage reached";
    case "Final Interview":
      return "Final interview stage reached";
    case "Offer":
      return "Offer received";
    case "Rejected":
      return "Application closed";
    default:
      return "Application updated";
  }
}

export function getApplicationActivityDescription(application: Application) {
  switch (application.status) {
    case "Saved":
      return "Role saved to your tracker for later.";
    case "Applied":
      return "Application submitted and now in your pipeline.";
    case "OA":
      return "This role has moved to the online assessment stage.";
    case "Interview":
      return "This application is currently in the interview stage.";
    case "Final Interview":
      return "This application has advanced to the final interview stage.";
    case "Offer":
      return "You received an offer for this role.";
    case "Rejected":
      return "This application process has been closed.";
    default:
      return "Application activity updated.";
  }
}

export function sortByActivityDate(applications: Application[]) {
  return [...applications].sort(
    (a, b) =>
      new Date(getApplicationActivityTime(b)).getTime() -
      new Date(getApplicationActivityTime(a)).getTime()
  );
}

export function sortByAppliedDate(applications: Application[]) {
  return [...applications].sort((a, b) => {
    const aTime = new Date(a.dateApplied || "1970-01-01").getTime();
    const bTime = new Date(b.dateApplied || "1970-01-01").getTime();
    return bTime - aTime;
  });
}

export function getApplicationMetrics(applications: Application[]) {
  const statusCounts = {
    Saved: applications.filter((a) => a.status === "Saved").length,
    Applied: applications.filter((a) => a.status === "Applied").length,
    OA: applications.filter((a) => a.status === "OA").length,
    Interview: applications.filter((a) => a.status === "Interview").length,
    FinalInterview: applications.filter(
      (a) => a.status === "Final Interview"
    ).length,
    Offer: applications.filter((a) => a.status === "Offer").length,
    Rejected: applications.filter((a) => a.status === "Rejected").length,
  };

  const totalApplications = applications.length;

  const applicationsExcludingSaved = applications.filter(
    (a) => a.status !== "Saved"
  );
  const actionableCount = applicationsExcludingSaved.length;

  const appliedCount = statusCounts.Applied;
  const oaCount = statusCounts.OA;
  const interviewOnlyCount = statusCounts.Interview;
  const finalInterviewCount = statusCounts.FinalInterview;
  const interviewCount = interviewOnlyCount + finalInterviewCount;
  const offerCount = statusCounts.Offer;
  const rejectedCount = statusCounts.Rejected;

  const progressedToInterviewOrBeyondCount =
    statusCounts.Interview + statusCounts.FinalInterview + statusCounts.Offer;

  const activePipelineCount = applications.filter(
    (a) => a.status !== "Saved" && a.status !== "Rejected" && a.status !== "Offer"
  ).length;

  const interviewRate =
    actionableCount > 0
      ? Math.round(
          (progressedToInterviewOrBeyondCount / actionableCount) * 100
        )
      : 0;

  const offerRate =
    actionableCount > 0
      ? Math.round((offerCount / actionableCount) * 100)
      : 0;

  const sortedByActivity = sortByActivityDate(applications);
  const sortedByApplied = sortByAppliedDate(applicationsExcludingSaved);

  const latestAppliedByDate = sortedByApplied[0] || null;
  const latestInterview = sortedByActivity.find(
    (a) => a.status === "Interview" || a.status === "Final Interview"
  ) || null;
  const latestOffer =
    sortedByActivity.find((a) => a.status === "Offer") || null;
  const latestRejected =
    sortedByActivity.find((a) => a.status === "Rejected") || null;

  return {
    totalApplications,
    actionableCount,
    activePipelineCount,
    appliedCount,
    oaCount,
    interviewOnlyCount,
    finalInterviewCount,
    interviewCount,
    offerCount,
    rejectedCount,
    statusCounts,
    interviewRate,
    offerRate,
    sortedByActivity,
    sortedByApplied,
    latestAppliedByDate,
    latestInterview,
    latestOffer,
    latestRejected,
  };
}