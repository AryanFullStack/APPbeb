import React from "react";
import { Icon, type IconName } from "./ui-icon";

interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionHref?: string;
}

export function EmptyState({
  icon = "search",
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon-box">
        <Icon name={icon} size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && (
        <div className="empty-state-action">
          {actionHref ? (
            <a href={actionHref} className="button button-outline button-small">
              {actionLabel}
            </a>
          ) : onAction ? (
            <button
              type="button"
              className="button button-outline button-small"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          ) : null}
        </div>
      )}
    </div>
  );
}
