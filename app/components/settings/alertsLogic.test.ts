import { describe, expect, it } from "vitest";
import {
	applyProfileDefaultsToSettings,
	buildSnapshot,
	calculatePendingChanges,
	INITIAL_ALERT_SETTINGS,
	isProfileModifiedFromDefaults,
	PROFILE_DEFAULTS,
} from "./alertsLogic";

describe("alertsLogic", () => {
	it("counts one pending change for severity switch without double-counting managed toggles", () => {
		const saved = buildSnapshot(INITIAL_ALERT_SETTINGS, "high", 70);
		const applied = applyProfileDefaultsToSettings("sos", INITIAL_ALERT_SETTINGS);
		const current = buildSnapshot(applied.settings, "sos", applied.masterVolume);

		expect(calculatePendingChanges(current, saved)).toBe(2);
	});

	it("counts individual non-profile toggle changes", () => {
		const saved = buildSnapshot(INITIAL_ALERT_SETTINGS, "high", 70);
		const current = buildSnapshot(
			{ ...INITIAL_ALERT_SETTINGS, desktopNotifications: false },
			"high",
			70,
		);

		expect(calculatePendingChanges(current, saved)).toBe(1);
	});

	it("resets high profile defaults correctly from another profile", () => {
		const fromSos = applyProfileDefaultsToSettings("sos", INITIAL_ALERT_SETTINGS);
		const toHigh = applyProfileDefaultsToSettings("high", fromSos.settings);

		expect(toHigh.settings.sosAudio).toBe(false);
		expect(toHigh.settings.highPriority).toBe(true);
		expect(toHigh.settings.mediumLow).toBe(false);
		expect(toHigh.masterVolume).toBe(70);
	});

	it("detects profile modifications against defaults", () => {
		const defaults = PROFILE_DEFAULTS.low;
		const lowState = {
			...INITIAL_ALERT_SETTINGS,
			sosAudio: defaults.settings.sosAudio,
			highPriority: defaults.settings.highPriority,
			mediumLow: defaults.settings.mediumLow,
		};

		expect(isProfileModifiedFromDefaults("low", lowState, defaults.defaultVolume)).toBe(
			false,
		);
		expect(isProfileModifiedFromDefaults("low", lowState, defaults.defaultVolume + 1)).toBe(
			true,
		);
	});
});
