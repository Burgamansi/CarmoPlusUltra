export const STORAGE_KEYS = {
    MEMBERS: 'carmo_ultra_members_v1',
    HOME_NOTES: 'carmo_ultra_home_notes_v1'
};

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

// Helpers specific for Members to ensure consistency
export function getMembersLS() {
    return loadJSON(STORAGE_KEYS.MEMBERS, []);
}

export function setMembersLS(members: any[]) {
    saveJSON(STORAGE_KEYS.MEMBERS, members);
}

