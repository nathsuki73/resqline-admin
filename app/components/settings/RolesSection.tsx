"use client";

import React, { useState } from "react";
import { AlertTriangle, Lock, Shield } from "lucide-react";

type DepartmentAccessState = {
	bfp: boolean;
	ctmo: boolean;
	pdrrmo: boolean;
	pnp: boolean;
};

type CapabilitiesState = {
	dispatchUnits: boolean;
	rejectReports: boolean;
	exportReports: boolean;
	manageResponderTeam: boolean;
};

const INITIAL_DEPARTMENT_ACCESS: DepartmentAccessState = {
	bfp: true,
	ctmo: false,
	pdrrmo: false,
	pnp: false,
};

const INITIAL_CAPABILITIES: CapabilitiesState = {
	dispatchUnits: true,
	rejectReports: true,
	exportReports: true,
	manageResponderTeam: false,
};

type ToggleRowProps = {
	title: string;
	description: string;
	enabled: boolean;
	onToggle: () => void;
	badgeLabel?: string;
	badgeClassName?: string;
};

function ToggleRow({
	title,
	description,
	enabled,
	onToggle,
	badgeLabel,
	badgeClassName,
}: ToggleRowProps) {
	return (
		<div className="flex items-center justify-between border-b border-[#2a2724] py-4 last:border-b-0">
			<div className="min-w-0">
				<div className="flex items-center gap-2">
					{badgeLabel ? (
						<span
							className={`rounded-full px-2 py-0.5 text-[10px] font-bold leading-none ${badgeClassName}`}
						>
							{badgeLabel}
						</span>
					) : null}
					<p className="truncate text-sm font-semibold text-[#f0ede8]">{title}</p>
				</div>
				<p className="mt-1 text-xs text-[#7a7268]">{description}</p>
			</div>

			<button
				type="button"
				onClick={onToggle}
				className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-all duration-200 ${
					enabled
						? "border-[#f57c00] bg-[#f57c00]"
						: "border-[#3a3632] bg-[#2c2925]"
				} cursor-pointer`}
				role="switch"
				aria-checked={enabled}
				aria-label={`Toggle ${title}`}
			>
				<span
					className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
						enabled ? "translate-x-5" : "translate-x-0"
					}`}
				/>
			</button>
		</div>
	);
}

type SavePermissionsModalProps = {
	open: boolean;
	onCancel: () => void;
	onConfirm: () => void;
	pendingCount: number;
};

