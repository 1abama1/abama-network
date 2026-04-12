import { describe, it, expect } from 'vitest';
import { ensureUtc, formatRelative } from '../utils/dateUtils';

describe('dateUtils', () => {
    it('adds Z suffix if missing', () => {
        expect(ensureUtc('2026-04-12T10:00:00')).toBe('2026-04-12T10:00:00Z');
    });

    it('keeps Z suffix if present', () => {
        expect(ensureUtc('2026-04-12T10:00:00Z')).toBe('2026-04-12T10:00:00Z');
    });

    it('formatRelative returns "just now" for recent dates', () => {
        const now = new Date().toISOString();
        expect(formatRelative(now)).toBe('just now');
    });

    it('formatRelative returns minutes for recent dates', () => {
        const fiveMinAgo = new Date(Date.now() - 5 * 60_000).toISOString();
        expect(formatRelative(fiveMinAgo)).toBe('5m');
    });
});
