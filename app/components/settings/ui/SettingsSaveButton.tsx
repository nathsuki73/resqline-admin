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
			className={`ui-btn ui-btn-primary ${className}`}
		>
			<RotateCw size={14} className={spinning ? "animate-spin" : undefined} />
			{label}
		</button>
	);
}
