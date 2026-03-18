"use client";

import { useMemo, useState } from "react";

import ArchiveUnitModal from "./ArchiveUnitModal";
import SectionCard from "./SectionCard";
import UnitFormModal from "./UnitFormModal";
import {
	CLASSNAMES,
	DEFAULT_UNIT_FORM,
	INITIAL_RESPONDERS,
	UNIT_GROUPS,
} from "./responderConstants";
import type {
	ResponderGroupId,
	ResponderUnit,
	UnitFormData,
	UnitFormErrors,
	UnitModalMode,
} from "./responderTypes";
import {
	hasActiveUnitCodeConflict,
	toFormData,
	toUnitPayload,
	validateUnitFormData,
} from "./responderUtils";

export default function ResponderSection() {
	const [units, setUnits] = useState<ResponderUnit[]>(INITIAL_RESPONDERS);
	const [unitPendingArchive, setUnitPendingArchive] = useState<ResponderUnit | null>(null);
	const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
	const [unitModalMode, setUnitModalMode] = useState<UnitModalMode>("add");
	const [editingUnitId, setEditingUnitId] = useState<string | null>(null);
	const [unitForm, setUnitForm] = useState<UnitFormData>(DEFAULT_UNIT_FORM);
	const [formErrors, setFormErrors] = useState<UnitFormErrors>({});

	const unitsByGroup = useMemo(() => {
		return units.reduce<Record<ResponderGroupId, ResponderUnit[]>>(
			(acc, unit) => {
				acc[unit.group].push(unit);
				return acc;
			},
			{ bfp: [], cross: [] }
		);
	}, [units]);

	const openAddUnitModal = () => {
		setUnitModalMode("add");
		setEditingUnitId(null);
		setUnitForm(DEFAULT_UNIT_FORM);
		setFormErrors({});
		setIsUnitModalOpen(true);
	};

	const openEditUnitModal = (unit: ResponderUnit) => {
		setUnitModalMode("edit");
		setEditingUnitId(unit.id);
		setUnitForm(toFormData(unit));
		setFormErrors({});
		setIsUnitModalOpen(true);
	};

	const closeUnitModal = () => {
		setIsUnitModalOpen(false);
		setEditingUnitId(null);
		setUnitForm(DEFAULT_UNIT_FORM);
		setFormErrors({});
	};

	const handleUnitFormChange = (field: keyof UnitFormData, value: string) => {
		setUnitForm((prev) => ({ ...prev, [field]: value }));
		if (formErrors[field]) {
			setFormErrors((prev) => ({ ...prev, [field]: undefined }));
		}
	};

	const validateUnitForm = () => {
		const errors = validateUnitFormData(unitForm, units, editingUnitId);
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSaveUnit = () => {
		if (!validateUnitForm()) {
			return;
		}

		const payload = toUnitPayload(unitForm);
 		const nowIso = new Date().toISOString();

		if (unitModalMode === "add") {
			const newUnit: ResponderUnit = {
				id: `unit-${Date.now()}`,
				group: "bfp",
				chipTone: "orange",
				isActive: true,
				updatedAt: nowIso,
				...payload,
			};
			setUnits((prev) => [newUnit, ...prev]);
		} else if (editingUnitId) {
			setUnits((prev) =>
				prev.map((unit) =>
					unit.id === editingUnitId
						? {
							...unit,
							...payload,
							updatedAt: nowIso,
						}
						: unit
				)
			);
		}

		closeUnitModal();
	};

	const handleArchiveRequest = (unit: ResponderUnit) => {
		if (!unit.isActive || unit.group !== "bfp") return;
		setUnitPendingArchive(unit);
	};

	const handleArchiveConfirm = () => {
		if (!unitPendingArchive) return;
		const nowIso = new Date().toISOString();

		setUnits((prev) =>
			prev.map((unit) =>
				unit.id === unitPendingArchive.id
					? { ...unit, isActive: false, updatedAt: nowIso }
					: unit
			)
		);
		setUnitPendingArchive(null);
	};

	const handleRestoreUnit = (target: ResponderUnit) => {
		const duplicateExists = hasActiveUnitCodeConflict(units, target.unitCode.toUpperCase(), target.id);
		if (duplicateExists) {
			setFormErrors({ unitCode: `Cannot restore ${target.unitCode}. Active duplicate code exists.` });
			setUnitModalMode("edit");
			setEditingUnitId(target.id);
			setUnitForm(toFormData(target));
			setIsUnitModalOpen(true);
			return;
		}

		setUnits((prev) =>
			prev.map((unit) =>
				unit.id === target.id ? { ...unit, isActive: true, updatedAt: new Date().toISOString() } : unit
			)
		);
	};

	return (
		<>
			<main className="flex h-screen flex-1 flex-col bg-(--color-bg) p-4">
				<header className="mb-4">
					<div>
						<h1 className={CLASSNAMES.pageTitle}>Responder Units</h1>
						<p className={CLASSNAMES.pageSubtitle}>Manage your active dispatchers and field units</p>
					</div>
				</header>

				<div className="space-y-3">
					{UNIT_GROUPS.map((group) => (
						<SectionCard
							key={group.id}
							title={group.title}
							units={unitsByGroup[group.id]}
							showAddButton={group.showAddButton}
							managed={group.managed}
							emptyMessage={group.emptyMessage}
							onAddUnit={group.id === "bfp" ? openAddUnitModal : undefined}
							onEditUnit={group.id === "bfp" ? openEditUnitModal : undefined}
							onArchiveUnit={group.id === "bfp" ? handleArchiveRequest : undefined}
							onRestoreUnit={group.id === "bfp" ? handleRestoreUnit : undefined}
						/>
					))}
				</div>
			</main>

			<UnitFormModal
				isOpen={isUnitModalOpen}
				mode={unitModalMode}
				formData={unitForm}
				errors={formErrors}
				onClose={closeUnitModal}
				onFieldChange={handleUnitFormChange}
				onSubmit={handleSaveUnit}
			/>

			<ArchiveUnitModal
				isOpen={Boolean(unitPendingArchive)}
				unit={unitPendingArchive}
				onCancel={() => setUnitPendingArchive(null)}
				onConfirm={handleArchiveConfirm}
			/>
		</>
	);
}
