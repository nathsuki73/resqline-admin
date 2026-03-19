"use client";

import React, { useMemo, useState } from "react";
import {
	Bell,
	Lock,
	LucideIcon,
	Monitor,
	ShieldCheck,
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
			className={`flex w-72 flex-col border-r border-orange-500/10 bg-[#111111] text-gray-300 ${className ?? ""}`}
			aria-label="Settings navigation"
		>
			<div className="border-b border-white/5 px-5 py-6">
				<h2 className="text-xl font-semibold tracking-tight text-gray-100">Settings</h2>
				<p className="mt-1 text-sm text-gray-500">Panel Configuration</p>
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-4 custom-scrollbar">
				{SETTINGS_SECTIONS.map((section) => (
					<div key={section.id} className="mb-6 last:mb-0">
						<p className="px-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-600">
							{section.label}
						</p>

						<ul className="mt-2 space-y-1">
							{section.items.map((item) => {
								const isActive = activeItemId === item.id;
								const Icon = item.icon;

								return (
									<li key={item.id}>
										<button
											type="button"
											onClick={() => handleSelect(item.id)}
											className={`group flex w-full items-center justify-between rounded-lg border px-3 py-2.5 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#111111] ${
												isActive
													? "border-orange-500/40 bg-orange-500/12 text-orange-400"
													: "border-transparent text-gray-400 hover:border-white/10 hover:bg-white/5 hover:text-gray-200"
											}`}
											aria-current={isActive ? "page" : undefined}
										>
											<span className="flex items-center gap-2.5">
												<Icon
													size={16}
													className={isActive ? "text-orange-400" : "text-gray-500 group-hover:text-gray-300"}
												/>
												<span className="text-sm font-medium">{item.label}</span>
											</span>

											{item.badge ? (
												<span className="rounded-full border border-red-500/40 bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold leading-none tracking-wide text-red-300">
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

			<div className="border-t border-white/5 p-4 text-xs text-gray-500">
				<div className="flex items-center gap-2">
					<ShieldCheck size={14} className="text-orange-400" />
					<span>Security-first configuration panel</span>
				</div>
			</div>
		</aside>
	);
}
