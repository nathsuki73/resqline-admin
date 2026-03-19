"use client";

import React, { useState, useMemo } from "react";
import { Save, Monitor } from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface DisplaySettings {
	defaultMapView: "city" | "district" | "barangay";
}

// ============================================================================
// COMPONENT: Select Dropdown
// ============================================================================

function SelectField({
	id,
	label,
	value,
	onChange,
	options,
	disabled = false,
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
	options: Array<{ value: string; label: string }>;
	disabled?: boolean;
}) {
	return (
		<div className="flex flex-col">
			<label
				htmlFor={id}
				className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#7a7268]"
			>
				{label}
			</label>
			<select
				id={id}
				name={id}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				disabled={disabled}
				className={`h-10 rounded-lg border px-3 text-sm transition-all appearance-none bg-no-repeat pr-10 cursor-pointer ${
					disabled
						? "border-[#2a2724] bg-[#201d1a] text-[#7a7268]"
						: "border-[#3a3632] bg-[#252220] text-[#f0ede8] focus:border-[rgba(245,124,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[rgba(245,124,0,0.14)]"
				}`}
				style={{
					backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%237a7268' d='M2 4l4 4 4-4'/%3E%3C/svg%3E")`,
					backgroundPosition: "right 8px center",
				}}
			>
				{options.map((option) => (
					<option key={option.value} value={option.value}>
						{option.label}
					</option>
				))}
			</select>
		</div>
	);
}

// ============================================================================
// MAIN COMPONENT: Display Section
// ============================================================================

export default function DisplaySection() {
	const [savedSettings, setSavedSettings] = useState<DisplaySettings>({
		defaultMapView: "district",
	});

	const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
		...savedSettings,
	});

	const [toastMessage, setToastMessage] = useState<string | null>(null);
	const toastTimeoutRef = React.useRef<number | null>(null);

	const pendingChangesCount = useMemo(() => {
		let count = 0;
		if (displaySettings.defaultMapView !== savedSettings.defaultMapView) count++;
		return count;
	}, [displaySettings, savedSettings]);

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

	const handleSave = () => {
		setSavedSettings({ ...displaySettings });
		showToast("Display & Interface preferences saved.");
	};

	const handleResetDraft = () => {
		setDisplaySettings({ ...savedSettings });
		showToast("Draft changes reset.");
	};

	const handleSelectChange = (key: string, value: string) => {
		setDisplaySettings((prev) => ({ ...prev, [key]: value }));
	};

	return (
		<main className="flex-1 overflow-y-auto bg-[#191716] custom-scrollbar">
			{toastMessage ? (
				<div className="pointer-events-none fixed right-6 top-5 z-40 animate-modal-card">
					<div className="flex items-center gap-2 rounded-lg border border-[#2a2724] bg-[#1f1c19] px-3 py-2 shadow-lg">
						<Save size={14} className="text-[#f57c00]" />
						<p className="text-xs font-semibold text-[#d9d1c8]">{toastMessage}</p>
					</div>
				</div>
			) : null}

			<div className="bg-[#191716] p-8">
				<div className="mb-6">
					<h1 className="text-3xl font-bold leading-tight text-[#f0ede8] md:text-4xl">
						Display &amp; Interface
					</h1>
					<p className="mt-1 text-[13px] text-[#7a7268]">
						Customize how the panel looks and behaves
					</p>
				</div>

				<section className="mb-4 rounded-xl border border-[#2a2724] bg-[#1e1c1a] px-4 py-3.5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<span
								className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold leading-none ${
									hasUnsavedChanges
										? "border-[rgba(245,124,0,0.35)] bg-[rgba(245,124,0,0.10)] text-[#f7a246]"
										: "border-[rgba(125,192,122,0.35)] bg-[rgba(125,192,122,0.12)] text-[#8fd28c]"
								}`}
							>
								{hasUnsavedChanges ? `${pendingChangesCount} Pending` : "All Saved"}
							</span>
							<p className="mt-1 text-xs font-semibold text-[#7a7268]">
								{hasUnsavedChanges
									? "Review updates and save in one intentional step."
									: "No pending display edits."}
							</p>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleResetDraft}
								disabled={!hasUnsavedChanges}
								className="rounded-lg px-3 py-2 text-sm font-semibold text-[#9d9489] transition-colors hover:bg-[#23201d] hover:text-[#d4cdc3] disabled:cursor-not-allowed disabled:opacity-40"
							>
								Reset Draft
							</button>
							<button
								type="button"
								onClick={handleSave}
								disabled={!hasUnsavedChanges}
								className="rounded-lg bg-[#f57c00] px-4 py-2 text-sm font-semibold text-[#fff8f1] transition-colors hover:bg-[#e06d00] disabled:cursor-not-allowed disabled:opacity-40 inline-flex items-center gap-2"
							>
								<Save size={14} />
								Save
							</button>
						</div>
					</div>
				</section>

				<section className="overflow-hidden rounded-2xl border border-[#2a2724] bg-[#1e1c1a]">
					<div className="flex items-center border-b border-[#2a2724] px-4 py-3.5">
						<h2 className="flex items-center gap-2 text-base font-semibold text-[#f0ede8]">
							<Monitor size={16} className="text-[#f57c00]" />
							Map Preferences
						</h2>
					</div>

					<div className="grid gap-5 p-6 md:grid-cols-2">
						<SelectField
							id="defaultMapView"
							label="Map View"
							value={displaySettings.defaultMapView}
							onChange={(value) => handleSelectChange("defaultMapView", value)}
							options={[
								{ value: "city", label: "City Level" },
								{ value: "district", label: "District Level" },
								{ value: "barangay", label: "Barangay Level" },
							]}
						/>
					</div>
				</section>
			</div>
		</main>
	);
}
