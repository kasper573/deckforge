import type { Metric } from "web-vitals";
import { getCLS, getFCP, getFID, getLCP, getTTFB } from "web-vitals";
import { z } from "zod";

export interface WebVitalsOptions {
  dsn: string;
  url: string;
}

export function sendWebVitals(options: WebVitalsOptions) {
  try {
    getFID((metric) => sendMetric(metric, options));
    getTTFB((metric) => sendMetric(metric, options));
    getLCP((metric) => sendMetric(metric, options));
    getCLS((metric) => sendMetric(metric, options));
    getFCP((metric) => sendMetric(metric, options));
  } catch (err) {
    console.error("[WebVitals]", err);
  }
}

function getConnectionSpeed() {
  const res = z
    .object({ connection: z.object({ effectiveType: z.string() }) })
    .safeParse(navigator);
  return res.success ? res.data.connection.effectiveType : "";
}

function sendMetric(metric: Metric, { dsn, url }: WebVitalsOptions) {
  const body = {
    dsn,
    id: metric.id,
    page: window.location.pathname,
    href: window.location.href,
    event_name: metric.name,
    value: metric.value.toString(),
    speed: getConnectionSpeed(), // 4g
  };

  const blob = new Blob([new URLSearchParams(body).toString()], {
    type: "application/x-www-form-urlencoded",
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, blob);
  } else {
    fetch(url, {
      body: blob,
      method: "POST",
      credentials: "omit",
      keepalive: true,
    });
  }
}
