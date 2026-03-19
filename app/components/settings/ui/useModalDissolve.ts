"use client";

import { useEffect, useState } from "react";

const DEFAULT_EXIT_MS = 260;

export default function useModalDissolve(open: boolean, exitMs = DEFAULT_EXIT_MS) {
	const [shouldRender, setShouldRender] = useState(open);
	const [isVisible, setIsVisible] = useState(open);

	useEffect(() => {
		if (open) {
			setShouldRender(true);
			const rafId = window.requestAnimationFrame(() => {
				setIsVisible(true);
			});

			return () => {
				window.cancelAnimationFrame(rafId);
			};
		}

		setIsVisible(false);
		const timeoutId = window.setTimeout(() => {
			setShouldRender(false);
		}, exitMs);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [open, exitMs]);

	return { shouldRender, isVisible };
}
