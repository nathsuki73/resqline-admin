"use client";

import { Plus, UserRound } from "lucide-react";

type ResponderStatus = "en-route" | "on-scene" | "standby" | "active";
type ResponderGroupId = "bfp" | "cross";
type ChipTone = "orange" | "amber" | "purple";

type ResponderUnit = {
	id: string;
	unitCode: string;
	unitName: string;
	subtitle: string;
	status: ResponderStatus;
	group: ResponderGroupId;
	chipTone?: ChipTone;
};

type UnitGroupConfig = {
	id: ResponderGroupId;
	title: string;
	subtitle?: string;
	showAddButton?: boolean;
};

const CLASSNAMES = {
	pageTitle: "text-3xl font-bold leading-tight text-[#f0ede8] md:text-4xl",
	pageSubtitle: "mt-1 text-[13px] text-[#7a7268]",
	cardTitle: "text-base font-semibold text-[#f0ede8]",
};

const responders: ResponderUnit[] = [
	{
		id: "b3",
		unitCode: "B3",
		unitName: "BFP-QC-3 - Engine Co.",
		subtitle: "5 personnel - Ladder Truck",
		status: "en-route",
		group: "bfp",
		chipTone: "orange",
	},
	{
		id: "b7",
		unitCode: "B7",
		unitName: "BFP-QC-7 - Rescue Co.",
		subtitle: "4 personnel - Rescue Unit",
		status: "on-scene",
		group: "bfp",
		chipTone: "orange",
	},
	{
		id: "b1",
		unitCode: "B1",
		unitName: "BFP-QC-1 - Command",
		subtitle: "3 personnel - Command Vehicle",
		status: "standby",
		group: "bfp",
		chipTone: "orange",
	},
	{
		id: "c1",
		unitCode: "C1",
		unitName: "CTMO-1 - Traffic Control",
		subtitle: "Commonwealth Ave corridor",
		status: "active",
		group: "cross",
		chipTone: "amber",
	},
	{
		id: "p2",
		unitCode: "P2",
		unitName: "PNP-QC-2 - Patrol",
		subtitle: "Diliman sector",
		status: "standby",
		group: "cross",
		chipTone: "purple",
	},
];

const UNIT_GROUPS: UnitGroupConfig[] = [
	{
		id: "bfp",
		title: "BFP - Quezon City Units",
		showAddButton: true,
	},
	{
		id: "cross",
		title: "Cross-Dept Units (Read-only)",
	},
];

const toneClasses: Record<ChipTone, string> = {
	orange:
		"border-[var(--color-orange-border)] bg-[var(--color-orange-glow)] text-[var(--color-orange)]",
	amber:
		"border-[var(--color-amber-border)] bg-[var(--color-amber-glow)] text-[var(--color-text-amber)]",
	purple:
		"border-[var(--color-purple-border)] bg-[var(--color-purple-glow)] text-[var(--color-text-purple)]",
};

const statusClasses: Record<ResponderStatus, string> = {
	"en-route": "text-[var(--color-text-green)]",
	"on-scene": "text-[var(--color-text-green)]",
	standby: "text-[var(--color-text-3)]",
	active: "text-[var(--color-text-amber)]",
};

const statusLabel: Record<ResponderStatus, string> = {
	"en-route": "En Route",
	"on-scene": "On Scene",
	standby: "Standby",
	active: "Active",
};

const unitsByGroup = responders.reduce<Record<ResponderGroupId, ResponderUnit[]>>(
	(acc, unit) => {
		acc[unit.group].push(unit);
		return acc;
	},
	{ bfp: [], cross: [] }
);

const SectionCard = ({
	title,
	subtitle,
	units,
	showAddButton,
}: {
	title: string;
	subtitle?: string;
	units: ResponderUnit[];
	showAddButton?: boolean;
}) => {
	return (
		<section className="rounded-xl border border-(--color-border-1) bg-(--color-surface-1)/70">
			<header className="flex items-center justify-between border-b border-(--color-border-1) px-4 py-3">
				<div className="flex items-center gap-2">
					<UserRound size={14} className="text-(--color-orange)" />
					<h2 className={CLASSNAMES.cardTitle}>{title}</h2>
				</div>

				{showAddButton ? (
					<button type="button" className="ui-btn ui-btn-primary px-3 py-1.5 text-[10px]">
						<Plus size={12} />
						Add Unit
					</button>
				) : null}
			</header>

			{subtitle ? <p className="px-4 pt-2 text-[10px] text-(--color-text-3)">{subtitle}</p> : null}

			<div className="space-y-2 p-3">
				{units.map((unit) => (
					<article
						key={unit.id}
						className="flex items-center justify-between rounded-lg border border-(--color-border-1) bg-[linear-gradient(90deg,rgba(255,255,255,0.015)_0%,rgba(255,255,255,0)_100%)] px-3 py-2"
					>
						<div className="min-w-0 flex items-center gap-3">
							<div
								className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
									toneClasses[unit.chipTone ?? "orange"]
								}`}
							>
								{unit.unitCode}
							</div>
							<div className="min-w-0">
								<p className="truncate text-[12px] font-semibold text-(--color-text-1)">{unit.unitName}</p>
								<p className="truncate text-[10px] text-(--color-text-3)">{unit.subtitle}</p>
							</div>
						</div>

						<div className={`flex shrink-0 items-center gap-1 text-[10px] font-semibold ${statusClasses[unit.status]}`}>
							{unit.status !== "standby" ? (
								<span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
							) : null}
							{statusLabel[unit.status]}
						</div>
					</article>
				))}
			</div>
		</section>
	);
};

export default function ResponderSection() {
	return (
		<main className="flex h-screen flex-1 flex-col bg-(--color-bg) p-4">
			<header className="mb-4">
				<h1 className={CLASSNAMES.pageTitle}>Responder Units</h1>
				<p className={CLASSNAMES.pageSubtitle}>
					Manage your active dispatchers and field units
				</p>
			</header>

			<div className="space-y-3">
				{UNIT_GROUPS.map((group) => (
					<SectionCard
						key={group.id}
						title={group.title}
						subtitle={group.subtitle}
						units={unitsByGroup[group.id]}
						showAddButton={group.showAddButton}
					/>
				))}
			</div>
		</main>
	);
}
