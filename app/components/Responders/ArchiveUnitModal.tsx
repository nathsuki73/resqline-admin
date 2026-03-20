import { AlertTriangle, Trash2, X } from "lucide-react";

import { MODAL_EXIT_MS } from "./responderConstants";
import type { ResponderUnit } from "./responderTypes";
import useModalDissolve from "../settings/ui/useModalDissolve";

interface ArchiveUnitModalProps {
	isOpen: boolean;
	unit: ResponderUnit | null;
	onCancel: () => void;
	onConfirm: () => void;
}

export default function ArchiveUnitModal({ isOpen, unit, onCancel, onConfirm }: ArchiveUnitModalProps) {
	const { shouldRender, isVisible } = useModalDissolve(isOpen, MODAL_EXIT_MS);

	if (!shouldRender || !unit) return null;

	return (
		<div
			className={`modal-overlay-dissolve fixed inset-0 z-(--z-modal) flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm ${
				isVisible ? "is-open" : "is-closed"
			}`}
		>
			<div
				className={`modal-card-dissolve w-full max-w-md rounded-2xl border border-(--color-border-1) bg-[#1e1c1a] shadow-2xl ${
					isVisible ? "is-open" : "is-closed"
				}`}
			>
				<header className="flex items-center justify-between border-b border-(--color-border-1) px-5 py-4">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[rgba(229,57,53,0.35)] bg-[rgba(229,57,53,0.12)] text-[#ef9a9a]">
							<AlertTriangle size={16} />
						</div>
						<h3 className="text-base font-semibold text-[#f0ede8]">Archive Unit</h3>
					</div>
					<button
						type="button"
						onClick={onCancel}
						className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7a7268] transition-colors hover:bg-[#252220] hover:text-[#f0ede8]"
						aria-label="Close archive modal"
					>
						<X size={16} />
					</button>
				</header>

				<div className="px-5 py-4">
					<p className="text-sm text-[#b8b0a6]">
						Archive <span className="font-semibold text-[#f0ede8]">{unit.unitCode}</span> from active roster?
					</p>
					<p className="mt-2 text-xs text-[#7a7268]">Archived units can be restored later.</p>
				</div>

				<footer className="flex justify-end gap-2 border-t border-(--color-border-1) px-5 py-4">
					<button type="button" onClick={onCancel} className="ui-btn ui-btn-secondary">
						Cancel
					</button>
					<button
						type="button"
						onClick={onConfirm}
						className="ui-btn border border-[rgba(229,57,53,0.35)] bg-[rgba(229,57,53,0.12)] text-[#ef9a9a] hover:bg-[rgba(229,57,53,0.2)]"
					>
						<Trash2 size={14} />
						Archive Unit
					</button>
				</footer>
			</div>
		</div>
	);
}
