import { ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";

import { mapApiStatusToLabel } from "@/app/constants/reportStatus";
import {
	type IncidentDepartment,
	type IncidentStatus,
} from "@/app/features/reports/types";

type SortKey = "id" | "incidentType" | "location" | "reporter" | "department" | "status" | "time";
type SortDirection = "asc" | "desc";

type SortState = {
	key: SortKey;
	direction: SortDirection;
};

type IncidentReportTableRow = {
	id: string;
	incidentType: string;
	location: string;
	reporter: string;
	department: IncidentDepartment;
	status: IncidentStatus;
	time: string;
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

export default function AllReportsTable({
	paginatedReports,
	sortedReportsCount,
	safePage,
	totalPages,
	sortState,
	onSort,
	onOpenReportDetails,
	onPrevPage,
	onNextPage,
	getDepartmentClasses,
	getStatusClasses,
	departmentLabel,
}: {
	paginatedReports: IncidentReportTableRow[];
	sortedReportsCount: number;
	safePage: number;
	totalPages: number;
	sortState: SortState;
	onSort: (key: SortKey) => void;
	onOpenReportDetails: (reportId: string) => void;
	onPrevPage: () => void;
	onNextPage: () => void;
	getDepartmentClasses: (department: IncidentDepartment) => string;
	getStatusClasses: (status: IncidentStatus) => string;
	departmentLabel: Record<IncidentDepartment, string>;
}) {
	return (
		<>
			<table className="min-w-full border-collapse">
				<thead className="bg-[#1b1918]">
					<tr>
						<TableHeader label="ID" sortKey="id" activeSort={sortState} onSort={onSort} />
						<TableHeader label="Incident Type" sortKey="incidentType" activeSort={sortState} onSort={onSort} />
						<TableHeader label="Location" sortKey="location" activeSort={sortState} onSort={onSort} />
						<TableHeader label="Reporter" sortKey="reporter" activeSort={sortState} onSort={onSort} />
						<TableHeader label="Dept" sortKey="department" activeSort={sortState} onSort={onSort} />
						<TableHeader label="Status" sortKey="status" activeSort={sortState} onSort={onSort} />
						<TableHeader label="Time" sortKey="time" activeSort={sortState} onSort={onSort} />
						<th className="border-b border-(--color-border-1) px-3 py-2 text-right text-[10px] font-bold uppercase tracking-widest text-(--color-text-3)">
							Actions
						</th>
					</tr>
				</thead>
				<tbody>
					{paginatedReports.length === 0 ? (
						<tr>
							<td colSpan={8} className="px-4 py-10 text-center">
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
									<span className={`inline-flex rounded-md border px-2 py-1 text-[10px] font-semibold ${getStatusClasses(report.status)}`}>
										{mapApiStatusToLabel(report.status)}
									</span>
								</td>
								<td className="px-3 py-2.5 text-sm text-(--color-text-2)">{report.time}</td>
								<td className="px-3 py-2.5 text-right">
									<button
										type="button"
										onClick={() => onOpenReportDetails(report.id)}
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
					{sortedReportsCount} total reports • Page {safePage} of {totalPages}
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={onPrevPage}
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
						onClick={onNextPage}
						disabled={safePage >= totalPages}
						className="flex h-7 w-7 items-center justify-center rounded-md border border-(--color-border-2) bg-(--color-surface-2) text-(--color-text-2) transition-colors hover:bg-(--color-surface-3) hover:text-(--color-text-1) disabled:cursor-not-allowed disabled:opacity-40"
						aria-label="Next page"
					>
						<ChevronRight size={14} />
					</button>
				</div>
			</footer>
		</>
	);
}
