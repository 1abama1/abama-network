import '@testing-library/jest-dom';

class LocalStorageMock {
    private store: Record<string, string> = {};
    getItem(key: string) { return this.store[key] ?? null; }
    setItem(key: string, value: string) { this.store[key] = value; }
    removeItem(key: string) { delete this.store[key]; }
    clear() { this.store = {}; }
    get length() { return Object.keys(this.store).length; }
    key(index: number) { const keys = Object.keys(this.store); return keys[index] ?? null; }
}

Object.defineProperty(globalThis, 'localStorage', { value: new LocalStorageMock() });
