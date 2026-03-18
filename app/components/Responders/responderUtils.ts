import type { ResponderUnit, UnitFormData, UnitFormErrors, UnitPayload } from "./responderTypes";

export const buildSubtitle = (unit: ResponderUnit) => {
	const details = [unit.stationArea, unit.radioChannel].filter(Boolean).join(" | ");
	const base = `${unit.personnelCount} personnel - ${unit.unitType}`;
	return details ? `${base} | ${details}` : base;
};

export const toFormData = (unit: ResponderUnit): UnitFormData => ({
	unitCode: unit.unitCode,
	unitName: unit.unitName,
	unitType: unit.unitType,
	personnelCount: String(unit.personnelCount),
	radioChannel: unit.radioChannel,
	stationArea: unit.stationArea,
	contactNumber: unit.contactNumber,
	status: unit.status,
});

export const normalizeUnitCode = (value: string) => value.trim().toUpperCase();

export const hasActiveUnitCodeConflict = (units: ResponderUnit[], code: string, excludedUnitId: string | null) =>
	units.some((unit) => unit.unitCode.toUpperCase() === code && unit.id !== excludedUnitId && unit.isActive);

export const validateUnitFormData = (
	form: UnitFormData,
	units: ResponderUnit[],
	editingUnitId: string | null
): UnitFormErrors => {
	const errors: UnitFormErrors = {};
	const normalizedCode = normalizeUnitCode(form.unitCode);

	if (!normalizedCode) {
		errors.unitCode = "Unit code is required.";
	}
	if (!form.unitName.trim()) {
		errors.unitName = "Unit name is required.";
	}
	if (!form.unitType.trim()) {
		errors.unitType = "Unit type is required.";
	}
	if (!form.personnelCount.trim()) {
		errors.personnelCount = "Crew count is required.";
	} else {
		const count = Number(form.personnelCount);
		if (!Number.isFinite(count) || count < 1) {
			errors.personnelCount = "Crew count must be 1 or greater.";
		}
	}

	if (normalizedCode && hasActiveUnitCodeConflict(units, normalizedCode, editingUnitId)) {
		errors.unitCode = "Unit code already exists in active roster.";
	}

	return errors;
};

export const toUnitPayload = (form: UnitFormData): UnitPayload => ({
	unitCode: normalizeUnitCode(form.unitCode),
	unitName: form.unitName.trim(),
	unitType: form.unitType.trim(),
	personnelCount: Number(form.personnelCount),
	radioChannel: form.radioChannel.trim(),
	stationArea: form.stationArea.trim(),
	contactNumber: form.contactNumber.trim(),
	status: form.status,
});
