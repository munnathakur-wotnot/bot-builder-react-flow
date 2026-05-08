import React, { useCallback, useEffect, useRef, useState } from "react";
import "./Toast.css";

/* ── Hook ─────────────────────────────────────────────────────── */
let _externalPush = null;

/**
 * Call useToast() once at the top of the tree (Canvas).
 * Returns { toasts, pushToast, ToastContainer }.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const pushToast = useCallback((message, type = "info", duration = 2800) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, message, type, leaving: false }]);

    // Start leave animation before removal
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)),
      );
    }, duration);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration + 200);
  }, []);

  // Expose globally so useFlowPaste / useNodeActions can call it
  useEffect(() => {
    _externalPush = pushToast;
    return () => { _externalPush = null; };
  }, [pushToast]);

  return { toasts, pushToast, ToastContainer: () => <ToastContainer toasts={toasts} /> };
}

/** Call from anywhere outside React (e.g. event handlers in hooks) */
export function pushToastGlobal(message, type = "info", duration = 2800) {
  _externalPush?.(message, type, duration);
}

/* ── Icons ────────────────────────────────────────────────────── */
const SuccessIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="#16a34a" />
    <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ErrorIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="#dc2626" />
    <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const InfoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" fill="#2563eb" />
    <path d="M8 7v4" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />
    <circle cx="8" cy="5.2" r="0.8" fill="#fff" />
  </svg>
);

const ICONS = { success: <SuccessIcon />, error: <ErrorIcon />, info: <InfoIcon /> };

/* ── Renderer ─────────────────────────────────────────────────── */
function ToastContainer({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}${t.leaving ? " toast--leaving" : ""}`}
        >
          <span className="toast__icon">{ICONS[t.type] ?? ICONS.info}</span>
          <span className="toast__msg">{t.message}</span>
        </div>
      ))}
    </div>
  );
}
