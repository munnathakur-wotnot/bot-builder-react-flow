import React from "react";

export const Icons = {
  search: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="6.5" cy="6.5" r="4.5" stroke="#667085" strokeWidth="1.5" />
      <path d="M10 10l3 3" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  collect: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  ai: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1l1.5 3.5L13 6l-3.5 1.5L8 11l-1.5-3.5L3 6l3.5-1.5L8 1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  logic: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M2 4h4l2 4 2-4h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  collectInput: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="5" r="2.5" stroke="white" strokeWidth="1.4" />
      <path d="M3 13.5c0-2.485 2.239-4 5-4s5 1.515 5 4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  carousel: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="white" strokeWidth="1.4" />
      <path d="M1 8h2M13 8h2" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  form: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="white" strokeWidth="1.4" />
      <path d="M5 6h6M5 9h4" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  aiAnswer: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5l1.2 3L13 5.8l-3 1.2L8 10.5l-1.2-3.5L3 5.8l3-1.3L8 1.5z" stroke="white" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  ),
  delay: (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6" stroke="white" strokeWidth="1.4" />
      <path d="M8 4.5V8l2.5 1.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

export const MENU_CATEGORIES = [
  {
    id: "collect",
    label: "Collect",
    tabIcon: Icons.collect,
    color: "#2563eb",
    options: [
      { id: "collectInput", label: "Collect Input", icon: Icons.collectInput, color: "#2563eb" },
      { id: "carousel", label: "Carousel", icon: Icons.carousel, color: "#7c3aed" },
      { id: "form", label: "Form", icon: Icons.form, color: "#0891b2" },
    ],
  },
  {
    id: "ai",
    label: "AI",
    tabIcon: Icons.ai,
    color: "#9333ea",
    options: [
      { id: "answer_ai", label: "AI Answer", icon: Icons.aiAnswer, color: "#9333ea" },
    ],
  },
  {
    id: "logic",
    label: "Logic",
    tabIcon: Icons.logic,
    color: "#0ea5e9",
    options: [
      { id: "delay", label: "Delay", icon: Icons.delay, color: "#0ea5e9" },
    ],
  },
];
