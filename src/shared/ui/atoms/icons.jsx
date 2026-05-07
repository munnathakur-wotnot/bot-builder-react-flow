/**
 * Shared icon components — single source of truth for the entire application.
 * Import from here in any feature file:
 *   import { InfoIcon, TrashIcon } from "../../../../shared/ui/atoms/icons";
 */
import React from "react";

/* ── Generic UI icons ───────────────────────────────────────── */

export const InfoIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const ExternalLinkIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const ChevronIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export const CheckIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const TrashIcon = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

export const DragIcon = () => (
  <svg
    width="10"
    height="14"
    viewBox="0 0 10 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <circle cx="2.5" cy="2" r="1.5" fill="currentColor" />
    <circle cx="7.5" cy="2" r="1.5" fill="currentColor" />
    <circle cx="2.5" cy="7" r="1.5" fill="currentColor" />
    <circle cx="7.5" cy="7" r="1.5" fill="currentColor" />
    <circle cx="2.5" cy="12" r="1.5" fill="currentColor" />
    <circle cx="7.5" cy="12" r="1.5" fill="currentColor" />
  </svg>
);

export const CardIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="2" y="2" width="20" height="20" rx="3" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

/* ── Context-menu / node-type icons (object map) ────────────── */

export const Icons = {
  search: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="#667085" strokeWidth="1.5" />
      <path
        d="M10 10l3 3"
        stroke="#667085"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  collect: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  ai: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  ),
  logic: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path
        d="M2 4h4l2 4 2-4h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 12h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8 8v4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  collectInput: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="2.5" stroke="white" strokeWidth="1.4" />
      <path
        d="M3 13.5c0-2.485 2.239-4 5-4s5 1.515 5 4"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  carousel: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect
        x="4"
        y="4"
        width="8"
        height="8"
        rx="1.5"
        stroke="white"
        strokeWidth="1.4"
      />
      <path
        d="M1 8h2M13 8h2"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  form: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect
        x="2.5"
        y="2.5"
        width="11"
        height="11"
        rx="2"
        stroke="white"
        strokeWidth="1.4"
      />
      <path
        d="M5 6h6M5 9h4"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ),
  aiAnswer: (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
      <path
        d="M8 1.5l1.2 3L13 5.8l-3 1.2L8 10.5l-1.2-3.5L3 5.8l3-1.3L8 1.5z"
        stroke="white"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  ),
  delay: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.4" />
      <path
        d="M8 4.5V8l2.5 1.5"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  jump: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2H5.50003L4.00003 3.5L6.83581 6.33579L0.585815 12.5858L3.41424 15.4142L9.66424 9.16421L12.5 12L14 10.5L14 2Z"
        fill="#000000"
      />
    </svg>
  ),
  condition: (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect width="20" height="20" rx="4" fill="#0BA5EC"></rect>
      <path
        d="M11.5 6.5H12.5C13.0523 6.5 13.5 6.94772 13.5 7.5V11.5854C14.0826 11.7913 14.5 12.3469 14.5 13C14.5 13.8285 13.8285 14.5 13 14.5C12.1715 14.5 11.5 13.8285 11.5 13C11.5 12.3469 11.9174 11.7913 12.5 11.5854V7.5H11.5V9L9.25 7L11.5 5V6.5ZM6.5 8.41465C5.91741 8.20873 5.5 7.65311 5.5 7C5.5 6.17158 6.17158 5.5 7 5.5C7.82842 5.5 8.5 6.17158 8.5 7C8.5 7.65311 8.08259 8.20873 7.5 8.41465V11.5854C8.08259 11.7913 8.5 12.3469 8.5 13C8.5 13.8285 7.82842 14.5 7 14.5C6.17158 14.5 5.5 13.8285 5.5 13C5.5 12.3469 5.91741 11.7913 6.5 11.5854V8.41465Z"
        fill="white"
      ></path>
    </svg>
  ),
  flow: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="5" width="6" height="4" rx="1.2" stroke="white" strokeWidth="1.3" />
      <rect x="9" y="2" width="6" height="4" rx="1.2" stroke="white" strokeWidth="1.3" />
      <rect x="9" y="10" width="6" height="4" rx="1.2" stroke="white" strokeWidth="1.3" />
      <path d="M7 7h1.5M8.5 4h-2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  ),
};

// ── Toolbar icons ────────────────────────────────────────────────
export const CopyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
export const CloneIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <line x1="12" y1="8" x2="12" y2="16" />
    <line x1="8" y1="12" x2="16" y2="12" />
  </svg>
);
export const DeleteIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
