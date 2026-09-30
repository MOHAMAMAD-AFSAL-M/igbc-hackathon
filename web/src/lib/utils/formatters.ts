export function formatPower(kw: number | undefined | null): string {
  if (kw === undefined || kw === null) return "0 kW";
  return `${Number(kw).toLocaleString("en-IN", { maximumFractionDigits: 1 })} kW`;
}

export function formatEnergy(kwh: number | undefined | null): string {
  if (kwh === undefined || kwh === null) return "0 kWh";
  return `${Number(kwh).toLocaleString("en-IN", { maximumFractionDigits: 1 })} kWh`;
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null) return "₹0";
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

export function formatPercent(value: number | undefined | null): string {
  if (value === undefined || value === null) return "0%";
  return `${Math.round(value)}%`;
}

export function formatDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}

export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 5) return "just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}
