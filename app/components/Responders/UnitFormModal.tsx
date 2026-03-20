import { PencilLine, Plus, X } from "lucide-react";

import {
	CLASSNAMES,
	MODAL_EXIT_MS,
	UNIT_TYPE_OPTIONS,
} from "./responderConstants";
import type { ResponderStatus, UnitFormData, UnitFormErrors, UnitModalMode } from "./responderTypes";
import FormField from "./FormField";
import useModalDissolve from "../settings/ui/useModalDissolve";

interface UnitFormModalProps {
	isOpen: boolean;
	mode: UnitModalMode;
	formData: UnitFormData;
	errors: UnitFormErrors;
	onClose: () => void;
	onFieldChange: (field: keyof UnitFormData, value: string) => void;
	onSubmit: () => void;
}

export default function UnitFormModal({
	isOpen,
	mode,
	formData,
	errors,
	onClose,
	onFieldChange,
	onSubmit,
}: UnitFormModalProps) {
	const { shouldRender, isVisible } = useModalDissolve(isOpen, MODAL_EXIT_MS);

	if (!shouldRender) return null;

	const title = mode === "add" ? "Add Response Unit" : "Edit Response Unit";
	const actionLabel = mode === "add" ? "Add Unit" : "Save Changes";

	return (
		<div
			className={`modal-overlay-dissolve fixed inset-0 z-(--z-modal) flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm ${
				isVisible ? "is-open" : "is-closed"
			}`}
		>
			<div
				className={`modal-card-dissolve w-full max-w-2xl rounded-2xl border border-(--color-border-1) bg-[#1e1c1a] shadow-2xl ${
					isVisible ? "is-open" : "is-closed"
				}`}
			>
				<header className="flex items-start justify-between border-b border-(--color-border-1) px-6 py-4">
					<div>
						<h3 className="text-xl font-bold text-[#f0ede8]">{title}</h3>
						<p className="mt-1 text-xs text-[#7a7268]">
							Maintain a clean and accurate roster for live dispatch operations.
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="ml-4 flex h-8 w-8 items-center justify-center rounded-lg text-[#7a7268] transition-colors hover:bg-[#252220] hover:text-[#f0ede8]"
						aria-label="Close unit form modal"
					>
						<X size={16} />
					</button>
				</header>

				<div className="grid gap-4 px-6 py-5 md:grid-cols-2">
					<FormField label="Unit Code" error={errors.unitCode}>
						<input
							type="text"
							value={formData.unitCode}
							onChange={(e) => onFieldChange("unitCode", e.target.value.toUpperCase())}
							placeholder="e.g., B9"
							className={CLASSNAMES.fieldControl}
						/>
					</FormField>

					<FormField label="Unit Name" error={errors.unitName}>
						<input
							type="text"
							value={formData.unitName}
							onChange={(e) => onFieldChange("unitName", e.target.value)}
							placeholder="e.g., BFP-QC-9 - Engine Co."
							className={CLASSNAMES.fieldControl}
						/>
					</FormField>

					<FormField label="Unit Type" error={errors.unitType}>
						<select
							value={formData.unitType}
							onChange={(e) => onFieldChange("unitType", e.target.value)}
							className={CLASSNAMES.fieldControl}
						>
							{UNIT_TYPE_OPTIONS.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</FormField>

					<FormField label="Crew Count" error={errors.personnelCount}>
						<input
							type="number"
							min={1}
							max={20}
							value={formData.personnelCount}
							onChange={(e) => onFieldChange("personnelCount", e.target.value)}
							placeholder="e.g., 5"
							className={CLASSNAMES.fieldControl}
						/>
					</FormField>

					<FormField label="Radio Channel">
						<input
							type="text"
							value={formData.radioChannel}
							onChange={(e) => onFieldChange("radioChannel", e.target.value)}
							placeholder="e.g., Alpha-3"
							className={CLASSNAMES.fieldControl}
						/>
					</FormField>

					<FormField label="Station / Coverage Area">
						<input
							type="text"
							value={formData.stationArea}
							onChange={(e) => onFieldChange("stationArea", e.target.value)}
							placeholder="e.g., Quezon Ave Station"
							className={CLASSNAMES.fieldControl}
						/>
					</FormField>

					<FormField label="Unit Contact">
						<input
							type="text"
							value={formData.contactNumber}
							onChange={(e) => onFieldChange("contactNumber", e.target.value)}
							placeholder="e.g., +63 917 000 0000"
							className={CLASSNAMES.fieldControl}
						/>
					</FormField>

					<FormField label="Status">
						<select
							value={formData.status}
							onChange={(e) => onFieldChange("status", e.target.value as ResponderStatus)}
							className={CLASSNAMES.fieldControl}
						>
							<option value="standby">Standby</option>
							<option value="en-route">En Route</option>
							<option value="on-scene">On Scene</option>
							<option value="active">Active</option>
						</select>
					</FormField>
				</div>

				<footer className="flex justify-end gap-2 border-t border-(--color-border-1) px-6 py-4">
					<button type="button" onClick={onClose} className="ui-btn ui-btn-secondary">
						Cancel
					</button>
					<button type="button" onClick={onSubmit} className="ui-btn ui-btn-primary">
						{mode === "add" ? <Plus size={14} /> : <PencilLine size={14} />}
						{actionLabel}
					</button>
				</footer>
			</div>
		</div>
	);
}
