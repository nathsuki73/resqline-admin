"use client";

import React from "react";

type SettingsToggleSwitchProps = {
	enabled: boolean;
	onToggle: () => void;
	label: string;
	disabled?: boolean;
};

export default function SettingsToggleSwitch({
	enabled,
	onToggle,
	label,
	disabled = false,
}: SettingsToggleSwitchProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-all duration-200 ${
				enabled
					? "border-[#f57c00] bg-[#f57c00]"
					: "border-[#3a3632] bg-[#2c2925]"
			} ${disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}
			role="switch"
			aria-checked={enabled}
			aria-label={label}
			aria-disabled={disabled}
			disabled={disabled}
		>
			<span
				className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
					enabled ? "translate-x-5" : "translate-x-0"
				}`}
			/>
		</button>
	);
}
