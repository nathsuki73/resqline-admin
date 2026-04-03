import { fetchReportById } from "@/app/features/reports/services/reportsApi";
import {
  getReportCategoryInput,
  mapCategoryCodeToDepartment,
  mapCategoryCodeToType,
} from "@/app/constants/reportCategories";
import {
  mapApiStatusToSlug,
  mapResponderStatusToMobileStatus,
  type IncidentStatusSlug,
} from "@/app/constants/reportStatus";
import { type BridgeIncident } from "./incidentBridge";

const severityFromStatus = (
  status: IncidentStatusSlug,
): BridgeIncident["severity"] => {
  if (status === "resolved") return "Medium";
  if (status === "submitted") return "Critical";
  return "High";
};

const formatLocation = (report: Record<string, unknown>) => {
  const reportedAt =
    report.reportedAt && typeof report.reportedAt === "object"
      ? (report.reportedAt as Record<string, unknown>)
      : null;
  const location =
    report.location && typeof report.location === "object"
      ? (report.location as Record<string, unknown>)
      : null;

  const reverseGeoCode = reportedAt?.reverseGeoCode ?? location?.reverseGeoCode;
  if (typeof reverseGeoCode === "string" && reverseGeoCode.trim().length > 0) {
    return reverseGeoCode;
  }

  const latitude = reportedAt?.latitude ?? location?.latitude;
  const longitude = reportedAt?.longitude ?? location?.longitude;

  if (typeof latitude === "number" && typeof longitude === "number") {
    return `Lat ${latitude}, Lon ${longitude}`;
  }

  return "Unknown Location";
};

export const mapApiReportToBridgeIncident = (
  report: Record<string, unknown>,
): BridgeIncident => {
  const rawDate =
    report.createdAt || report.dateCreated || new Date().toISOString();
  const status = mapApiStatusToSlug(report.status);
  const categoryInput = getReportCategoryInput(report);
  const incidentCategory = mapCategoryCodeToType(categoryInput);
  const reportedBy =
    report.reportedBy && typeof report.reportedBy === "object"
      ? (report.reportedBy as Record<string, unknown>)
      : null;

  return {
    id: String(report.id ?? report._id ?? ""),
    incidentType: String(report.description || "General Incident"),
    location: formatLocation(report),
    latitude: (() => {
      const reportedAt =
        report.reportedAt && typeof report.reportedAt === "object"
          ? (report.reportedAt as Record<string, unknown>)
          : null;
      const location =
        report.location && typeof report.location === "object"
          ? (report.location as Record<string, unknown>)
          : null;
      const latitude = reportedAt?.latitude ?? location?.latitude;
      return typeof latitude === "number" ? latitude : undefined;
    })(),
    longitude: (() => {
      const reportedAt =
        report.reportedAt && typeof report.reportedAt === "object"
          ? (report.reportedAt as Record<string, unknown>)
          : null;
      const location =
        report.location && typeof report.location === "object"
          ? (report.location as Record<string, unknown>)
          : null;
      const longitude = reportedAt?.longitude ?? location?.longitude;
      return typeof longitude === "number" ? longitude : undefined;
    })(),
    reporter: String(report.reportByName || reportedBy?.name || "Unknown"),
    reporterContact: String(
      report.reportByPhoneNumber ||
        reportedBy?.phoneNumber ||
        "No contact provided",
    ),
    department: mapCategoryCodeToDepartment(
      categoryInput,
    ) as BridgeIncident["department"],
    severity: severityFromStatus(status),
    status,
    mobileStatus: mapResponderStatusToMobileStatus(status),
    time: new Date(String(rawDate)).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    reporterDescription: String(report.description || ""),
    internalNote: String(report.internalNote || ""),
    images: Array.isArray(report.images)
      ? (report.images as string[])
      : Array.isArray(report.image)
        ? (report.image as string[])
        : [],
    type: incidentCategory,
    aiAnalysis:
      (report.aiProbabilities as BridgeIncident["aiAnalysis"]) ?? undefined,
  };
};

export const fetchBridgeIncidentById = async (
  reportId: string,
): Promise<BridgeIncident | null> => {
  if (!reportId) return null;

  const fullReport = await fetchReportById(reportId);
  if (!fullReport || typeof fullReport !== "object") return null;

  return mapApiReportToBridgeIncident(fullReport as Record<string, unknown>);
};
