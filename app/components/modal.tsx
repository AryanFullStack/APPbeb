"use client";

import React, { useEffect, useRef } from "react";
import { Icon } from "./ui-icon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  confirmVariant?: "teal" | "danger" | "navy";
  onConfirm?: () => void;
  isLoading?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel,
  confirmVariant = "teal",
  onConfirm,
  isLoading = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div
        className="modal-container"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 id="modal-title" className="modal-title">{title}</h3>
            {description && <p className="modal-desc">{description}</p>}
          </div>
          <button
            type="button"
            className="icon-button modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {children && <div className="modal-body">{children}</div>}

        <div className="modal-footer">
          <button
            type="button"
            className="button button-outline button-small"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          {confirmLabel && onConfirm && (
            <button
              type="button"
              className={`button button-small ${
                confirmVariant === "danger"
                  ? "button-danger"
                  : confirmVariant === "navy"
                  ? "button-dark"
                  : "button-teal"
              }`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icon name="loader" size={14} className="spin" /> Processing…
                </>
              ) : (
                confirmLabel
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
