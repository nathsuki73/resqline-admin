"use client";

import React from "react";
import SettingsSaveButton from "./SettingsSaveButton";

type SettingsDraftActionsProps = {
	hasUnsavedChanges: boolean;
	pendingChangesCount: number;
	pendingMessage: string;
	savedMessage: string;
	onResetDraft: () => void;
	onSaveChanges: () => void;
};

export default function SettingsDraftActions({
	hasUnsavedChanges,
	pendingChangesCount,
	pendingMessage,
	savedMessage,
	onResetDraft,
	onSaveChanges,
}: SettingsDraftActionsProps) {
	return (
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
					{hasUnsavedChanges ? pendingMessage : savedMessage}
				</p>
			</div>

			<div className="flex items-center gap-2">
				<button
					type="button"
					onClick={onResetDraft}
					disabled={!hasUnsavedChanges}
					className="ui-btn ui-btn-secondary"
				>
					Reset Draft
				</button>
				<SettingsSaveButton
					onClick={onSaveChanges}
					disabled={!hasUnsavedChanges}
					label="Save Changes"
				/>
			</div>
		</div>
	);
}
