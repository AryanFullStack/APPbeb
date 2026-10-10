import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  copy,
  action,
}: {
  eyebrow?: string;
  title: string;
  copy?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
