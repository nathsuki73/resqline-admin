"use client";

import React, { useMemo, useState } from "react";
import {
	Bell,
	Lock,
	LucideIcon,
	Monitor,
	Users,
	User,
} from "lucide-react";

type SettingsNavItem = {
	id: string;
	label: string;
	icon: LucideIcon;
	badge?: string;
};

type SettingsNavSection = {
	id: string;
	label: string;
	items: SettingsNavItem[];
};

type SettingsNavProps = {
	defaultActiveItemId?: string;
	onItemSelect?: (itemId: string) => void;
	className?: string;
};

const SETTINGS_SECTIONS: SettingsNavSection[] = [
	{
		id: "account",
		label: "Account",
		items: [
			{
				id: "profile-account",
				label: "Profile & Account",
				icon: User,
			},
		],
	},
	{
		id: "access-control",
		label: "Access Control",
		items: [
			{
				id: "roles-permissions",
				label: "Roles & Permissions",
				icon: Lock,
				badge: "RBAC",
			},
		],
	},
	{
		id: "operations",
		label: "Operations",
		items: [
			{
				id: "responder-units",
				label: "Responder Units",
				icon: Users,
			},
		],
	},
	{
		id: "preferences",
		label: "Preferences",
		items: [
			{
				id: "alerts-sounds",
				label: "Alerts & Sounds",
				icon: Bell,
			},
			{
				id: "display-interface",
				label: "Display & Interface",
				icon: Monitor,
			},
		],
	},
];

const getInitialActiveItem = (
	sections: SettingsNavSection[],
	defaultActiveItemId?: string,
) => {
	const fallbackItem = sections[0]?.items[0]?.id ?? "";
	if (!defaultActiveItemId) return fallbackItem;

	const exists = sections.some((section) =>
		section.items.some((item) => item.id === defaultActiveItemId),
	);

	return exists ? defaultActiveItemId : fallbackItem;
};

export default function SettingsNav({
	defaultActiveItemId,
	onItemSelect,
	className,
}: SettingsNavProps) {
	const initialActiveItem = useMemo(
		() => getInitialActiveItem(SETTINGS_SECTIONS, defaultActiveItemId),
		[defaultActiveItemId],
	);
	const [activeItemId, setActiveItemId] = useState(initialActiveItem);

	const handleSelect = (itemId: string) => {
		setActiveItemId(itemId);
		onItemSelect?.(itemId);
	};

	return (
		<aside
			className={`sticky top-0 flex h-screen w-55 flex-col overflow-hidden border-r border-[#2a2724] bg-[#1e1c1a] text-[#b8b0a6] ${className ?? ""}`}
			aria-label="Settings navigation"
		>
			<div className="border-b border-[#2a2724] px-4 py-6">
				<h2 className="text-2xl font-bold leading-tight text-[#f0ede8]">Settings</h2>
				<p className="mt-1 text-xs text-[#7a7268]">Panel Configuration</p>
			</div>

			<nav className="flex-1 overflow-y-hidden py-4">
				{SETTINGS_SECTIONS.map((section) => (
					<div key={section.id} className="mb-5 last:mb-0">
						<p className="px-4 text-[10px] font-bold uppercase tracking-widest text-[#4a4540]">
							{section.label}
						</p>

						<ul className="mt-1">
							{section.items.map((item) => {
								const isActive = activeItemId === item.id;
								const Icon = item.icon;

								return (
									<li key={item.id}>
										<button
											type="button"
											onClick={() => handleSelect(item.id)}
											className={`group flex w-full items-center justify-between border-l-2 px-4 py-2.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-inset ${
												isActive
													? "border-l-[#f57c00] bg-[rgba(245,124,0,0.13)] text-[#f57c00]"
													: "border-l-transparent text-[#7a7268] hover:bg-[#252220] hover:text-[#b8b0a6]"
											}`}
											aria-current={isActive ? "page" : undefined}
										>
											<span className="flex min-w-0 items-center gap-2">
												<Icon
													size={16}
													className={isActive ? "text-[#f57c00]" : "text-[#4a4540] group-hover:text-[#b8b0a6]"}
												/>
												<span className="truncate whitespace-nowrap text-[13px] font-semibold">{item.label}</span>
											</span>

											{item.badge ? (
												<span className="rounded-full border border-[rgba(229,57,53,0.35)] bg-[rgba(229,57,53,0.12)] px-1.5 py-0.5 text-[10px] font-bold leading-none text-[#ef9a9a]">
													{item.badge}
												</span>
											) : null}
										</button>
									</li>
								);
							})}
						</ul>
					</div>
				))}
			</nav>
		</aside>
	);
}
