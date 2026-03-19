"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	AlertTriangle,
	Bell,
	BellRing,
	CheckCircle2,
	Play,
	Square,
	Volume2,
	VolumeX,
} from "lucide-react";
import {
	applyProfileDefaultsToSettings,
	buildSnapshot,
	calculatePendingChanges,
	createSliderTrackStyle,
	getPreviewGain,
	INITIAL_ALERT_SETTINGS,
	isProfileModifiedFromDefaults,
	PROFILE_DEFAULTS,
	type AlertToggleKey,
	type SeverityKey,
} from "./alertsLogic";
import SettingsDraftActions from "./ui/SettingsDraftActions";
import SettingsToggleSwitch from "./ui/SettingsToggleSwitch";

type AlertToggleConfig = {
	key: AlertToggleKey;
	title: string;
	description: string;
};

type SeverityPreset = {
	key: SeverityKey;
	title: string;
	description: string;
	icon: React.ReactNode;
};

const ALERT_TOGGLE_CONFIGS: AlertToggleConfig[] = [
	{
		key: "sosAudio",
		title: "SOS Audio Alert",
		description: "Alarm siren on new SOS report",
	},
	{
		key: "highPriority",
		title: "High Priority Alert",
		description: "Urgent chime for Critical/High severity",
	},
	{
		key: "mediumLow",
		title: "Medium/Low Alerts",
		description: "Silent - visual badge only",
	},
	{
		key: "desktopNotifications",
		title: "Desktop Notifications",
		description: "Browser push notifications when tab is inactive",
	},
	{
		key: "sosModalTakeover",
		title: "SOS Modal Takeover",
		description: "Full-screen modal for first unacknowledged SOS",
	},
];

