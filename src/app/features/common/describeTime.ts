const timeFormat = new Intl.RelativeTimeFormat("en", { style: "narrow" });

export function describeTime(subject: Date, now = new Date()) {
  const diff = Math.floor((now.getTime() - subject.getTime()) / 1000);
  if (diff < 60) {
    return timeFormat.format(-diff, "second");
  }
  if (diff < 60 * 60) {
    return timeFormat.format(-Math.floor(diff / 60), "minute");
  }
  if (diff < 60 * 60 * 24) {
    return timeFormat.format(-Math.floor(diff / 60 / 60), "hour");
  }
  return timeFormat.format(-Math.floor(diff / 60 / 60 / 24), "day");
}
