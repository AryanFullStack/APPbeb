"use client";

import { useEffect } from "react";
import { trackAnalytics, type AnalyticsEventName } from "../lib/analytics";

export function AnalyticsEvent({ event, jobId }: { event: AnalyticsEventName; jobId?: string }) { useEffect(() => { trackAnalytics(event, window.location.pathname, jobId); }, [event, jobId]); return null; }
export function TrackedOutboundLink({ href, children, jobId }: { href: string; children: React.ReactNode; jobId?: string }) { return <a href={href} target="_blank" rel="noreferrer" onClick={() => trackAnalytics("outbound_application_click", window.location.pathname, jobId)}>{children}</a>; }
