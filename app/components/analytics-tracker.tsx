"use client";

import { useEffect } from "react";
import { trackAnalytics } from "../lib/analytics";

export function AnalyticsTracker() {
  useEffect(() => {
    trackAnalytics("page_view");
  }, []);
  return null;
}
