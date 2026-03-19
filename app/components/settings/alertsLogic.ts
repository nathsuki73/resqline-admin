export type AlertToggleKey =
	| "sosAudio"
	| "highPriority"
	| "mediumLow"
	| "desktopNotifications"
	| "sosModalTakeover";

export type SeverityKey = "sos" | "high" | "low";
export type SeverityManagedKey = "sosAudio" | "highPriority" | "mediumLow";

export type ProfileDefaults = {
	toneLabel: string;
	defaultVolume: number;
	settings: Record<SeverityManagedKey, boolean>;
	appliesTo: string[];
};

export type AlertsSnapshot = {
	settings: Record<AlertToggleKey, boolean>;
	severity: SeverityKey;
	masterVolume: number;
};

export const ALERT_TOGGLE_KEYS: AlertToggleKey[] = [
	"sosAudio",
	"highPriority",
	"mediumLow",
	"desktopNotifications",
	"sosModalTakeover",
];

export const INITIAL_ALERT_SETTINGS: Record<AlertToggleKey, boolean> = {
	sosAudio: true,
	highPriority: true,
	mediumLow: false,
	desktopNotifications: true,
	sosModalTakeover: true,
};

export const SEVERITY_MANAGED_KEYS: SeverityManagedKey[] = [
	"sosAudio",
	"highPriority",
	"mediumLow",
];

const SEVERITY_MANAGED_KEY_SET = new Set<SeverityManagedKey>(SEVERITY_MANAGED_KEYS);

export const PROFILE_DEFAULTS: Record<SeverityKey, ProfileDefaults> = {
	sos: {
		toneLabel: "Siren",
		defaultVolume: 90,
		settings: {
			sosAudio: true,
			highPriority: true,
			mediumLow: false,
		},
		appliesTo: ["SOS Audio Alert", "High Priority Alert"],
	},
	high: {
		toneLabel: "Chime",
		defaultVolume: 70,
		settings: {
			sosAudio: false,
			highPriority: true,
			mediumLow: false,
		},
		appliesTo: ["High Priority Alert"],
	},
	low: {
		toneLabel: "Silent",
		defaultVolume: 20,
		settings: {
			sosAudio: false,
			highPriority: false,
			mediumLow: true,
		},
		appliesTo: ["Medium/Low Alerts"],
	},
};

export const buildSnapshot = (
	settings: Record<AlertToggleKey, boolean>,
	severity: SeverityKey,
	masterVolume: number,
): AlertsSnapshot => ({
	settings,
	severity,
	masterVolume,
});

export const createSliderTrackStyle = (volume: number) => {
	const safeValue = Math.max(0, Math.min(100, volume));
	return {
		background: `linear-gradient(to right, #f57c00 0%, #f57c00 ${safeValue}%, #d9d9d9 ${safeValue}%, #d9d9d9 100%)`,
	};
};

export const getPreviewGain = (severity: SeverityKey, volume: number) => {
	const normalized = Math.max(0, Math.min(100, volume)) / 100;
	const baseGain = severity === "sos" ? 0.16 : 0.12;
	return Math.max(0.0001, baseGain * normalized);
};

export const calculatePendingChanges = (
	current: AlertsSnapshot,
	saved: AlertsSnapshot,
): number => {
	let changed = 0;

	if (current.severity !== saved.severity) {
		changed += 1;
	}

	if (current.masterVolume !== saved.masterVolume) {
		changed += 1;
	}

	ALERT_TOGGLE_KEYS.forEach((key) => {
		const isSeverityManaged = SEVERITY_MANAGED_KEY_SET.has(
			key as SeverityManagedKey,
		);

		if (isSeverityManaged && current.severity !== saved.severity) {
			return;
		}

		if (current.settings[key] !== saved.settings[key]) {
			changed += 1;
		}
	});

	return changed;
};

export const isProfileModifiedFromDefaults = (
	severity: SeverityKey,
	settings: Record<AlertToggleKey, boolean>,
	masterVolume: number,
): boolean => {
	const defaults = PROFILE_DEFAULTS[severity];
	const togglesChanged = SEVERITY_MANAGED_KEYS.some(
		(key) => settings[key] !== defaults.settings[key],
	);

	return togglesChanged || masterVolume !== defaults.defaultVolume;
};

export const applyProfileDefaultsToSettings = (
	severity: SeverityKey,
	settings: Record<AlertToggleKey, boolean>,
) => {
	const defaults = PROFILE_DEFAULTS[severity];

	return {
		settings: {
			...settings,
			sosAudio: defaults.settings.sosAudio,
			highPriority: defaults.settings.highPriority,
			mediumLow: defaults.settings.mediumLow,
		},
		masterVolume: defaults.defaultVolume,
	};
};
