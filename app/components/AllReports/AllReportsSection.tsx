"use client";

import { useEffect, useMemo, useState } from "react";
import {
	AlertTriangle,
	ChevronDown,
	FileText,
	Search,
} from "lucide-react";

import useModalDissolve from "../settings/ui/useModalDissolve";
import DispatchUnitModal, {
	DEFAULT_AVAILABLE_UNITS,
	DEFAULT_DEPLOYED_UNITS,
} from "../Dashboard/DispatchUnitModal";
import {
	INCIDENT_NOTE_UPDATED_EVENT,
	getIncidentNoteForId,
	queueIncidentAction,
	setIncidentNoteForId,
	setActiveIncident,
	type BridgeActionType,
	type BridgeIncident,
	type BridgeNoteUpdate,
} from "../Dashboard/incidentBridge";
import { useReports } from "@/app/hooks/useReports";
import { fetchReportById } from "@/app/features/reports/services/reportsApi";
import { normalizeReportId } from "@/app/features/reports/services/reportSync";
import {
	mapApiStatusToLabel,
	mapApiStatusToSlug,
	mapSlugToApiStatus,
	mapMobileStatusToLabel,
	mapResponderStatusToMobileStatus,
	statusStep,
	type IncidentStatusSlug,
} from "@/app/constants/reportStatus";
import { mapCategoryCodeToType } from "@/app/constants/reportCategories";
import { transitionReportStatus } from "@/app/features/reports/services/reportTransitionService";
import { formatDateForFilename, getTimeValue } from "@/app/lib/formattingUtils";
import {
	getIncidentDepartmentClasses,
	getIncidentStatusClasses,
} from "@/app/lib/uiClassUtils";
import {
	type IncidentDepartment,
	type IncidentSeverity,
	type IncidentStatus,
} from "@/app/features/reports/types";
import AllReportsSidebar from "./AllReportsSidebar";
import AllReportsTable from "./AllReportsTable";

const MODAL_EXIT_MS = 260;

type IncidentReport = {
	id: string;
	incidentType: string;
	location: string;
	reporter: string;
	reporterContact: string;
	department: IncidentDepartment;
	severity: IncidentSeverity;
	status: IncidentStatus;
	mobileStatus: string;
	time: string;
	dateISO: string;
	reporterDescription: string;
	internalNote: string;
};

type SortKey = "id" | "incidentType" | "location" | "reporter" | "department" | "status" | "time";
type SortDirection = "asc" | "desc";

type SortState = {
	key: SortKey;
	direction: SortDirection;
};

const REPORTS_PER_PAGE = 8;

const severityRank: Record<IncidentSeverity, number> = {
	critical: 4,
	high: 3,
	medium: 2,
	low: 1,
};

const statusRank: Record<IncidentStatus, number> = {
	"under-review": statusStep("under-review"),
	"in-progress": statusStep("in-progress"),
	submitted: statusStep("submitted"),
	resolved: statusStep("resolved"),
	rejected: statusStep("rejected"),
};

const severityLabel: Record<IncidentSeverity, string> = {
	critical: "Critical",
	high: "High",
	medium: "Medium",
	low: "Low",
};

const departmentLabel: Record<IncidentDepartment, string> = {
	bfp: "BFP",
	ctmo: "CTMO",
	pdrmo: "PDRRMO",
	pnp: "PNP",
};

const toText = (value: unknown) => {
	if (value === null || value === undefined) return "";
	if (typeof value === "object") return JSON.stringify(value);
	return String(value);
};

// Future feature note:
// Generate report (PDF/Excel scope-based modal) is intentionally deferred for v2.0.

