export function ensureUtc(dateStr: string): string {
    if (dateStr.endsWith('Z')) return dateStr;
    return dateStr + 'Z';
}

export function formatRelative(dateStr: string): string {
    const d = new Date(ensureUtc(dateStr));
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffHr < 24) return `${diffHr}h`;
    if (diffDay < 7) return `${diffDay}d`;
    return d.toLocaleDateString();
}
