"use client";

import React from "react";
import { RotateCw } from "lucide-react";

type SettingsSaveButtonProps = {
	onClick: () => void;
	disabled?: boolean;
	spinning?: boolean;
	label?: string;
	className?: string;
};

export default function SettingsSaveButton({
	onClick,
	disabled = false,
	spinning = false,
	label = "Save Changes",
	className = "",
}: SettingsSaveButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-busy={spinning}
			className={`inline-flex items-center gap-2 rounded-lg bg-[#f57c00] px-4 py-2 text-sm font-semibold text-[#fff8f1] transition-colors hover:bg-[#e06d00] disabled:cursor-not-allowed disabled:opacity-40 ${className}`}
		>
			<RotateCw size={14} className={spinning ? "animate-spin" : undefined} />
			{label}
		</button>
	);
}
