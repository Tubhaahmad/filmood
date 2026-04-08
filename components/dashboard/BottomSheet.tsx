"use client";

import { useEffect, useRef, useCallback } from "react";

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  accentColor?: string;
}

export default function BottomSheet({
  isOpen,
  onClose,
  children,
  accentColor,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const currentTranslateY = useRef(0);
  const isDragging = useRef(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Drag-to-dismiss handlers
  const handleDragStart = useCallback((clientY: number) => {
    isDragging.current = true;
    dragStartY.current = clientY;
    currentTranslateY.current = 0;
    if (sheetRef.current) {
      sheetRef.current.style.transition = "none";
    }
  }, []);

  const handleDragMove = useCallback((clientY: number) => {
    if (!isDragging.current || !sheetRef.current) return;
    const delta = clientY - dragStartY.current;
    // Only allow dragging downward
    const translateY = Math.max(0, delta);
    currentTranslateY.current = translateY;
    sheetRef.current.style.transform = `translateY(${translateY}px)`;
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!isDragging.current || !sheetRef.current) return;
    isDragging.current = false;
    sheetRef.current.style.transition =
      "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)";
    // If dragged more than 120px down, dismiss
    if (currentTranslateY.current > 120) {
      onClose();
    } else {
      sheetRef.current.style.transform = "translateY(0)";
    }
    currentTranslateY.current = 0;
  }, [onClose]);

  // Touch events
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY),
    [handleDragStart],
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY),
    [handleDragMove],
  );
  const onTouchEnd = useCallback(() => handleDragEnd(), [handleDragEnd]);

  // Mouse events (for desktop testing)
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientY);

      const onMove = (ev: MouseEvent) => handleDragMove(ev.clientY);
      const onUp = () => {
        handleDragEnd();
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [handleDragStart, handleDragMove, handleDragEnd],
  );

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 90,
          background: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(2px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 91,
          maxHeight: "88vh",
          background: "var(--surface)",
          borderTop: "1px solid var(--border-h)",
          borderRadius: "20px 20px 0 0",
          boxShadow: "0 -8px 40px rgba(0, 0, 0, 0.25)",
          transform: isOpen ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          willChange: "transform",
          overflow: "hidden",
        }}
      >
        {/* Accent top line */}
        {accentColor && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: `linear-gradient(90deg, transparent 0%, ${accentColor} 30%, ${accentColor} 70%, transparent 100%)`,
              opacity: 0.6,
              borderRadius: "20px 20px 0 0",
            }}
          />
        )}

        {/* Drag handle area */}
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          style={{
            padding: "12px 0 8px",
            cursor: "grab",
            flexShrink: 0,
            display: "flex",
            justifyContent: "center",
            touchAction: "none",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "4px",
              borderRadius: "2px",
              background: accentColor || "var(--border-active)",
              opacity: accentColor ? 0.5 : 1,
            }}
          />
        </div>

        {/* Scrollable content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "0 20px 24px",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
