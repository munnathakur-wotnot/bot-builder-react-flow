import PropTypes from "prop-types";
import React, { useEffect, useRef, useState } from "react";

export default function CustomSelect({
    options = [],
    value,
    onChange,
    loadMore,
    hasMore,
    placeholder = "Select...",
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const [highlightIndex, setHighlightIndex] = useState(0);

    const wrapperRef = useRef(null);
    const listRef = useRef(null);

    //  Filter
    const filtered = options.filter((opt) =>
        opt.label.toLowerCase().includes(search.toLowerCase()),
    );

    //  Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!wrapperRef.current?.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Keyboard support
    const handleKeyDown = (e) => {
        if (!open) return;

        if (e.key === "ArrowDown") {
            setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            setHighlightIndex((prev) => Math.max(prev - 1, 0));
        } else if (e.key === "Enter") {
            const item = filtered[highlightIndex];
            if (item) {
                onChange(item);
                setOpen(false);
            }
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    //  Infinite scroll
    const handleScroll = () => {
        const el = listRef.current;
        if (!el || !hasMore) return;

        if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
            loadMore?.();
        }
    };

    return (
        <div
            ref={wrapperRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="nodrag nopan"
            style={{ position: "relative", width: 240 }}
        >
            {/* Trigger */}
            <div
                onClick={() => setOpen((o) => !o)}
                style={{
                    border: "1px solid #ccc",
                    padding: "8px 10px",
                    borderRadius: 6,
                    background: "#fff",
                    cursor: "pointer",
                }}
            >
                {value?.label || placeholder}
            </div>

            {/* Dropdown */}
            {open && (
                <div
                    ref={listRef}
                    onScroll={handleScroll}
                    style={{
                        position: "absolute",
                        top: "110%",
                        left: 0,
                        right: 0,
                        maxHeight: 260,
                        background: "#fff",
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        overflow: "auto",
                        zIndex: 9999,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    }}
                >
                    {/* Search */}
                    <input
                        autoFocus
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setHighlightIndex(0);
                        }}
                        placeholder="Search..."
                        style={{
                            width: "100%",
                            padding: 8,
                            border: "none",
                            borderBottom: "1px solid #eee",
                            outline: "none",
                        }}
                    />

                    {/* Options */}
                    {filtered.map((opt, index) => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onChange(opt);
                                setOpen(false);
                            }}
                            style={{
                                padding: "8px 10px",
                                cursor: "pointer",
                                background:
                                    index === highlightIndex
                                        ? "#f5f5f5"
                                        : value?.value === opt.value
                                            ? "#eaeaea"
                                            : "white",
                            }}
                        >
                            {opt.label}
                        </div>
                    ))}

                    {/* Empty */}
                    {filtered.length === 0 && (
                        <div style={{ padding: 10, color: "#999" }}>No results found</div>
                    )}

                    {/* Loader */}
                    {hasMore && (
                        <div style={{ padding: 10, textAlign: "center" }}>Loading...</div>
                    )}
                </div>
            )}
        </div>
    );
}

CustomSelect.propTypes = {
    options: PropTypes.array,
    value: PropTypes.object,
    onChange: PropTypes.func,
    loadMore: PropTypes.bool,
    hasMore: PropTypes.bool,
    placeholder: PropTypes.string,
};
