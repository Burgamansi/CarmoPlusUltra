export function saveJSON(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
}

export function loadJSON<T = any>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
        return JSON.parse(raw) as T;
    } catch {
        return fallback;
    }
}

export function removeKey(key: string) {
    localStorage.removeItem(key);
}
