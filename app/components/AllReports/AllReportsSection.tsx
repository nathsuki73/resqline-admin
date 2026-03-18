"use client";

import { useEffect, useMemo, useState } from "react";
import {
	AlertTriangle,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	ChevronsUpDown,
	FileText,
	Search,
	ShieldAlert,
	X,
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

const MODAL_EXIT_MS = 260;

type IncidentSeverity = "critical" | "high" | "medium" | "low";
type IncidentStatus = "under-review" | "submitted" | "in-progress" | "resolved";
type IncidentDepartment = "bfp" | "ctmo" | "pdrmo" | "pnp";

type IncidentReport = {
	id: string;
	incidentType: string;
	location: string;
	reporter: string;
	reporterContact: string;
	department: IncidentDepartment;
	severity: IncidentSeverity;
	status: IncidentStatus;
	time: string;
	dateISO: string;
	reporterDescription: string;
	internalNote: string;
};

type SortKey = "id" | "incidentType" | "location" | "reporter" | "department" | "severity" | "status" | "time";
type SortDirection = "asc" | "desc";

type SortState = {
	key: SortKey;
	direction: SortDirection;
};

const REPORTS_PER_PAGE = 8;

const INITIAL_REPORTS: IncidentReport[] = [
	{
		id: "0441",
		incidentType: "Structure Fire - 3-Storey Bldg",
		location: "Brgy. Pag-asa, QC",
		reporter: "Maria Santos",
		reporterContact: "+63 917 123 4567",
		department: "bfp",
		severity: "critical",
		status: "under-review",
		time: "2:41 PM",
		dateISO: "2026-03-18T14:41:00+08:00",
		reporterDescription: "May sunog sa ikalawang palapag, makapal ang usok at may mga taong hindi pa nakakalabas.",
		internalNote: "Units BFP-QC-3 and BFP-QC-7 notified. ETA approximately 8 minutes.",
	},
	{
		id: "0440",
		incidentType: "Major Road Accident - Multi-Vehicle",
		location: "Commonwealth Ave, QC",
		reporter: "Jose Reyes",
		reporterContact: "+63 917 222 0111",
		department: "ctmo",
		severity: "critical",
		status: "submitted",
		time: "2:39 PM",
		dateISO: "2026-03-18T14:39:00+08:00",
		reporterDescription: "Tatlong sasakyan ang nagbanggaan. Isang lane lang ang passable ngayon.",
		internalNote: "CTMO dispatch escalation requested, ambulance coordination ongoing.",
	},
	{
		id: "0439",
		incidentType: "Grass Fire - Vacant Lot",
		location: "Batasan Hills, QC",
		reporter: "Carlos dela Cruz",
		reporterContact: "+63 917 333 1020",
		department: "bfp",
		severity: "high",
		status: "in-progress",
		time: "2:28 PM",
		dateISO: "2026-03-18T14:28:00+08:00",
		reporterDescription: "Nagsimula ang apoy sa damuhan, malapit sa bakanteng lote at poste ng kuryente.",
		internalNote: "Containment perimeter established. Monitoring wind direction.",
	},
	{
		id: "0438",
		incidentType: "Street Flooding - Knee-Deep Water",
		location: "Fairview, QC",
		reporter: "Ana Ramos",
		reporterContact: "+63 917 987 1100",
		department: "pdrmo",
		severity: "medium",
		status: "under-review",
		time: "2:15 PM",
		dateISO: "2026-03-18T14:15:00+08:00",
		reporterDescription: "Lumalim ang baha hanggang tuhod at mabagal na ang daloy ng sasakyan.",
		internalNote: "PDRRMO assessment requested for drainage obstruction.",
	},
	{
		id: "0437",
		incidentType: "Suspicious Activity - Armed Individual",
		location: "Diliman, QC",
		reporter: "Ricardo Santos",
		reporterContact: "+63 917 661 0099",
		department: "pnp",
		severity: "low",
		status: "submitted",
		time: "1:58 PM",
		dateISO: "2026-03-18T13:58:00+08:00",
		reporterDescription: "May armadong lalaki umano sa gilid ng kalsada, nagdudulot ng takot sa mga dumaraan.",
		internalNote: "PNP patrol route adjusted for immediate area sweep.",
	},
	{
		id: "0436",
		incidentType: "Minor Fender Bender - EDSA",
		location: "EDSA-Bansalangin, QC",
		reporter: "Lito Bautista",
		reporterContact: "+63 917 440 2201",
		department: "ctmo",
		severity: "medium",
		status: "resolved",
		time: "1:44 PM",
		dateISO: "2026-03-18T13:44:00+08:00",
		reporterDescription: "Minor collision lang, pero nagsisikip ang traffic dahil nasa gitna pa ang mga sasakyan.",
		internalNote: "Cleared at 1:44 PM. Traffic flow resumed.",
	},
	{
		id: "0435",
		incidentType: "Power Line Down - Hazard",
		location: "Novaliches, QC",
		reporter: "Grace Villanueva",
		reporterContact: "+63 917 510 7712",
		department: "pdrmo",
		severity: "high",
		status: "in-progress",
		time: "1:30 PM",
		dateISO: "2026-03-18T13:30:00+08:00",
		reporterDescription: "May kable na bumagsak at kumikislap malapit sa gate ng subdivision.",
		internalNote: "Safety perimeter set. Utility team ETA requested.",
	},
	{
		id: "0434",
		incidentType: "Residential Fire - Townhouse",
		location: "Cubao, QC",
		reporter: "Maricel Ocampo",
		reporterContact: "+63 917 120 3300",
		department: "bfp",
		severity: "high",
		status: "resolved",
		time: "12:55 PM",
		dateISO: "2026-03-18T12:55:00+08:00",
		reporterDescription: "May usok at apoy sa kusina ng townhouse pero mabilis na narespondehan.",
		internalNote: "Resolved with no casualties. Occupants accounted for.",
	},
];

const severityRank: Record<IncidentSeverity, number> = {
	critical: 4,
	high: 3,
	medium: 2,
	low: 1,
};

const statusRank: Record<IncidentStatus, number> = {
	"under-review": 4,
	"in-progress": 3,
	submitted: 2,
	resolved: 1,
};

const statusLabel: Record<IncidentStatus, string> = {
	"under-review": "Under Review",
	submitted: "Submitted",
	"in-progress": "In Progress",
	resolved: "Resolved",
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

const getTimeValue = (isoValue: string) => {
	const stamp = Date.parse(isoValue);
	return Number.isNaN(stamp) ? 0 : stamp;
};

const formatFilenameDate = () => {
	const now = new Date();
	const y = now.getFullYear();
	const m = String(now.getMonth() + 1).padStart(2, "0");
	const d = String(now.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
};

const TableHeader = ({
	label,
	sortKey,
	activeSort,
	onSort,
	align = "left",
}: {
	label: string;
	sortKey: SortKey;
	activeSort: SortState;
	onSort: (key: SortKey) => void;
	align?: "left" | "right";
}) => {
	const isActive = activeSort.key === sortKey;

	return (
		<th
			scope="col"
			className={`border-b border-(--color-border-1) px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-(--color-text-3) ${
				align === "right" ? "text-right" : "text-left"
			}`}
		>
			<button
				type="button"
				onClick={() => onSort(sortKey)}
				className={`inline-flex items-center gap-1 transition-colors ${
					isActive ? "text-(--color-text-1)" : "text-(--color-text-3) hover:text-(--color-text-2)"
				}`}
			>
				{label}
				<ChevronsUpDown size={12} />
			</button>
		</th>
	);
};

const GenerateReportModal = ({
	isOpen,
	onClose,
	visibleCount,
}: {
	isOpen: boolean;
	onClose: () => void;
	visibleCount: number;
}) => {
	const { shouldRender, isVisible } = useModalDissolve(isOpen, MODAL_EXIT_MS);
	const [scope, setScope] = useState("filtered");
	const [format, setFormat] = useState("csv");

	if (!shouldRender) return null;

	return (
		<div
			className={`modal-overlay-dissolve fixed inset-0 z-(--z-modal) flex items-center justify-center bg-black/50 p-4 ${
				isVisible ? "is-open" : "is-closed"
			}`}
		>
			<div
				className={`modal-card-dissolve w-full max-w-md rounded-2xl border border-(--color-border-1) bg-(--color-surface-1) shadow-xl ${
					isVisible ? "is-open" : "is-closed"
				}`}
			>
				<header className="flex items-start justify-between border-b border-(--color-border-1) px-5 py-4">
					<div>
						<h3 className="text-lg font-bold text-(--color-text-1)">Generate Report</h3>
						<p className="mt-1 text-xs text-(--color-text-3)">Create a structured export from current report data.</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-(--color-text-3) transition-colors hover:bg-(--color-surface-2) hover:text-(--color-text-1)"
						aria-label="Close generate report modal"
					>
						<X size={16} />
					</button>
				</header>

				<div className="space-y-4 px-5 py-4 text-sm">
					<div>
						<label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">Scope</label>
						<select
							value={scope}
							onChange={(e) => setScope(e.target.value)}
							className="h-10 w-full rounded-lg border border-(--color-border-2) bg-(--color-surface-2) px-3 text-sm text-(--color-text-1) focus:border-(--color-orange-border) focus:outline-none focus:ring-2 focus:ring-(--color-orange-glow)"
						>
							<option value="filtered">Filtered results ({visibleCount})</option>
							<option value="all">All reports</option>
						</select>
					</div>

					<div>
						<label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">Format</label>
						<select
							value={format}
							onChange={(e) => setFormat(e.target.value)}
							className="h-10 w-full rounded-lg border border-(--color-border-2) bg-(--color-surface-2) px-3 text-sm text-(--color-text-1) focus:border-(--color-orange-border) focus:outline-none focus:ring-2 focus:ring-(--color-orange-glow)"
						>
							<option value="csv">CSV</option>
							<option value="pdf">PDF (preview only)</option>
						</select>
					</div>

					<div className="rounded-lg border border-(--color-border-1) bg-(--color-surface-2) p-3 text-xs text-(--color-text-3)">
						Recommended: Use filtered scope before generating daily department exports.
					</div>
				</div>

				<footer className="flex justify-end gap-2 border-t border-(--color-border-1) px-5 py-4">
					<button type="button" onClick={onClose} className="ui-btn ui-btn-secondary">
						Cancel
					</button>
					<button type="button" onClick={onClose} className="ui-btn ui-btn-primary">
						<FileText size={14} />
						Generate
					</button>
				</footer>
			</div>
		</div>
	);
};

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

const getStatusClasses = (status: IncidentStatus) => {
	if (status === "under-review") return "border-[var(--color-blue-border)] bg-[var(--color-blue-glow)] text-[var(--color-text-blue)]";
	if (status === "submitted") return "border-[var(--color-border-2)] bg-[var(--color-surface-2)] text-[var(--color-text-3)]";
	if (status === "in-progress") return "border-[var(--color-orange-border)] bg-[var(--color-orange-glow)] text-[var(--color-orange)]";
	return "border-[var(--color-green-border)] bg-[var(--color-green-glow)] text-[var(--color-text-green)]";
};

const getSeverityClasses = (severity: IncidentSeverity) => {
	if (severity === "critical") return "text-[var(--color-text-red)]";
	if (severity === "high") return "text-[var(--color-orange)]";
	if (severity === "medium") return "text-[var(--color-amber)]";
	return "text-[var(--color-text-blue)]";
};

const getDepartmentClasses = (department: IncidentDepartment) => {
	if (department === "bfp") return "border-[var(--color-orange-border)] bg-[var(--color-orange-glow)] text-[var(--color-orange)]";
	if (department === "ctmo") return "border-[var(--color-amber-border)] bg-[var(--color-amber-glow)] text-[var(--color-text-amber)]";
	if (department === "pdrmo") return "border-[var(--color-blue-border)] bg-[var(--color-blue-glow)] text-[var(--color-text-blue)]";
	return "border-[var(--color-purple-border)] bg-[var(--color-purple-glow)] text-[var(--color-text-purple)]";
};

export default function AllReportsSection({ onOpenDashboard }: { onOpenDashboard?: () => void }) {
	const [reports, setReports] = useState<IncidentReport[]>(() =>
		INITIAL_REPORTS.map((report) => {
			const syncedNote = getIncidentNoteForId(report.id);
			return syncedNote === null ? report : { ...report, internalNote: syncedNote };
		})
	);
	const [searchQuery, setSearchQuery] = useState("");
	const [severityFilter, setSeverityFilter] = useState<"all" | IncidentSeverity>("all");
	const [statusFilter, setStatusFilter] = useState<"all" | IncidentStatus>("all");
	const [departmentFilter, setDepartmentFilter] = useState<"all" | IncidentDepartment>("all");
	const [sortState, setSortState] = useState<SortState>({ key: "time", direction: "desc" });
	const [currentPage, setCurrentPage] = useState(1);
	const [activeReportId, setActiveReportId] = useState<string | null>(null);
	const [draftNotesByReportId, setDraftNotesByReportId] = useState<Record<string, string>>({});
	const [noteSaveStateByReportId, setNoteSaveStateByReportId] = useState<Record<string, "unsaved" | "saving" | "saved">>({});
	const [isGenerateOpen, setIsGenerateOpen] = useState(false);
	const [showRejectConfirm, setShowRejectConfirm] = useState(false);
	const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

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

	const filteredReports = useMemo(() => {
		const normalizedSearch = searchQuery.trim().toLowerCase();

		return reports.filter((report) => {
			const matchesSearch =
				normalizedSearch.length === 0 ||
				report.id.toLowerCase().includes(normalizedSearch) ||
				report.reporter.toLowerCase().includes(normalizedSearch) ||
				report.location.toLowerCase().includes(normalizedSearch) ||
				report.incidentType.toLowerCase().includes(normalizedSearch);

			const matchesSeverity = severityFilter === "all" || report.severity === severityFilter;
			const matchesStatus = statusFilter === "all" || report.status === statusFilter;
			const matchesDepartment = departmentFilter === "all" || report.department === departmentFilter;

			return matchesSearch && matchesSeverity && matchesStatus && matchesDepartment;
		});
	}, [reports, searchQuery, severityFilter, statusFilter, departmentFilter]);

	const sortedReports = useMemo(() => {
		const next = [...filteredReports];

		next.sort((a, b) => {
			let comparison = 0;

			if (sortState.key === "id") comparison = a.id.localeCompare(b.id, undefined, { numeric: true });
			if (sortState.key === "incidentType") comparison = a.incidentType.localeCompare(b.incidentType);
			if (sortState.key === "location") comparison = a.location.localeCompare(b.location);
			if (sortState.key === "reporter") comparison = a.reporter.localeCompare(b.reporter);
			if (sortState.key === "department") comparison = departmentLabel[a.department].localeCompare(departmentLabel[b.department]);
			if (sortState.key === "severity") comparison = severityRank[a.severity] - severityRank[b.severity];
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
		setSeverityFilter("all");
		setStatusFilter("all");
		setDepartmentFilter("all");
		setCurrentPage(1);
	};

	const exportCsv = () => {
		const header = ["ID", "Incident Type", "Location", "Reporter", "Department", "Severity", "Status", "Time"];
		const rows = sortedReports.map((report) => [
			report.id,
			report.incidentType,
			report.location,
			report.reporter,
			departmentLabel[report.department],
			severityLabel[report.severity],
			statusLabel[report.status],
			report.time,
		]);

		const csv = [header, ...rows]
			.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
			.join("\n");

		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `resqline-reports-${formatFilenameDate()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const openReportDetails = (reportId: string) => {
		setActiveReportId(reportId);
		setNoteSaveStateByReportId((prev) => ({ ...prev, [reportId]: prev[reportId] ?? "saved" }));
	};

	const closeReportDetails = () => {
		setActiveReportId(null);
	};

	const updateFocusedReportStatus = (nextStatus: IncidentStatus) => {
		if (!activeReportId) return;

		setReports((prev) =>
			prev.map((report) => (report.id === activeReportId ? { ...report, status: nextStatus } : report))
		);
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
			time: report.time,
			reporterDescription: report.reporterDescription,
			internalNote: report.internalNote,
		};

		setActiveIncident(incident);
	};

	const triggerDashboardAction = (action: BridgeActionType) => {
		if (!reportInFocus) return;
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

	const handleDispatchFromAllReports = (selectedUnitIds: string[], note: string) => {
		if (!reportInFocus) return;
		// TODO: Wire to API: dispatch selected units for reportInFocus.id from All Reports context
		setReports((prev) =>
			prev.map((report) =>
				report.id === reportInFocus.id
					? {
						...report,
						status: "in-progress",
						internalNote: note.trim().length > 0 ? note.trim() : report.internalNote,
					}
					: report
			)
		);
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

						<div className="flex items-center gap-2">
							<button type="button" onClick={exportCsv} className="ui-btn ui-btn-secondary">
								<FileText size={14} />
								Export CSV
							</button>
							<button type="button" onClick={() => setIsGenerateOpen(true)} className="ui-btn ui-btn-primary">
								<ShieldAlert size={14} />
								Generate Report
							</button>
						</div>
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
								value={severityFilter}
								onChange={(e) => {
									setSeverityFilter(e.target.value as typeof severityFilter);
									setCurrentPage(1);
								}}
								className="h-9 min-w-32.5 appearance-none rounded-lg border border-(--color-border-2) bg-(--color-surface-2) px-3 pr-7 text-sm text-(--color-text-2) focus:border-(--color-orange-border) focus:outline-none"
							>
								<option value="all">All Severity</option>
								<option value="critical">Critical</option>
								<option value="high">High</option>
								<option value="medium">Medium</option>
								<option value="low">Low</option>
							</select>
							<ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-4)" />
						</div>

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
								<option value="under-review">Under Review</option>
								<option value="submitted">Submitted</option>
								<option value="in-progress">In Progress</option>
								<option value="resolved">Resolved</option>
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
						Showing {paginatedReports.length} of {sortedReports.length} reports
					</div>

					<div className="flex min-h-0 flex-1 overflow-hidden">
						<div className="min-h-0 min-w-0 flex-1 overflow-auto">
							<table className="min-w-full border-collapse">
							<thead className="bg-[#1b1918]">
								<tr>
									<TableHeader label="ID" sortKey="id" activeSort={sortState} onSort={setSort} />
									<TableHeader label="Incident Type" sortKey="incidentType" activeSort={sortState} onSort={setSort} />
									<TableHeader label="Location" sortKey="location" activeSort={sortState} onSort={setSort} />
									<TableHeader label="Reporter" sortKey="reporter" activeSort={sortState} onSort={setSort} />
									<TableHeader label="Dept" sortKey="department" activeSort={sortState} onSort={setSort} />
									<TableHeader label="Severity" sortKey="severity" activeSort={sortState} onSort={setSort} />
									<TableHeader label="Status" sortKey="status" activeSort={sortState} onSort={setSort} />
									<TableHeader label="Time" sortKey="time" activeSort={sortState} onSort={setSort} />
									<th className="border-b border-(--color-border-1) px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-(--color-text-3)">
										Actions
									</th>
								</tr>
							</thead>
							<tbody>
								{paginatedReports.length === 0 ? (
									<tr>
										<td colSpan={9} className="px-4 py-10 text-center">
											<p className="text-sm font-semibold text-(--color-text-2)">No reports found</p>
											<p className="mt-1 text-xs text-(--color-text-3)">Adjust filters or search keywords to continue.</p>
										</td>
									</tr>
								) : (
									paginatedReports.map((report) => (
										<tr key={report.id} className="border-b border-(--color-border-1) transition-colors hover:bg-(--color-surface-2)/50">
											<td className="px-3 py-2.5 text-xs text-(--color-text-3)">#{report.id}</td>
											<td className="max-w-75 px-3 py-2.5 text-sm font-semibold text-(--color-text-1)">{report.incidentType}</td>
											<td className="max-w-60 px-3 py-2.5 text-sm text-(--color-text-2)">{report.location}</td>
											<td className="px-3 py-2.5 text-sm text-(--color-text-2)">{report.reporter}</td>
											<td className="px-3 py-2.5">
												<span
													className={`inline-flex rounded-md border px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${getDepartmentClasses(
														report.department
													)}`}
												>
													{departmentLabel[report.department]}
												</span>
											</td>
											<td className="px-3 py-2.5">
												<span className={`inline-flex items-center gap-1 text-sm font-semibold ${getSeverityClasses(report.severity)}`}>
													<span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
													{severityLabel[report.severity]}
												</span>
											</td>
											<td className="px-3 py-2.5">
												<span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(report.status)}`}>
													{statusLabel[report.status]}
												</span>
											</td>
											<td className="px-3 py-2.5 text-sm text-(--color-text-2)">{report.time}</td>
											<td className="px-3 py-2.5 text-right">
												<button
													type="button"
													onClick={() => openReportDetails(report.id)}
													className="inline-flex items-center gap-1 rounded-md border border-(--color-border-2) bg-(--color-surface-2) px-2 py-1 text-xs font-semibold text-(--color-text-2) transition-colors hover:border-(--color-border-3) hover:bg-(--color-surface-3) hover:text-(--color-text-1)"
												>
													View
													<span aria-hidden="true">→</span>
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
							</table>

							<footer className="flex items-center justify-between border-t border-(--color-border-1) px-4 py-2 text-xs text-(--color-text-3)">
								<div>
									{sortedReports.length} total reports • Page {safePage} of {totalPages}
								</div>
								<div className="flex items-center gap-1">
									<button
										type="button"
										onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
										disabled={safePage === 1}
										className="flex h-7 w-7 items-center justify-center rounded-md border border-(--color-border-2) bg-(--color-surface-2) text-(--color-text-2) transition-colors hover:bg-(--color-surface-3) hover:text-(--color-text-1) disabled:cursor-not-allowed disabled:opacity-40"
										aria-label="Previous page"
									>
										<ChevronLeft size={14} />
									</button>
									<span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-(--color-orange-border) bg-(--color-orange) px-2 text-xs font-bold text-white">
										{safePage}
									</span>
									<button
										type="button"
										onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
										disabled={safePage >= totalPages}
										className="flex h-7 w-7 items-center justify-center rounded-md border border-(--color-border-2) bg-(--color-surface-2) text-(--color-text-2) transition-colors hover:bg-(--color-surface-3) hover:text-(--color-text-1) disabled:cursor-not-allowed disabled:opacity-40"
										aria-label="Next page"
									>
										<ChevronRight size={14} />
									</button>
								</div>
							</footer>
						</div>

						<aside
							className={`overflow-hidden border-l border-(--color-border-1) bg-(--color-surface-1) transition-all duration-300 ${
								reportInFocus ? "w-80 opacity-100" : "w-0 opacity-0"
							}`}
						>
							{reportInFocus ? (
								<div className="flex h-full min-h-0 flex-col">
									<header className="flex items-start justify-between border-b border-(--color-border-1) px-4 py-3">
										<div className="min-w-0">
											<h3 className="text-base font-semibold leading-snug text-(--color-text-1)">{reportInFocus.incidentType}</h3>
											<p className="mt-1 text-xs text-(--color-text-3)">
												#{reportInFocus.id} • {reportInFocus.time} • {departmentLabel[reportInFocus.department]}
											</p>
										</div>
										<button
											type="button"
											onClick={closeReportDetails}
											className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-text-3) transition-colors hover:bg-(--color-surface-2) hover:text-(--color-text-1)"
											aria-label="Close report info panel"
										>
											<X size={15} />
										</button>
									</header>

									<div className="flex-1 space-y-4 overflow-auto px-4 py-4">
										<section>
											<p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">Quick Actions</p>
											<div className="mt-2 flex flex-wrap gap-2">
												<button type="button" onClick={openFullViewInDashboard} className="ui-btn ui-btn-primary px-3 py-1.5 text-[10px]">
													Full View
												</button>
												<button type="button" onClick={openDispatchModal} className="ui-btn ui-btn-secondary px-3 py-1.5 text-[10px]">
													Dispatch
												</button>
												<button
													type="button"
													onClick={() => setShowRejectConfirm(true)}
													className="ui-btn border border-(--color-red-border) bg-(--color-red-glow) px-3 py-1.5 text-[10px] text-(--color-text-red) hover:bg-[rgba(229,57,53,0.2)]"
												>
													Reject
												</button>
											</div>
										</section>

										<section>
											<p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">Change Status</p>
											<div className="relative mt-2">
												<select
													value={reportInFocus.status}
													onChange={(e) => updateFocusedReportStatus(e.target.value as IncidentStatus)}
													className="h-9 w-full appearance-none rounded-lg border border-(--color-border-2) bg-(--color-surface-2) px-3 pr-7 text-sm text-(--color-text-2) focus:border-(--color-orange-border) focus:outline-none"
												>
													<option value="under-review">Under Review</option>
													<option value="submitted">Submitted</option>
													<option value="in-progress">In Progress</option>
													<option value="resolved">Resolved</option>
												</select>
												<ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-4)" />
											</div>
										</section>

										<section>
											<p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">Reporter Description</p>
											<div className="mt-2 rounded-lg border border-(--color-border-1) bg-(--color-surface-2) p-3 text-xs italic leading-relaxed text-(--color-text-2)">
												{reportInFocus.reporterDescription}
											</div>
										</section>

										<section>
											<p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">Internal Notes - Dispatcher Only</p>
											<textarea
												value={focusedDraftNote}
												onChange={(e) => updateFocusedReportInternalNoteDraft(e.target.value)}
												rows={4}
												placeholder="Add internal dispatch note..."
												className="mt-2 w-full resize-none rounded-lg border border-(--color-border-2) bg-(--color-surface-2) px-3 py-2 text-xs leading-relaxed text-(--color-text-2) placeholder-(--color-text-4) focus:border-(--color-orange-border) focus:outline-none"
											/>
											<div className="mt-2 flex items-center justify-between">
												<p className="text-[10px] text-(--color-text-3)">
													{focusedNoteSaveState === "unsaved"
														? "Unsaved changes"
														: focusedNoteSaveState === "saving"
														? "Saving..."
														: "Saved"}
												</p>
												<button
													type="button"
													onClick={saveFocusedReportInternalNote}
													disabled={focusedNoteSaveState === "saving"}
													className="ui-btn ui-btn-primary px-3 py-1.5 text-[10px] disabled:opacity-50"
												>
													Save Note
												</button>
											</div>
										</section>
									</div>
								</div>
							) : null}
						</aside>
					</div>
				</section>
			</main>

			<GenerateReportModal isOpen={isGenerateOpen} onClose={() => setIsGenerateOpen(false)} visibleCount={sortedReports.length} />
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
