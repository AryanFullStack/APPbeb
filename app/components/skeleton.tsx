import React from "react";

export function Skeleton({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return <div className={`skeleton-shimmer ${className}`} style={style} aria-hidden="true" />;
}

export function JobCardSkeleton() {
  return (
    <div className="job-card skeleton-card">
      <div className="job-card-top">
        <Skeleton className="skeleton-avatar" />
        <div className="job-card-meta">
          <Skeleton style={{ height: "12px", width: "120px", marginBottom: "6px" }} />
          <Skeleton style={{ height: "20px", width: "200px" }} />
        </div>
      </div>
      <div className="job-details">
        <Skeleton style={{ height: "14px", width: "90px" }} />
        <Skeleton style={{ height: "14px", width: "80px" }} />
        <Skeleton style={{ height: "14px", width: "100px" }} />
      </div>
      <div className="job-card-bottom">
        <Skeleton style={{ height: "22px", width: "70px", borderRadius: "999px" }} />
        <Skeleton style={{ height: "16px", width: "80px" }} />
      </div>
    </div>
  );
}
