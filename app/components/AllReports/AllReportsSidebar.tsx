import {
	CheckCircle2,
	ChevronDown,
	Clock3,
	Eye,
	MapPin,
	NotebookPen,
	Send,
	ShieldCheck,
	X,
} from "lucide-react";
import {
	canTransitionStatus,
	mapApiStatusToLabel,
	mapMobileStatusToLabel,
	statusStep,
	type IncidentStatusSlug,
} from "@/app/constants/reportStatus";
import { type IncidentDepartment } from "@/app/features/reports/types";

type SidebarReport = {
	id: string;
	incidentType: string;
	location: string;
	department: IncidentDepartment;
	time: string;
	status: IncidentStatusSlug;
	reporterDescription: string;
};

type AllReportsSidebarProps = {
	reportInFocus: SidebarReport | null;
	departmentLabel: Record<IncidentDepartment, string>;
	isUpdatingStatus: boolean;
	focusedDraftNote: string;
	focusedNoteSaveState: "unsaved" | "saving" | "saved";
	onClose: () => void;
	onOpenFullView: () => void;
	onOpenDispatch: () => void;
	onOpenReject: () => void;
	onResolve: () => void;
	onChangeStatus: (status: IncidentStatusSlug) => void;
	onChangeNote: (value: string) => void;
	onSaveNote: () => void;
};

const statusOptions: Array<{ value: IncidentStatusSlug; label: string }> = [
	{ value: "submitted", label: "Submitted" },
	{ value: "under-review", label: "Under Review" },
	{ value: "in-progress", label: "Dispatched" },
	{ value: "resolved", label: "Resolved" },
	{ value: "rejected", label: "Rejected" },
];

const getStatusTone = (status: IncidentStatusSlug) => {
	if (status === "under-review") {
		return {
			pill: "border-[var(--color-blue-border)] bg-[var(--color-blue-glow)] text-[var(--color-text-blue)]",
		};
	}
	if (status === "submitted") {
		return {
			pill: "border-[var(--color-border-2)] bg-[var(--color-surface-2)] text-[var(--color-text-3)]",
		};
	}
	if (status === "in-progress") {
		return {
			pill: "border-[var(--color-orange-border)] bg-[var(--color-orange-glow)] text-[var(--color-orange)]",
		};
	}
	if (status === "rejected") {
		return {
			pill: "border-[var(--color-red-border)] bg-[var(--color-red-glow)] text-[var(--color-text-red)]",
		};
	}

	return {
		pill: "border-[var(--color-green-border)] bg-[var(--color-green-glow)] text-[var(--color-text-green)]",
	};
};

