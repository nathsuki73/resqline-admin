import { PencilLine, Plus, RotateCcw, Trash2, UserRound } from "lucide-react";

import {
	CLASSNAMES,
	statusBadgeClasses,
	statusClasses,
	statusLabel,
	toneClasses,
} from "./responderConstants";
import type { ResponderUnit } from "./responderTypes";
import { buildSubtitle } from "./responderUtils";

interface SectionCardProps {
	title: string;
	units: ResponderUnit[];
	emptyMessage: string;
	showAddButton: boolean;
	managed: boolean;
	onAddUnit?: () => void;
	onEditUnit?: (unit: ResponderUnit) => void;
	onArchiveUnit?: (unit: ResponderUnit) => void;
	onRestoreUnit?: (unit: ResponderUnit) => void;
}

export default function SectionCard({
	title,
	units,
	emptyMessage,
	showAddButton,
	managed,
	onAddUnit,
	onEditUnit,
	onArchiveUnit,
	onRestoreUnit,
}: SectionCardProps) {
	return (
		<section className="rounded-xl border border-(--color-border-1) bg-(--color-surface-1)/70">
			<header className="flex items-center justify-between border-b border-(--color-border-1) px-4 py-3">
				<div className="flex items-center gap-2">
					<UserRound size={14} className="text-(--color-orange)" />
					<h2 className={CLASSNAMES.cardTitle}>{title}</h2>
				</div>

				{showAddButton ? (
					<button type="button" onClick={onAddUnit} className="ui-btn ui-btn-primary px-3 py-1.5 text-[10px]">
						<Plus size={12} />
						Add Unit
					</button>
				) : null}
			</header>

			<div className="space-y-2 p-3">
				{units.length === 0 ? (
					<div className="rounded-lg border border-dashed border-(--color-border-1) bg-[#1f1c1a] px-3 py-5 text-center">
						<p className="text-xs font-semibold text-[#b8b0a6]">No units to display</p>
						<p className="mt-1 text-[11px] text-[#7a7268]">{emptyMessage}</p>
					</div>
				) : null}

				{units.map((unit) => {
					const isInactive = !unit.isActive;

					return (
						<article
							key={unit.id}
							className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border border-(--color-border-1) px-3 py-2.5 transition-colors ${
								isInactive
									? "bg-[#221f1d] opacity-70"
									: "bg-[linear-gradient(90deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0)_100%)] hover:bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_0%,rgba(255,255,255,0)_100%)]"
							}`}
						>
							<div className="min-w-0 flex flex-1 items-center gap-3">
								<div
									className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold tracking-wide ${
										toneClasses[unit.chipTone ?? "orange"]
									}`}
								>
									{unit.unitCode}
								</div>
								<div className="min-w-0">
									<p className="truncate text-[13px] font-semibold text-(--color-text-1)">{unit.unitName}</p>
									<p className="truncate text-xs text-(--color-text-3)">{buildSubtitle(unit)}</p>
								</div>
							</div>

							<div className="flex shrink-0 items-center gap-2">
								<div
									className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-semibold ${statusClasses[unit.status]} ${statusBadgeClasses[unit.status]}`}
								>
									{unit.status !== "standby" ? (
										<span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
									) : null}
									{statusLabel[unit.status]}
								</div>

								{isInactive ? (
									<span className="rounded-md border border-[rgba(122,114,104,0.35)] bg-[rgba(122,114,104,0.12)] px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#b8b0a6]">
										Inactive
									</span>
								) : null}

								{managed ? (
									unit.isActive ? (
										<>
											<button
												type="button"
												onClick={() => onEditUnit?.(unit)}
												className={`${CLASSNAMES.iconButton} border border-[rgba(245,124,0,0.2)] hover:border-[rgba(245,124,0,0.35)] hover:bg-[rgba(245,124,0,0.08)] hover:text-[#f57c00]`}
												title="Edit unit"
											>
												<PencilLine size={14} />
											</button>
											<button
												type="button"
												onClick={() => onArchiveUnit?.(unit)}
												className={`${CLASSNAMES.iconButton} border border-[rgba(229,57,53,0.25)] hover:border-[rgba(229,57,53,0.35)] hover:bg-[rgba(229,57,53,0.08)] hover:text-[#ef9a9a]`}
												title="Archive unit"
											>
												<Trash2 size={14} />
											</button>
										</>
									) : (
										<button
											type="button"
											onClick={() => onRestoreUnit?.(unit)}
											className="ui-btn ui-btn-secondary px-2 py-1 text-[10px]"
										>
											<RotateCcw size={12} />
											Restore
										</button>
									)
								) : null}
							</div>
						</article>
					);
				})}
			</div>
		</section>
	);
}