const RejectConfirmModal = ({
	isOpen,
	onCancel,
	onConfirm,
	reportTitle,
}: {
	isOpen: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	reportTitle: string;
}) => {
	const { shouldRender, isVisible } = useModalDissolve(isOpen, MODAL_EXIT_MS);

	if (!shouldRender) return null;

	return (
		<div
			className={`modal-overlay-dissolve fixed inset-0 z-(--z-modal) flex items-center justify-center bg-black/50 p-4 ${
				isVisible ? "is-open" : "is-closed"
			}`}
		>
			<div
				className={`modal-card-dissolve w-full max-w-sm rounded-2xl border border-(--color-border-1) bg-(--color-surface-1) p-5 shadow-xl ${
					isVisible ? "is-open" : "is-closed"
				}`}
			>
				<div className="mb-3 flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-(--color-red-border) bg-(--color-red-glow) text-(--color-text-red)">
						<AlertTriangle size={16} />
					</div>
					<h3 className="text-lg font-bold text-(--color-text-1)">Reject Incident</h3>
				</div>
				<p className="text-sm text-(--color-text-2)">
					Are you sure you want to reject this report?
				</p>
				<p className="mt-1 text-xs text-(--color-text-3)">{reportTitle}</p>

				<div className="mt-5 flex justify-end gap-2">
					<button type="button" onClick={onCancel} className="ui-btn ui-btn-secondary">
						Cancel
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="ui-btn border border-(--color-red-border) bg-(--color-red-glow) text-(--color-text-red) hover:bg-[rgba(229,57,53,0.2)]"
					>
						Reject
					</button>
				</div>
			</div>
		</div>
	);
};

const mapApiStatusToIncidentStatus = (status: unknown): IncidentStatus =>
	mapApiStatusToSlug(status);

const mapIncidentStatusToApiStatus = (status: IncidentStatus): number =>
	mapSlugToApiStatus(status);

const mapCategoryToDepartment = (category: unknown): IncidentDepartment => {
	if (category === 3) return "bfp";
	if (category === 2) return "ctmo";
	if (category === 5) return "pdrmo";
	return "pdrmo";
};

