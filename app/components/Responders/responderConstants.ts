import type {
	ChipTone,
	ResponderStatus,
	ResponderUnit,
	UnitFormData,
	UnitGroupConfig,
} from "./responderTypes";

export const MODAL_EXIT_MS = 260;

export const CLASSNAMES = {
	pageTitle: "text-3xl font-bold leading-tight text-[#f0ede8] md:text-4xl",
	pageSubtitle: "mt-1 text-[13px] text-[#7a7268]",
	cardTitle: "text-base font-semibold text-[#f0ede8]",
	fieldControl:
		"h-10 rounded-lg border border-[#3a3632] bg-[#252220] px-3 text-sm text-[#f0ede8] placeholder-[#4a4540] focus:border-[rgba(245,124,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,124,0,0.14)]",
	iconButton:
		"flex h-7 w-7 items-center justify-center rounded-md text-[#7a7268] transition-colors",
};

export const UNIT_TYPE_OPTIONS = ["Engine", "Rescue Unit", "Command Vehicle", "HazMat Unit", "Medical Support"];

export const DEFAULT_UNIT_FORM: UnitFormData = {
	unitCode: "",
	unitName: "",
	unitType: "Engine",
	personnelCount: "",
	radioChannel: "",
	stationArea: "",
	contactNumber: "",
	status: "standby",
};

export const INITIAL_RESPONDERS: ResponderUnit[] = [
	{
		id: "b3",
		unitCode: "B3",
		unitName: "BFP-QC-3 - Engine Co.",
		unitType: "Ladder Truck",
		personnelCount: 5,
		radioChannel: "Alpha-1",
		stationArea: "Quezon Ave Station",
		contactNumber: "+63 917 111 0303",
		status: "en-route",
		group: "bfp",
		chipTone: "orange",
		isActive: true,
		updatedAt: new Date().toISOString(),
	},
	{
		id: "b7",
		unitCode: "B7",
		unitName: "BFP-QC-7 - Rescue Co.",
		unitType: "Rescue Unit",
		personnelCount: 4,
		radioChannel: "Alpha-2",
		stationArea: "Batasan Sector",
		contactNumber: "+63 917 111 0707",
		status: "on-scene",
		group: "bfp",
		chipTone: "orange",
		isActive: true,
		updatedAt: new Date().toISOString(),
	},
	{
		id: "b1",
		unitCode: "B1",
		unitName: "BFP-QC-1 - Command",
		unitType: "Command Vehicle",
		personnelCount: 3,
		radioChannel: "Command-Net",
		stationArea: "City Operations Center",
		contactNumber: "+63 917 111 0101",
		status: "standby",
		group: "bfp",
		chipTone: "orange",
		isActive: true,
		updatedAt: new Date().toISOString(),
	},
	{
		id: "c1",
		unitCode: "C1",
		unitName: "CTMO-1 - Traffic Control",
		unitType: "Traffic Control",
		personnelCount: 2,
		radioChannel: "Traffic-1",
		stationArea: "Commonwealth Ave Corridor",
		contactNumber: "+63 917 222 0101",
		status: "active",
		group: "cross",
		chipTone: "amber",
		isActive: true,
		updatedAt: new Date().toISOString(),
	},
	{
		id: "p2",
		unitCode: "P2",
		unitName: "PNP-QC-2 - Patrol",
		unitType: "Patrol",
		personnelCount: 2,
		radioChannel: "Patrol-2",
		stationArea: "Diliman Sector",
		contactNumber: "+63 917 333 0202",
		status: "standby",
		group: "cross",
		chipTone: "purple",
		isActive: true,
		updatedAt: new Date().toISOString(),
	},
];

export const UNIT_GROUPS: UnitGroupConfig[] = [
	{
		id: "bfp",
		title: "BFP - Quezon City Units",
		showAddButton: true,
		managed: true,
		emptyMessage: "Add a responder unit to start managing this section.",
	},
	{
		id: "cross",
		title: "Cross-Dept Units (Read-only)",
		showAddButton: false,
		managed: false,
		emptyMessage: "No cross-department responders are linked right now.",
	},
];

export const toneClasses: Record<ChipTone, string> = {
	orange: "border-[var(--color-orange-border)] bg-[var(--color-orange-glow)] text-[var(--color-orange)]",
	amber: "border-[var(--color-amber-border)] bg-[var(--color-amber-glow)] text-[var(--color-text-amber)]",
	purple: "border-[var(--color-purple-border)] bg-[var(--color-purple-glow)] text-[var(--color-text-purple)]",
};

export const statusClasses: Record<ResponderStatus, string> = {
	"en-route": "text-[var(--color-text-green)]",
	"on-scene": "text-[var(--color-text-green)]",
	standby: "text-[var(--color-text-3)]",
	active: "text-[var(--color-text-amber)]",
};

export const statusBadgeClasses: Record<ResponderStatus, string> = {
	"en-route": "border-[rgba(46,204,113,0.35)] bg-[rgba(46,204,113,0.12)]",
	"on-scene": "border-[rgba(46,204,113,0.35)] bg-[rgba(46,204,113,0.12)]",
	standby: "border-[rgba(122,114,104,0.35)] bg-[rgba(122,114,104,0.12)]",
	active: "border-[rgba(245,124,0,0.35)] bg-[rgba(245,124,0,0.14)]",
};

export const statusLabel: Record<ResponderStatus, string> = {
	"en-route": "En Route",
	"on-scene": "On Scene",
	standby: "Standby",
	active: "Active",
};
