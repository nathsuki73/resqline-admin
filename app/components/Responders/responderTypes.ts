export type ResponderStatus = "en-route" | "on-scene" | "standby" | "active";
export type ResponderGroupId = "bfp" | "cross";
export type ChipTone = "orange" | "amber" | "purple";

export type ResponderUnit = {
	id: string;
	unitCode: string;
	unitName: string;
	unitType: string;
	personnelCount: number;
	radioChannel: string;
	stationArea: string;
	contactNumber: string;
	status: ResponderStatus;
	group: ResponderGroupId;
	chipTone?: ChipTone;
	isActive: boolean;
	updatedAt: string;
};

export type UnitGroupConfig = {
	id: ResponderGroupId;
	title: string;
	showAddButton: boolean;
	managed: boolean;
	emptyMessage: string;
};

export type UnitFormData = {
	unitCode: string;
	unitName: string;
	unitType: string;
	personnelCount: string;
	radioChannel: string;
	stationArea: string;
	contactNumber: string;
	status: ResponderStatus;
};

export type UnitFormErrors = Partial<Record<keyof UnitFormData, string>>;
export type UnitPayload = Omit<ResponderUnit, "id" | "group" | "chipTone" | "isActive" | "updatedAt">;
export type UnitModalMode = "add" | "edit";
