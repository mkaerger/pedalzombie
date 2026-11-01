import { useCallback, useState } from 'react';

/**
 * Which panels the visitor folded away, per pedal: localStorage[`${storageKey}_panels`] = ["dips", "tools"].
 * localStorage can throw (private mode, blocked site data) — then the state simply lives for the page.
 */
function read(key: string): string[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function write(key: string, ids: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(ids));
  } catch {
    /* keep going without persistence */
  }
}

export function usePanelCollapsed(storageKey: string, id: string): [boolean, () => void] {
  const key = `${storageKey}_panels`;
  const [collapsed, setCollapsed] = useState(() => read(key).includes(id));
  const toggle = useCallback(() => {
    setCollapsed((was) => {
      const next = !was;
      const ids = read(key).filter((x) => x !== id);
      write(key, next ? [...ids, id] : ids);
      return next;
    });
  }, [key, id]);
  return [collapsed, toggle];
}
