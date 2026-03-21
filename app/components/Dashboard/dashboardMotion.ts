import type { CSSProperties } from "react";

export const PANEL_ENTRANCE_MS = 440;
export const PANEL_EXIT_MS = 320;

export const PANEL_EASING_IN = "cubic-bezier(0.22, 1, 0.36, 1)";
export const PANEL_EASING_OUT = "cubic-bezier(0.4, 0, 1, 1)";

export const DETAIL_PANEL_WIDTH = "23.125rem";

export const getHeaderTransitionStyle = (
  isVisible: boolean,
): CSSProperties => ({
  transitionDuration: `${isVisible ? PANEL_ENTRANCE_MS : PANEL_EXIT_MS}ms`,
  transitionTimingFunction: isVisible ? PANEL_EASING_IN : PANEL_EASING_OUT,
  willChange: "max-height, transform, opacity",
});

export const getDetailTransitionStyle = (
  isVisible: boolean,
): CSSProperties => ({
  width: isVisible ? DETAIL_PANEL_WIDTH : "0rem",
  transitionDuration: `${isVisible ? PANEL_ENTRANCE_MS : PANEL_EXIT_MS}ms`,
  transitionTimingFunction: isVisible ? PANEL_EASING_IN : PANEL_EASING_OUT,
  willChange: "width, transform, opacity",
});
