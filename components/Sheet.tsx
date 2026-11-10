"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "./Icons";
import { onBackButton } from "@/lib/device";

type SheetProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  /** Tall sheets keep text fields high on the screen, above the keyboard. */
  tall?: boolean;
};

/** A panel that slides up from the bottom of the screen. */
export default function Sheet({ title, onClose, children, tall = false }: SheetProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Android back button and the Escape key close the sheet.
  useEffect(() => {
    let cancelled = false;
    let handle: { remove: () => Promise<void> } | null = null;

    onBackButton(() => onCloseRef.current()).then((h) => {
      if (cancelled) void h?.remove();
      else handle = h;
    });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelled = true;
      void handle?.remove();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close"
        className="animate-fade-in absolute inset-0 bg-black/70 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`animate-sheet-in pb-safe relative flex max-h-[88dvh] flex-col rounded-t-[28px] border-t border-line bg-card ${
          tall ? "min-h-[72dvh]" : ""
        }`}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-line" />
        <div className="flex items-center justify-between px-6 pb-2 pt-3">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-muted active:bg-elevated"
          >
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}