const SEVERITY_PRESETS: SeverityPreset[] = [
	{
		key: "sos",
		title: "SOS - Siren",
		description: "Critical",
		icon: <AlertTriangle size={14} />,
	},
	{
		key: "high",
		title: "High - Chime",
		description: "Urgent",
		icon: <BellRing size={14} />,
	},
	{
		key: "low",
		title: "Low - Silent",
		description: "Informational",
		icon: <VolumeX size={14} />,
	},
];
export default function AlertsSection() {
	const [savedAlertSettings, setSavedAlertSettings] =
		useState<Record<AlertToggleKey, boolean>>(INITIAL_ALERT_SETTINGS);
	const [savedSeverity, setSavedSeverity] = useState<SeverityKey>("high");
	const [savedMasterVolume, setSavedMasterVolume] = useState(70);

	const [alertSettings, setAlertSettings] =
		useState<Record<AlertToggleKey, boolean>>(INITIAL_ALERT_SETTINGS);
	const [activeSeverity, setActiveSeverity] = useState<SeverityKey>("high");
	const [masterVolume, setMasterVolume] = useState(70);
	const [previewingSeverity, setPreviewingSeverity] =
		useState<SeverityKey | null>(null);
	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const isSilentMode = activeSeverity === "low";

	const audioContextRef = useRef<AudioContext | null>(null);
	const oscillatorRef = useRef<OscillatorNode | null>(null);
	const gainRef = useRef<GainNode | null>(null);
	const previewStopTimeoutRef = useRef<number | null>(null);
	const sirenIntervalRef = useRef<number | null>(null);
	const toastTimeoutRef = useRef<number | null>(null);

	const pendingChangesCount = useMemo(
		() =>
			calculatePendingChanges(
				buildSnapshot(alertSettings, activeSeverity, masterVolume),
				buildSnapshot(savedAlertSettings, savedSeverity, savedMasterVolume),
			),
		[
			activeSeverity,
			alertSettings,
			masterVolume,
			savedAlertSettings,
			savedMasterVolume,
			savedSeverity,
		],
	);

	const hasUnsavedChanges = pendingChangesCount > 0;

	const showToast = (message: string) => {
		setToastMessage(message);

		if (toastTimeoutRef.current) {
			window.clearTimeout(toastTimeoutRef.current);
		}

		toastTimeoutRef.current = window.setTimeout(() => {
			setToastMessage(null);
		}, 2400);
	};

	const stopPreview = () => {
		if (previewStopTimeoutRef.current) {
			window.clearTimeout(previewStopTimeoutRef.current);
			previewStopTimeoutRef.current = null;
		}

		if (sirenIntervalRef.current) {
			window.clearInterval(sirenIntervalRef.current);
			sirenIntervalRef.current = null;
		}

		if (oscillatorRef.current) {
			try {
				oscillatorRef.current.stop();
			} catch {
				// Oscillator may already be stopped.
			}
			oscillatorRef.current.disconnect();
			oscillatorRef.current = null;
		}

		if (gainRef.current) {
			gainRef.current.disconnect();
			gainRef.current = null;
		}

		setPreviewingSeverity(null);
	};

	const startPreview = async (severity: SeverityKey) => {
		if (severity === "low") {
			showToast("Low - Silent has no audio preview.");
			return;
		}

		stopPreview();

		const AudioContextCtor = window.AudioContext;
		if (!AudioContextCtor) {
			showToast("Audio preview is not supported in this browser.");
			return;
		}

		if (!audioContextRef.current) {
			audioContextRef.current = new AudioContextCtor();
		}

		const context = audioContextRef.current;
		await context.resume();

		const oscillator = context.createOscillator();
		const gainNode = context.createGain();

		oscillator.type = severity === "sos" ? "sawtooth" : "sine";
		oscillator.frequency.value = severity === "sos" ? 760 : 990;

		gainNode.gain.value = 0.0001;
		oscillator.connect(gainNode);
		gainNode.connect(context.destination);

		oscillator.start();
		const now = context.currentTime;
		const targetGain = getPreviewGain(severity, masterVolume);
		gainNode.gain.exponentialRampToValueAtTime(targetGain, now + 0.05);

		if (severity === "sos") {
			let highPitch = false;
			sirenIntervalRef.current = window.setInterval(() => {
				highPitch = !highPitch;
				oscillator.frequency.setValueAtTime(
					highPitch ? 980 : 760,
					context.currentTime,
				);
			}, 170);
		}

		oscillatorRef.current = oscillator;
		gainRef.current = gainNode;
		setPreviewingSeverity(severity);

		previewStopTimeoutRef.current = window.setTimeout(() => {
			stopPreview();
		}, 2000);
	};

	useEffect(() => {
		if (!gainRef.current || !previewingSeverity || !audioContextRef.current) {
			return;
		}

		const nextGain = getPreviewGain(previewingSeverity, masterVolume);
		gainRef.current.gain.setTargetAtTime(
			nextGain,
			audioContextRef.current.currentTime,
			0.04,
		);
	}, [masterVolume, previewingSeverity]);

	useEffect(() => {
		return () => {
			stopPreview();

			if (toastTimeoutRef.current) {
				window.clearTimeout(toastTimeoutRef.current);
			}

			if (audioContextRef.current) {
				void audioContextRef.current.close();
			}
		};
		// Cleanup on unmount only.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const sliderTrackStyle = useMemo(
		() => createSliderTrackStyle(masterVolume),
		[masterVolume],
	);

	const activeProfileDefaults = PROFILE_DEFAULTS[activeSeverity];
	const isProfileModified = isProfileModifiedFromDefaults(
		activeSeverity,
		alertSettings,
		masterVolume,
	);

	const handleToggle = (key: AlertToggleKey) => {
		if (isSilentMode && (key === "sosAudio" || key === "highPriority")) {
			return;
		}

		setAlertSettings((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const applyProfileDefaults = (severity: SeverityKey) => {
		const next = applyProfileDefaultsToSettings(severity, alertSettings);
		setAlertSettings(next.settings);
		setMasterVolume(next.masterVolume);
	};

	const handleSelectSeverity = (severity: SeverityKey) => {
		const wasSilent = activeSeverity === "low";
		setActiveSeverity(severity);
		applyProfileDefaults(severity);

		if (severity === "low" && !wasSilent) {
			showToast("Low - Silent profile applied: audio controls locked.");
		}
	};

	const handleSave = () => {
		setSavedAlertSettings({ ...alertSettings });
		setSavedSeverity(activeSeverity);
		setSavedMasterVolume(masterVolume);
		showToast("Alerts & Sounds preferences saved.");
	};

	const handleResetDraft = () => {
		setAlertSettings({ ...savedAlertSettings });
		setActiveSeverity(savedSeverity);
		setMasterVolume(savedMasterVolume);
		stopPreview();
		showToast("Draft changes reset.");
	};

	return (
		<main className="flex-1 overflow-y-auto bg-[#191716] custom-scrollbar">
			{toastMessage ? (
				<div className="pointer-events-none fixed right-6 top-5 z-40 animate-modal-card">
					<div className="flex items-center gap-2 rounded-lg border border-[#2a2724] bg-[#1f1c19] px-3 py-2 shadow-lg">
						<CheckCircle2 size={14} className="text-[#f57c00]" />
						<p className="text-xs font-semibold text-[#d9d1c8]">{toastMessage}</p>
					</div>
				</div>
			) : null}

			<div className="bg-[#191716] p-8">
				<div className="mb-6">
					<h1 className="text-3xl font-bold leading-tight text-[#f0ede8] md:text-4xl">
						Alerts &amp; Sounds
					</h1>
					<p className="mt-1 text-[13px] text-[#7a7268]">
						Configure how you receive alert notifications
					</p>
				</div>

				<section className="mb-4 rounded-xl border border-[#2a2724] bg-[#1e1c1a] px-4 py-3.5">
					<SettingsDraftActions
						hasUnsavedChanges={hasUnsavedChanges}
						pendingChangesCount={pendingChangesCount}
						pendingMessage="Review updates and save in one intentional step."
						savedMessage="No pending alert or sound edits."
						onResetDraft={handleResetDraft}
						onSaveChanges={handleSave}
					/>
				</section>

				<div className="space-y-4">
					<section className="overflow-hidden rounded-2xl border border-[#2a2724] bg-[#1e1c1a]">
						<div className="flex items-center border-b border-[#2a2724] px-4 py-3.5">
							<h2 className="flex items-center gap-2 text-base font-semibold text-[#f0ede8]">
								<Bell size={16} className="text-[#f57c00]" />
								Alert Settings
							</h2>
						</div>

						<div className="px-4">
							{ALERT_TOGGLE_CONFIGS.map((item) => (
								// In silent mode, audio-specific toggles are locked to prevent conflicting state.
								<div
									key={item.key}
									className="flex items-center justify-between border-b border-[#2a2724] py-4 last:border-b-0"
								>
									<div className="min-w-0 pr-4">
										<p className="truncate text-sm font-semibold text-[#f0ede8]">
											{item.title}
										</p>
										<p className="mt-1 text-xs text-[#7a7268]">
											{item.description}
											{isSilentMode && (item.key === "sosAudio" || item.key === "highPriority")
												? " · Locked while Low - Silent is active"
												: ""}
										</p>
									</div>
									<SettingsToggleSwitch
										enabled={alertSettings[item.key]}
										onToggle={() => handleToggle(item.key)}
										label={`Toggle ${item.title}`}
										disabled={
											isSilentMode &&
											(item.key === "sosAudio" || item.key === "highPriority")
										}
									/>
								</div>
							))}
						</div>
					</section>

					<section className="overflow-hidden rounded-2xl border border-[#2a2724] bg-[#1e1c1a]">
						<div className="flex items-center border-b border-[#2a2724] px-4 py-3.5">
							<h2 className="flex items-center gap-2 text-base font-semibold text-[#f0ede8]">
								<Volume2 size={16} className="text-[#f57c00]" />
								Sound per Severity Level
							</h2>
						</div>

						<div className="grid gap-4 p-4 lg:grid-cols-[220px_minmax(0,1fr)]">
							<div className="space-y-2">
								<p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7268]">
									Severity Profiles
								</p>
								<div className="space-y-2">
									{SEVERITY_PRESETS.map((preset) => {
										const isActive = activeSeverity === preset.key;
										return (
											<button
												key={preset.key}
												type="button"
												onClick={() => handleSelectSeverity(preset.key)}
												className={`w-full rounded-lg border px-3 py-2.5 text-left transition-colors ${
													isActive
														? "border-[#f57c00] bg-[rgba(245,124,0,0.16)]"
														: "border-[#2a2724] bg-[#242220] hover:border-[#3a3632]"
												}`}
												aria-pressed={isActive}
											>
												<div className="flex items-center gap-2">
													<span
														className={isActive ? "text-[#f57c00]" : "text-[#7a7268]"}
													>
														{preset.icon}
													</span>
													<div className="min-w-0">
														<p
															className={`text-sm font-semibold ${
																isActive ? "text-[#f7a246]" : "text-[#d4cdc3]"
															}`}
														>
															{preset.title}
														</p>
														<p className="text-[11px] text-[#7a7268]">{preset.description}</p>
													</div>
												</div>
											</button>
										);
									})}
								</div>
							</div>

							<div className="rounded-xl border border-[#2a2724] bg-[#191715] p-4">
								<div className="flex flex-wrap items-center gap-2">
									<p className="text-base font-semibold text-[#f0ede8]">
										{SEVERITY_PRESETS.find((preset) => preset.key === activeSeverity)?.title}
									</p>
									<span className="rounded-full border border-[rgba(245,124,0,0.35)] bg-[rgba(245,124,0,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#f7a246]">
										{activeProfileDefaults.toneLabel}
									</span>
									{isProfileModified ? (
										<span className="rounded-full border border-[rgba(229,57,53,0.35)] bg-[rgba(229,57,53,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#ef9a9a]">
											Modified
										</span>
									) : (
										<span className="rounded-full border border-[rgba(125,192,122,0.35)] bg-[rgba(125,192,122,0.12)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#8fd28c]">
											Default
										</span>
									)}
								</div>

								<div className="mt-3 grid gap-3 md:grid-cols-2">
									<div className="rounded-lg border border-[#2a2724] bg-[#1e1c1a] px-3 py-2.5">
										<p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7268]">
											Preview
										</p>
										<div className="mt-2 flex items-center gap-2">
											{activeSeverity !== "low" ? (
												<button
													type="button"
													onClick={() => {
														if (previewingSeverity === activeSeverity) {
															stopPreview();
															return;
														}
														void startPreview(activeSeverity);
													}}
													className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
														previewingSeverity === activeSeverity
															? "border-[rgba(245,124,0,0.40)] bg-[rgba(245,124,0,0.16)] text-[#f7a246]"
															: "border-[#3a3632] bg-[#1e1c1a] text-[#d4cdc3] hover:border-[#f57c00] hover:text-[#f7a246]"
													}`}
												>
													{previewingSeverity === activeSeverity ? (
														<>
															<Square size={10} /> Playing
														</>
													) : (
														<>
															<Play size={10} /> Test (2s)
														</>
													)}
												</button>
											) : (
												<span className="text-[11px] font-semibold uppercase tracking-wide text-[#7a7268]">
													Silent profile
												</span>
											)}
										</div>
									</div>

									<div className="rounded-lg border border-[#2a2724] bg-[#1e1c1a] px-3 py-2.5">
										<p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7268]">
											Applies To
										</p>
										<div className="mt-2 flex flex-wrap gap-1.5">
											{activeProfileDefaults.appliesTo.map((label) => (
												<span
													key={label}
													className="rounded-full border border-[#2a2724] bg-[#24211e] px-2 py-0.5 text-[10px] font-semibold text-[#b8b0a6]"
												>
													{label}
												</span>
											))}
										</div>
									</div>
								</div>

								<div className="mt-3 rounded-lg border border-[#2a2724] bg-[#1e1c1a] px-3 py-3">
									<div className="mb-2 flex items-center justify-between gap-3">
										<p className="text-[10px] font-bold uppercase tracking-widest text-[#7a7268]">
											Master Volume
										</p>
										<button
											type="button"
											onClick={() => applyProfileDefaults(activeSeverity)}
											className="rounded-md border border-[#2a2724] bg-[#24211e] px-2 py-1 text-[10px] font-semibold text-[#b8b0a6] transition-colors hover:border-[#f57c00] hover:text-[#f7a246]"
										>
											Reset To Default
										</button>
									</div>
									<div className="flex items-center gap-3">
										<Volume2 size={14} className="text-[#7a7268]" />
										<input
											type="range"
											min={0}
											max={100}
											step={1}
											value={masterVolume}
											onChange={(event) => {
												const value = Number(event.target.value);
												setMasterVolume(value);
											}}
											className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-transparent [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-[#8b8b8b] [&::-moz-range-thumb]:shadow-none [&::-moz-range-track]:h-1.5 [&::-moz-range-track]:rounded-full [&::-webkit-slider-runnable-track]:h-1.5 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-thumb]:-mt-1.25 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:bg-[#8b8b8b]"
											style={sliderTrackStyle}
											aria-label="Master volume"
										/>
										<span className="w-10 text-right text-xs font-semibold text-[#f57c00]">
											{masterVolume}%
										</span>
									</div>
									<p className="mt-2 text-[11px] text-[#7a7268]">
										Default for {activeProfileDefaults.toneLabel}: {activeProfileDefaults.defaultVolume}%
									</p>
								</div>

								{isSilentMode ? (
									<div className="mt-3 rounded-lg border border-[rgba(245,124,0,0.30)] bg-[rgba(245,124,0,0.10)] px-3 py-2">
										<p className="text-xs text-[#d4cdc3]">
											Low - Silent prioritizes visual notifications. Audio-only controls are locked until another severity profile is selected.
										</p>
									</div>
								) : null}
							</div>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}