const mapApiReportToIncidentReport = (report: any): IncidentReport => {
	const rawDate = report.createdAt || report.dateCreated || new Date().toISOString();
	const lat = report.reportedAt?.latitude || report.location?.latitude;
	const lon = report.reportedAt?.longitude || report.location?.longitude;
	const geoCode = report.reportedAt?.reverseGeoCode || report.location?.reverseGeoCode;
	const location = geoCode ?? (lat && lon ? `Lat ${lat}, Lon ${lon}` : "Unknown Location");

	const status = mapApiStatusToIncidentStatus(report.status);
	const severity: IncidentSeverity = status === "resolved" ? "medium" : status === "submitted" ? "critical" : "high";

	return {
		id: String(report.id ?? ""),
		incidentType: report.description || "General Incident",
		location,
		reporter: report.reportByName || report.reportedBy?.name || "Unknown",
		reporterContact: report.reportByPhoneNumber || report.reportedBy?.phoneNumber || "No contact provided",
		department: mapCategoryToDepartment(report.category),
		severity,
		status,
		mobileStatus: mapResponderStatusToMobileStatus(status),
		time: new Date(rawDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
		dateISO: rawDate,
		reporterDescription: report.description || "",
		internalNote: report.internalNote || "",
	};
};

export default function AllReportsSection({ onOpenDashboard }: { onOpenDashboard?: () => void }) {
	const { reports: apiReports, loading: reportsLoading, mutate } = useReports();
	const [reports, setReports] = useState<IncidentReport[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<"all" | "archived" | IncidentStatus>("all");
	const [departmentFilter, setDepartmentFilter] = useState<"all" | IncidentDepartment>("all");
	const [sortState, setSortState] = useState<SortState>({ key: "time", direction: "desc" });
	const [currentPage, setCurrentPage] = useState(1);
	const [activeReportId, setActiveReportId] = useState<string | null>(null);
	const [draftNotesByReportId, setDraftNotesByReportId] = useState<Record<string, string>>({});
	const [noteSaveStateByReportId, setNoteSaveStateByReportId] = useState<Record<string, "unsaved" | "saving" | "saved">>({});
	const [showRejectConfirm, setShowRejectConfirm] = useState(false);
	const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
	const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

	useEffect(() => {
		const mapped = Array.isArray(apiReports) ? apiReports.map(mapApiReportToIncidentReport) : [];

		setReports(
			mapped.map((report) => {
				const syncedNote = getIncidentNoteForId(report.id);
				return syncedNote === null ? report : { ...report, internalNote: syncedNote };
			})
		);
	}, [apiReports]);

	const reportInFocus = useMemo(
		() => reports.find((report) => report.id === activeReportId) ?? null,
		[reports, activeReportId]
	);

	useEffect(() => {
		if (!activeReportId || !reportInFocus) return;

		setDraftNotesByReportId((prev) => {
			if (Object.prototype.hasOwnProperty.call(prev, activeReportId)) return prev;
			return { ...prev, [activeReportId]: reportInFocus.internalNote };
		});

		setNoteSaveStateByReportId((prev) => ({
			...prev,
			[activeReportId]: prev[activeReportId] ?? "saved",
		}));
	}, [activeReportId, reportInFocus]);

	useEffect(() => {
		const onIncidentNoteUpdated = (event: Event) => {
			const detail = (event as CustomEvent<BridgeNoteUpdate>).detail;
			if (!detail) return;

			setReports((prev) =>
				prev.map((report) => (report.id === detail.id ? { ...report, internalNote: detail.note } : report))
			);

			setDraftNotesByReportId((prev) => {
				if (!Object.prototype.hasOwnProperty.call(prev, detail.id)) return prev;
				return { ...prev, [detail.id]: detail.note };
			});

			setNoteSaveStateByReportId((prev) => ({ ...prev, [detail.id]: "saved" }));
		};

		window.addEventListener(INCIDENT_NOTE_UPDATED_EVENT, onIncidentNoteUpdated as EventListener);

		return () => {
			window.removeEventListener(INCIDENT_NOTE_UPDATED_EVENT, onIncidentNoteUpdated as EventListener);
		};
	}, []);

	// Keep filtering memoized so table re-renders only when relevant inputs change.
	const filteredReports = useMemo(() => {
		const normalizedSearch = searchQuery.trim().toLowerCase();

		return reports.filter((report) => {
			const matchesSearch =
				normalizedSearch.length === 0 ||
				report.id.toLowerCase().includes(normalizedSearch) ||
				report.reporter.toLowerCase().includes(normalizedSearch) ||
				report.location.toLowerCase().includes(normalizedSearch) ||
				report.incidentType.toLowerCase().includes(normalizedSearch);

			const matchesStatus =
				statusFilter === "all"
					? report.status !== "resolved"
					: statusFilter === "archived"
						? report.status === "resolved"
						: report.status === statusFilter;
			const matchesDepartment = departmentFilter === "all" || report.department === departmentFilter;

			return matchesSearch && matchesStatus && matchesDepartment;
		});
	}, [reports, searchQuery, statusFilter, departmentFilter]);

	const sortedReports = useMemo(() => {
		const next = [...filteredReports];

		next.sort((a, b) => {
			let comparison = 0;

			if (sortState.key === "id") comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
			if (sortState.key === "incidentType") comparison = a.incidentType.localeCompare(b.incidentType);
			if (sortState.key === "location") comparison = a.location.localeCompare(b.location);
			if (sortState.key === "reporter") comparison = a.reporter.localeCompare(b.reporter);
			if (sortState.key === "department") comparison = departmentLabel[a.department].localeCompare(departmentLabel[b.department]);
			if (sortState.key === "status") comparison = statusRank[a.status] - statusRank[b.status];
			if (sortState.key === "time") comparison = getTimeValue(a.dateISO) - getTimeValue(b.dateISO);

			return sortState.direction === "asc" ? comparison : -comparison;
		});

		return next;
	}, [filteredReports, sortState]);

	const totalPages = Math.max(1, Math.ceil(sortedReports.length / REPORTS_PER_PAGE));
	const safePage = Math.min(currentPage, totalPages);
	const paginatedReports = useMemo(() => {
		const start = (safePage - 1) * REPORTS_PER_PAGE;
		return sortedReports.slice(start, start + REPORTS_PER_PAGE);
	}, [safePage, sortedReports]);

	const setSort = (key: SortKey) => {
		setSortState((prev) => {
			if (prev.key !== key) return { key, direction: "desc" };
			return { key, direction: prev.direction === "desc" ? "asc" : "desc" };
		});
	};

	const clearFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
		setDepartmentFilter("all");
		setCurrentPage(1);
	};

	// Export merges UI rows with raw API payload so operations get complete incident metadata.
	const exportCsv = () => {
		const rawById = new Map<string, any>(
			(Array.isArray(apiReports) ? apiReports : []).map((report: any) => [
				normalizeReportId(String(report?.id ?? "")),
				report,
			])
		);

		const header = [
			"Report ID",
			"Incident Type",
			"Category Code",
			"Category Type",
			"Department",
			"Status Code",
			"Status Label",
			"Reporter Mobile Status",
			"Reporter Name",
			"Reporter Phone",
			"Created At (ISO)",
			"Created At (Local)",
			"Time (Display)",
			"Latitude",
			"Longitude",
			"Reverse GeoCode",
			"Location (Display)",
			"Description",
			"Internal Note",
			"AI Probabilities",
			"Image Count",
		];

		const rows = sortedReports.map((report) => {
			const raw = rawById.get(normalizeReportId(report.id));
			const rawDate = raw?.createdAt ?? raw?.dateCreated ?? report.dateISO;
			const latitude = raw?.reportedAt?.latitude ?? raw?.location?.latitude;
			const longitude = raw?.reportedAt?.longitude ?? raw?.location?.longitude;
			const reverseGeoCode = raw?.reportedAt?.reverseGeoCode ?? raw?.location?.reverseGeoCode;
			const categoryCode = raw?.category;
			const imageCount = Array.isArray(raw?.images)
				? raw.images.length
				: Array.isArray(raw?.image)
					? raw.image.length
					: 0;

			return [
				report.id,
				report.incidentType,
				toText(categoryCode),
				mapCategoryCodeToType(categoryCode),
				departmentLabel[report.department],
				toText(raw?.status ?? mapIncidentStatusToApiStatus(report.status)),
				mapApiStatusToLabel(raw?.status ?? report.status),
				mapMobileStatusToLabel(raw?.status ?? report.status),
				report.reporter,
				report.reporterContact,
				toText(rawDate),
				rawDate ? new Date(rawDate).toLocaleString() : "",
				report.time,
				toText(latitude),
				toText(longitude),
				toText(reverseGeoCode),
				report.location,
				toText(raw?.description ?? report.reporterDescription),
				report.internalNote,
				toText(raw?.aiProbabilities),
				toText(imageCount),
			];
		});

		const csv = [header, ...rows]
			.map((row) => row.map((cell) => `"${toText(cell).replaceAll('"', '""')}"`).join(","))
			.join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `resqline-reports-${formatDateForFilename()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const openReportDetails = async (reportId: string) => {
		setActiveReportId(reportId);
		setNoteSaveStateByReportId((prev) => ({ ...prev, [reportId]: prev[reportId] ?? "saved" }));

		try {
			const fullData = await fetchReportById(reportId);
			const fullReport = mapApiReportToIncidentReport(fullData);
			setReports((prev) => prev.map((report) => (report.id === reportId ? { ...report, ...fullReport } : report)));
		} catch (error) {
			console.error("Failed to fetch report details:", error);
		}
	};

	const closeReportDetails = () => {
		setActiveReportId(null);
	};

	const updateFocusedReportStatus = async (nextStatus: IncidentStatus) => {
		if (!activeReportId) return;

		setIsUpdatingStatus(true);
		setReports((prev) =>
			prev.map((report) =>
				report.id === activeReportId
					? {
						...report,
						status: nextStatus,
						mobileStatus: mapResponderStatusToMobileStatus(nextStatus),
					}
					: report,
			)
		);

		try {
			const result = await transitionReportStatus({
				reportId: activeReportId,
				nextStatus,
				origin: "all-reports",
			});
			setReports((prev) =>
				prev.map((report) =>
					report.id === activeReportId
						? { ...report, status: result.status, mobileStatus: result.mobileStatus }
						: report,
				),
			);
			await mutate();
		} catch (error) {
			console.error("Failed to update report status:", error);
		} finally {
			setIsUpdatingStatus(false);
		}
	};

	const updateFocusedReportInternalNoteDraft = (nextNote: string) => {
		if (!activeReportId) return;

		setDraftNotesByReportId((prev) => ({ ...prev, [activeReportId]: nextNote }));
		setNoteSaveStateByReportId((prev) => ({ ...prev, [activeReportId]: "unsaved" }));
	};

	const saveFocusedReportInternalNote = () => {
		if (!activeReportId) return;

		const draft = draftNotesByReportId[activeReportId] ?? reportInFocus?.internalNote ?? "";
		setNoteSaveStateByReportId((prev) => ({ ...prev, [activeReportId]: "saving" }));

		setReports((prev) =>
			prev.map((report) => (report.id === activeReportId ? { ...report, internalNote: draft } : report))
		);

		setIncidentNoteForId(activeReportId, draft);

		setNoteSaveStateByReportId((prev) => ({ ...prev, [activeReportId]: "saved" }));
	};

	const syncActiveIncidentToDashboard = (report: IncidentReport) => {
		const incident: BridgeIncident = {
			id: report.id,
			incidentType: report.incidentType,
			location: report.location,
			reporter: report.reporter,
			reporterContact: report.reporterContact,
			department: departmentLabel[report.department] as BridgeIncident["department"],
			severity: severityLabel[report.severity] as BridgeIncident["severity"],
			status: report.status,
			mobileStatus: report.mobileStatus,
			time: report.time,
			reporterDescription: report.reporterDescription,
			internalNote: report.internalNote,
		};

		setActiveIncident(incident);
	};

	const triggerDashboardAction = async (action: BridgeActionType) => {
		if (!reportInFocus) return;

		if (action === "reject") {
			setIsUpdatingStatus(true);
			try {
				const result = await transitionReportStatus({
					reportId: reportInFocus.id,
					nextStatus: "rejected",
					origin: "all-reports",
				});
				setReports((prev) =>
					prev.map((report) =>
						report.id === reportInFocus.id
							? { ...report, status: result.status, mobileStatus: result.mobileStatus }
							: report,
					),
				);
				await mutate();
			} catch (error) {
				console.error("Failed to reject report:", error);
			} finally {
				setIsUpdatingStatus(false);
			}
		}

		syncActiveIncidentToDashboard(reportInFocus);
		queueIncidentAction(action);
		onOpenDashboard?.();
	};

	const openDispatchModal = () => {
		if (!reportInFocus) return;
		if (activeReportId && noteSaveStateByReportId[activeReportId] === "unsaved") {
			saveFocusedReportInternalNote();
		}
		syncActiveIncidentToDashboard(reportInFocus);
		setIsDispatchModalOpen(true);
	};

	const handleDispatchFromAllReports = async (selectedUnitIds: string[], note: string) => {
		if (!reportInFocus) return;
		setIsUpdatingStatus(true);
		setReports((prev) =>
			prev.map((report) =>
				report.id === reportInFocus.id
					? {
						...report,
						status: "in-progress",
						mobileStatus: mapResponderStatusToMobileStatus("in-progress"),
						internalNote: note.trim().length > 0 ? note.trim() : report.internalNote,
					}
					: report
			)
		);

		try {
			const result = await transitionReportStatus({
				reportId: reportInFocus.id,
				nextStatus: "in-progress",
				origin: "all-reports",
			});
			setReports((prev) =>
				prev.map((report) =>
					report.id === reportInFocus.id
						? { ...report, status: result.status, mobileStatus: result.mobileStatus }
						: report,
				),
			);
			await mutate();
		} catch (error) {
			console.error("Failed to dispatch report:", error);
		} finally {
			setIsUpdatingStatus(false);
		}

		queueIncidentAction("dispatch");
		setIsDispatchModalOpen(false);
		if (activeReportId) {
			setDraftNotesByReportId((prev) => ({
				...prev,
				[activeReportId]: note.trim().length > 0 ? note.trim() : prev[activeReportId] ?? "",
			}));
			setNoteSaveStateByReportId((prev) => ({ ...prev, [activeReportId]: "saved" }));
		}
		if (selectedUnitIds.length > 0) {
			syncActiveIncidentToDashboard({
				...reportInFocus,
				status: "in-progress",
				internalNote: note.trim().length > 0 ? note.trim() : reportInFocus.internalNote,
			});
		}
	};

	const handleResolveFromAllReports = async () => {
		if (!reportInFocus) return;

		setIsUpdatingStatus(true);
		setReports((prev) =>
			prev.map((report) =>
				report.id === reportInFocus.id
					? {
						...report,
						status: "resolved",
						mobileStatus: mapResponderStatusToMobileStatus("resolved"),
					}
					: report,
			),
		);

		try {
			const result = await transitionReportStatus({
				reportId: reportInFocus.id,
				nextStatus: "resolved",
				origin: "all-reports",
			});
			setReports((prev) =>
				prev.map((report) =>
					report.id === reportInFocus.id
						? { ...report, status: result.status, mobileStatus: result.mobileStatus }
						: report,
				),
			);
			await mutate();
		} catch (error) {
			console.error("Failed to resolve report:", error);
		} finally {
			setIsUpdatingStatus(false);
		}

		syncActiveIncidentToDashboard({
			...reportInFocus,
			status: "resolved",
		});
	};

	const openFullViewInDashboard = () => {
		if (!reportInFocus) return;
		if (activeReportId && noteSaveStateByReportId[activeReportId] === "unsaved") {
			saveFocusedReportInternalNote();
		}
		syncActiveIncidentToDashboard(reportInFocus);
		onOpenDashboard?.();
	};

	const focusedDraftNote = activeReportId
		? draftNotesByReportId[activeReportId] ?? reportInFocus?.internalNote ?? ""
		: "";

	const focusedNoteSaveState = activeReportId ? noteSaveStateByReportId[activeReportId] ?? "saved" : "saved";

	return (
		<>
			<main className="flex h-screen flex-1 flex-col bg-(--color-bg) p-4">
				<section className="flex min-h-0 flex-1 flex-col rounded-xl border border-(--color-border-1) bg-(--color-surface-1)">
					<header className="flex flex-wrap items-start justify-between gap-3 border-b border-(--color-border-1) px-4 py-3">
						<div>
							<h1 className="text-3xl font-bold leading-tight text-(--color-text-1) md:text-4xl">All Reports</h1>
							<p className="mt-1 text-[13px] text-(--color-text-3)">Complete incident logs: sortable, filterable</p>
						</div>

					<button type="button" onClick={exportCsv} className="ui-btn ui-btn-primary">
						<FileText size={14} />
						Export CSV
					</button>
					</header>

					<div className="flex flex-wrap items-center gap-2 border-b border-(--color-border-1) px-3 py-2">
						<label className="relative min-w-60 flex-1">
							<Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-4)" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => {
									setSearchQuery(e.target.value);
									setCurrentPage(1);
								}}
								placeholder="Search reporter name, report ID, location..."
								className="h-9 w-full rounded-lg border border-(--color-border-2) bg-(--color-surface-2) pl-9 pr-3 text-sm text-(--color-text-1) placeholder-(--color-text-4) focus:border-(--color-orange-border) focus:outline-none focus:ring-2 focus:ring-(--color-orange-glow)"
							/>
						</label>

						<div className="relative">
							<select
								value={statusFilter}
								onChange={(e) => {
									setStatusFilter(e.target.value as typeof statusFilter);
									setCurrentPage(1);
								}}
								className="h-9 min-w-32.5 appearance-none rounded-lg border border-(--color-border-2) bg-(--color-surface-2) px-3 pr-7 text-sm text-(--color-text-2) focus:border-(--color-orange-border) focus:outline-none"
							>
								<option value="all">All Status</option>
								<option value="archived">Archived</option>
								<option value="submitted">Submitted</option>
								<option value="under-review">Under Review</option>
								<option value="in-progress">Dispatched</option>
								<option value="rejected">Rejected</option>
							</select>
							<ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-4)" />
						</div>

						<div className="relative">
							<select
								value={departmentFilter}
								onChange={(e) => {
									setDepartmentFilter(e.target.value as typeof departmentFilter);
									setCurrentPage(1);
								}}
								className="h-9 min-w-37.5 appearance-none rounded-lg border border-(--color-border-2) bg-(--color-surface-2) px-3 pr-7 text-sm text-(--color-text-2) focus:border-(--color-orange-border) focus:outline-none"
							>
								<option value="all">All Departments</option>
								<option value="bfp">BFP</option>
								<option value="ctmo">CTMO</option>
								<option value="pdrmo">PDRRMO</option>
								<option value="pnp">PNP</option>
							</select>
							<ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-4)" />
						</div>

						<button type="button" onClick={clearFilters} className="ui-btn ui-btn-secondary ml-auto">
							Clear
						</button>
					</div>

					<div className="flex items-center justify-end border-b border-(--color-border-1) px-3 py-2 text-xs text-(--color-text-3)">
						{reportsLoading ? "Loading reports..." : `Showing ${paginatedReports.length} of ${sortedReports.length} reports`}
					</div>

					<div className="flex min-h-0 flex-1 overflow-hidden">
						<div className="min-h-0 min-w-0 flex-1 overflow-auto">
							<AllReportsTable
								paginatedReports={paginatedReports}
								sortedReportsCount={sortedReports.length}
								safePage={safePage}
								totalPages={totalPages}
								sortState={sortState}
								onSort={setSort}
								onOpenReportDetails={openReportDetails}
								onPrevPage={() => setCurrentPage((p) => Math.max(1, p - 1))}
								onNextPage={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
								getDepartmentClasses={(department) => getIncidentDepartmentClasses(department)}
								getStatusClasses={(status) => getIncidentStatusClasses(status)}
								departmentLabel={departmentLabel}
							/>
						</div>

						<AllReportsSidebar
							reportInFocus={reportInFocus}
							departmentLabel={departmentLabel}
							isUpdatingStatus={isUpdatingStatus}
							focusedDraftNote={focusedDraftNote}
							focusedNoteSaveState={focusedNoteSaveState}
							onClose={closeReportDetails}
							onOpenFullView={openFullViewInDashboard}
							onOpenDispatch={openDispatchModal}
							onOpenReject={() => setShowRejectConfirm(true)}
							onResolve={handleResolveFromAllReports}
							onChangeStatus={(status) => updateFocusedReportStatus(status as IncidentStatus)}
							onChangeNote={updateFocusedReportInternalNoteDraft}
							onSaveNote={saveFocusedReportInternalNote}
						/>
					</div>
				</section>
			</main>

			{/* Future feature (v2.0): GenerateReportModal intentionally deferred. */}
			<RejectConfirmModal
				isOpen={showRejectConfirm}
				onCancel={() => setShowRejectConfirm(false)}
				onConfirm={() => {
					setShowRejectConfirm(false);
					triggerDashboardAction("reject");
				}}
				reportTitle={reportInFocus?.incidentType ?? ""}
			/>
			<DispatchUnitModal
				isOpen={isDispatchModalOpen}
				onClose={() => setIsDispatchModalOpen(false)}
				incidentId={reportInFocus ? `RPT-2026-${reportInFocus.id}` : "RPT-2026-0000"}
				incidentType={reportInFocus?.incidentType ?? "Incident"}
				location={reportInFocus?.location ?? "Unknown location"}
				coordinates="Coordinates from incident geolocation"
				severity={reportInFocus ? `${severityLabel[reportInFocus.severity]} - SOS` : "Critical - SOS"}
				availableUnits={DEFAULT_AVAILABLE_UNITS}
				deployedUnits={DEFAULT_DEPLOYED_UNITS}
				onDispatch={handleDispatchFromAllReports}
			/>
		</>
	);
}