function SavePermissionsModal({
	open,
	onCancel,
	onConfirm,
	pendingCount,
}: SavePermissionsModalProps) {
	if (!open) {
		return null;
	}

	return (
		<div className="animate-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
			<div className="animate-modal-card w-full max-w-md rounded-2xl border border-[#2a2724] bg-[#1e1c1a] shadow-xl">
				<div className="border-b border-[#2a2724] px-5 py-4">
					<h3 className="text-lg font-semibold text-[#f0ede8]">Apply Permission Changes?</h3>
					<p className="mt-1 text-xs text-[#7a7268]">
						This action updates live access rules for dispatch operations.
					</p>
				</div>

				<div className="space-y-3 px-5 py-4">
					<div className="flex items-start gap-2 rounded-lg border border-[rgba(245,124,0,0.35)] bg-[rgba(245,124,0,0.10)] px-3 py-2.5">
						<AlertTriangle size={15} className="mt-0.5 shrink-0 text-[#f7a246]" />
						<p className="text-xs text-[#c8c1b8]">
							{pendingCount} pending permission {pendingCount === 1 ? "change" : "changes"} will be applied.
						</p>
					</div>
					<p className="text-xs text-[#7a7268]">
						Review completed? Confirm to apply now, or cancel to continue editing.
					</p>
				</div>

				<div className="flex items-center justify-end gap-2 border-t border-[#2a2724] px-5 py-4">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-lg border border-[#2a2724] bg-[#1e1c1a] px-3.5 py-2 text-sm font-semibold text-[#f0ede8] transition-colors hover:bg-[#2a2724]"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="rounded-lg bg-[#f57c00] px-3.5 py-2 text-sm font-semibold text-[#fff8f1] transition-colors hover:bg-[#e06d00]"
					>
						Apply Changes
					</button>
				</div>
			</div>
		</div>
	);
}

export default function RolesSection() {
	const [savedDepartmentAccess, setSavedDepartmentAccess] =
		useState<DepartmentAccessState>(INITIAL_DEPARTMENT_ACCESS);
	const [savedCapabilities, setSavedCapabilities] =
		useState<CapabilitiesState>(INITIAL_CAPABILITIES);

	const [departmentAccess, setDepartmentAccess] =
		useState<DepartmentAccessState>(INITIAL_DEPARTMENT_ACCESS);
	const [capabilities, setCapabilities] =
		useState<CapabilitiesState>(INITIAL_CAPABILITIES);

	const hasDepartmentChanges =
		departmentAccess.bfp !== savedDepartmentAccess.bfp ||
		departmentAccess.ctmo !== savedDepartmentAccess.ctmo ||
		departmentAccess.pdrrmo !== savedDepartmentAccess.pdrrmo ||
		departmentAccess.pnp !== savedDepartmentAccess.pnp;

	const hasCapabilityChanges =
		capabilities.dispatchUnits !== savedCapabilities.dispatchUnits ||
		capabilities.rejectReports !== savedCapabilities.rejectReports ||
		capabilities.exportReports !== savedCapabilities.exportReports ||
		capabilities.manageResponderTeam !== savedCapabilities.manageResponderTeam;

	const hasUnsavedChanges = hasDepartmentChanges || hasCapabilityChanges;
	const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

	const pendingChangesCount =
		Number(departmentAccess.bfp !== savedDepartmentAccess.bfp) +
		Number(departmentAccess.ctmo !== savedDepartmentAccess.ctmo) +
		Number(departmentAccess.pdrrmo !== savedDepartmentAccess.pdrrmo) +
		Number(departmentAccess.pnp !== savedDepartmentAccess.pnp) +
		Number(capabilities.dispatchUnits !== savedCapabilities.dispatchUnits) +
		Number(capabilities.rejectReports !== savedCapabilities.rejectReports) +
		Number(capabilities.exportReports !== savedCapabilities.exportReports) +
		Number(
			capabilities.manageResponderTeam !==
				savedCapabilities.manageResponderTeam,
		);

	const commitSave = () => {
		setSavedDepartmentAccess({ ...departmentAccess });
		setSavedCapabilities({ ...capabilities });
		setIsSaveModalOpen(false);
	};

	const handleSaveClick = () => {
		if (!hasUnsavedChanges) {
			return;
		}

		setIsSaveModalOpen(true);
	};

	const handleDiscard = () => {
		setDepartmentAccess({ ...savedDepartmentAccess });
		setCapabilities({ ...savedCapabilities });
		setIsSaveModalOpen(false);
	};

	return (
		<main className="flex-1 overflow-y-auto bg-[#191716] custom-scrollbar">
			<SavePermissionsModal
				open={isSaveModalOpen}
				onCancel={() => setIsSaveModalOpen(false)}
				onConfirm={commitSave}
				pendingCount={pendingChangesCount}
			/>

			<div className="bg-[#191716] p-8">
				<div className="mb-6">
					<h1 className="text-3xl font-bold leading-tight text-[#f0ede8] md:text-4xl">
						Roles &amp; Permissions
					</h1>
					<p className="mt-1 text-[13px] text-[#7a7268]">
						Control department access and dispatcher privileges
					</p>
				</div>

				<section className="mb-6 rounded-xl border border-[#2a2724] bg-[#1e1c1a] px-4 py-3.5">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div className="min-w-0">
							<div className="flex items-center gap-2">
								<span
									className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold leading-none ${
										hasUnsavedChanges
											? "border-[rgba(245,124,0,0.35)] bg-[rgba(245,124,0,0.10)] text-[#f7a246]"
											: "border-[rgba(125,192,122,0.35)] bg-[rgba(125,192,122,0.12)] text-[#8fd28c]"
									}`}
								>
									{hasUnsavedChanges ? `${pendingChangesCount} Pending` : "All Saved"}
								</span>
							</div>
							<p className="mt-1 text-xs font-semibold text-[#7a7268]">
								{hasUnsavedChanges
									? "Review updates, then use Review & Save to apply intentionally."
									: "No pending permission edits."}
							</p>
						</div>

						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={handleDiscard}
								disabled={!hasUnsavedChanges}
								className="rounded-lg px-3 py-2 text-sm font-semibold text-[#9d9489] transition-colors hover:bg-[#23201d] hover:text-[#d4cdc3] disabled:cursor-not-allowed disabled:opacity-40"
							>
								Reset Draft
							</button>
							<button
								type="button"
								onClick={handleSaveClick}
								disabled={!hasUnsavedChanges}
								className="rounded-lg bg-[#f57c00] px-4 py-2 text-sm font-semibold text-[#fff8f1] transition-colors hover:bg-[#e06d00] disabled:cursor-not-allowed disabled:opacity-40"
							>
								Review &amp; Save
							</button>
						</div>
					</div>
				</section>

				<div className="space-y-4">
					<section className="overflow-hidden rounded-2xl border border-[#2a2724] bg-[#1e1c1a]">
						<div className="flex items-center border-b border-[#2a2724] px-4 py-3.5">
							<h2 className="flex items-center gap-2 text-base font-semibold text-[#f0ede8]">
								<Lock size={16} className="text-[#f57c00]" />
								My Department Access
							</h2>
						</div>

						<div className="px-4">
							<ToggleRow
								badgeLabel="BFP"
								badgeClassName="border border-[rgba(245,124,0,0.3)] bg-[rgba(245,124,0,0.13)] text-[#f57c00]"
								title="Bureau of Fire Protection"
								description="View & manage fire incidents · Dispatch BFP units"
								enabled={departmentAccess.bfp}
								onToggle={() =>
									setDepartmentAccess((prev) => ({ ...prev, bfp: !prev.bfp }))
								}
							/>
							<ToggleRow
								badgeLabel="CTMO"
								badgeClassName="border border-[rgba(255,179,0,0.30)] bg-[rgba(255,179,0,0.13)] text-[#ffb300]"
								title="Traffic Management"
								description="Read-only cross-department visibility"
								enabled={departmentAccess.ctmo}
								onToggle={() =>
									setDepartmentAccess((prev) => ({ ...prev, ctmo: !prev.ctmo }))
								}
							/>
							<ToggleRow
								badgeLabel="PDRRMO"
								badgeClassName="border border-[rgba(30,136,229,0.30)] bg-[rgba(30,136,229,0.13)] text-[#90caf9]"
								title="Disaster Risk Reduction"
								description="Read-only cross-department visibility"
								enabled={departmentAccess.pdrrmo}
								onToggle={() =>
									setDepartmentAccess((prev) => ({ ...prev, pdrrmo: !prev.pdrrmo }))
								}
							/>
							<ToggleRow
								badgeLabel="PNP"
								badgeClassName="border border-[rgba(156,39,176,0.30)] bg-[rgba(156,39,176,0.13)] text-[#ce93d8]"
								title="Philippine National Police"
								description="Read-only cross-department visibility"
								enabled={departmentAccess.pnp}
								onToggle={() =>
									setDepartmentAccess((prev) => ({ ...prev, pnp: !prev.pnp }))
								}
							/>
						</div>
					</section>

					<section className="overflow-hidden rounded-2xl border border-[#2a2724] bg-[#1e1c1a]">
						<div className="flex items-center border-b border-[#2a2724] px-4 py-3.5">
							<h2 className="flex items-center gap-2 text-base font-semibold text-[#f0ede8]">
								<Shield size={16} className="text-[#f57c00]" />
								Dispatcher Capabilities
							</h2>
						</div>

						<div className="px-4">
							<ToggleRow
								title="Dispatch Units"
								description="Send response teams to incidents"
								enabled={capabilities.dispatchUnits}
								onToggle={() =>
									setCapabilities((prev) => ({
										...prev,
										dispatchUnits: !prev.dispatchUnits,
									}))
								}
							/>
							<ToggleRow
								title="Reject Reports"
								description="Mark reports as invalid or duplicate"
								enabled={capabilities.rejectReports}
								onToggle={() =>
									setCapabilities((prev) => ({
										...prev,
										rejectReports: !prev.rejectReports,
									}))
								}
							/>
							<ToggleRow
								title="Export Reports"
								description="Download CSV and generate reports"
								enabled={capabilities.exportReports}
								onToggle={() =>
									setCapabilities((prev) => ({
										...prev,
										exportReports: !prev.exportReports,
									}))
								}
							/>
							<ToggleRow
								title="Manage Responder Team"
								description="Add or remove unit members"
								enabled={capabilities.manageResponderTeam}
								onToggle={() =>
									setCapabilities((prev) => ({
										...prev,
										manageResponderTeam: !prev.manageResponderTeam,
									}))
								}
							/>
						</div>
					</section>
				</div>
			</div>
		</main>
	);
}
