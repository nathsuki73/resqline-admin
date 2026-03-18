import type { ReactNode } from "react";

interface FormFieldProps {
	label: string;
	children: ReactNode;
	error?: string;
}

export default function FormField({ label, children, error }: FormFieldProps) {
	return (
		<div className="flex flex-col gap-1.5">
			<label className="text-[10px] font-bold uppercase tracking-widest text-[#7a7268]">{label}</label>
			{children}
			{error ? <p className="text-[10px] text-[#ef9a9a]">{error}</p> : null}
		</div>
	);
}