const AllReportsSidebar = ({
	reportInFocus,
	departmentLabel,
	isUpdatingStatus,
	focusedDraftNote,
	focusedNoteSaveState,
	onClose,
	onOpenFullView,
	onOpenDispatch,
	onOpenReject,
	onResolve,
	onChangeStatus,
	onChangeNote,
	onSaveNote,
}: AllReportsSidebarProps) => {
	const statusTone = reportInFocus ? getStatusTone(reportInFocus.status) : null;
	const draftLength = focusedDraftNote.trim().length;
	const statusValue = reportInFocus?.status ?? "submitted";
	const currentStatusStep = statusStep(statusValue as IncidentStatusSlug);
	const canDispatch = currentStatusStep >= 1 && currentStatusStep < 3;
	const canResolve = currentStatusStep === 2;

	return (
		<aside
			className={`overflow-hidden border-l border-(--color-border-1) bg-(--color-surface-1) transition-all duration-300 ${
				reportInFocus ? "w-88 opacity-100 xl:w-96" : "w-0 opacity-0"
			}`}
		>
			{reportInFocus ? (
				<div className="flex h-full min-h-0 flex-col">
					<header className="relative overflow-hidden border-b border-(--color-border-1) bg-linear-to-br from-(--color-surface-2) via-(--color-surface-1) to-(--color-surface-1) px-4 py-3">
						<div className="relative">
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<h3 className="mt-2 text-lg font-bold leading-snug text-(--color-text-1)">
										{reportInFocus.incidentType}
									</h3>
								</div>
								<button
									type="button"
									onClick={onClose}
									className="flex h-7 w-7 items-center justify-center rounded-md text-(--color-text-3) transition-colors hover:bg-(--color-surface-2) hover:text-(--color-text-1)"
									aria-label="Close report info panel"
								>
									<X size={15} />
								</button>
							</div>

							<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-(--color-text-3)">
								<span
									className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusTone?.pill}`}
								>
									{mapApiStatusToLabel(reportInFocus.status)}
								</span>
								<span className="inline-flex items-center gap-1">
									<Clock3 size={12} />
									{reportInFocus.time}
								</span>
								<span className="inline-flex items-center gap-1">
									<MapPin size={12} />
									{departmentLabel[reportInFocus.department]}
								</span>
								<span className="inline-flex items-center gap-1 rounded-full border border-(--color-border-2) bg-(--color-surface-2) px-2 py-0.5 text-[10px]">
									Reporter: {mapMobileStatusToLabel(reportInFocus.status)}
								</span>
							</div>
						</div>
					</header>

					<div className="custom-scrollbar flex-1 space-y-4 overflow-auto px-4 py-4">
						<section className="rounded-xl border border-(--color-border-1) bg-(--color-surface-2)/70 p-3">
							<p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">
								Quick Actions
							</p>
							<div className="mt-2 grid grid-cols-2 gap-2">
								<button type="button" onClick={onOpenFullView} className="ui-btn ui-btn-primary justify-center px-3 py-2 text-[12px]">
									 Full View
								</button>
								<button
									type="button"
									onClick={onOpenDispatch}
									disabled={!canDispatch || isUpdatingStatus}
									className="ui-btn ui-btn-secondary justify-center px-3 py-2 text-[12px] disabled:cursor-not-allowed disabled:opacity-50"
								>
									 Dispatch
								</button>
								<button
									type="button"
									onClick={onResolve}
									disabled={!canResolve || isUpdatingStatus}
									className="ui-btn justify-center border border-(--color-green-border) bg-(--color-green-glow) px-3 py-2 text-[12px] text-(--color-text-green) transition-colors hover:bg-[rgba(67,160,71,0.25)] disabled:cursor-not-allowed disabled:opacity-50"
								>
									 Resolve
								</button>
								<button
									type="button"
									onClick={onOpenReject}
									className="ui-btn justify-center border border-(--color-red-border) bg-(--color-red-glow) px-3 py-2 text-[12px] text-(--color-text-red) hover:bg-[rgba(229,57,53,0.2)]"
								>
									Reject
								</button>
							</div>
						</section>

						<section className="rounded-xl border border-(--color-border-1) bg-(--color-surface-2)/70 p-3">
							<p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">
								Change Status
							</p>
							<div className="relative mt-2">
								<select
									value={reportInFocus.status}
									onChange={(e) => onChangeStatus(e.target.value as IncidentStatusSlug)}
									disabled={isUpdatingStatus}
									className="h-10 w-full appearance-none rounded-lg border border-(--color-border-2) bg-(--color-surface-1) px-3 pr-7 text-sm text-(--color-text-1) focus:border-(--color-orange-border) focus:outline-none disabled:opacity-60"
								>
									{statusOptions.map((option) => (
										<option
											key={option.value}
											value={option.value}
											disabled={
												option.value !== reportInFocus.status &&
												!canTransitionStatus(reportInFocus.status, option.value)
											}
										>
											{option.label}
										</option>
									))}
								</select>
								<ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-(--color-text-4)" />
							</div>
						</section>

						<section className="rounded-xl border border-(--color-border-1) bg-(--color-surface-2)/70 p-3">
							<p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">
								Reporter Description
							</p>
							<div className="mt-2 rounded-lg border border-(--color-border-1) bg-(--color-surface-1) p-3 text-xs leading-relaxed text-(--color-text-2)">
								{reportInFocus.reporterDescription}
							</div>
						</section>

						<section className="rounded-xl border border-(--color-border-1) bg-(--color-surface-2)/70 p-3">
							<div className="flex items-center justify-between">
								<p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-4)">
									Internal Notes - Dispatcher Only
								</p>
							</div>
							<textarea
								value={focusedDraftNote}
								onChange={(e) => onChangeNote(e.target.value)}
								rows={5}
								placeholder="Add internal dispatch note..."
								className="mt-2 w-full resize-none rounded-lg border border-(--color-border-2) bg-(--color-surface-1) px-3 py-2 text-xs leading-relaxed text-(--color-text-2) placeholder-(--color-text-4) focus:border-(--color-orange-border) focus:outline-none"
							/>
							<div className="mt-2 flex items-center justify-between">
								<p className="text-[10px] text-(--color-text-3)">
									{focusedNoteSaveState === "unsaved"
										? "Unsaved changes"
										: focusedNoteSaveState === "saving"
											? "Saving..."
											: "Saved"}
								</p>
								<p className="text-[10px] text-(--color-text-4)">{draftLength} chars</p>
							</div>
							<button
								type="button"
								onClick={onSaveNote}
								disabled={focusedNoteSaveState === "saving"}
								className="ui-btn ui-btn-primary mt-2 w-full py-2 text-[11px] disabled:opacity-50"
							>
								<ShieldCheck size={13} />
								Save Note
							</button>
						</section>
					</div>
				</div>
			) : null}
		</aside>
	);
};

export default AllReportsSidebar;
