const MAX = 5;

export function loadRecentSearches(email) {
  if (!email) return [];
  try {
    const raw = localStorage.getItem(`recent_searches_${email}`);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(email, filtersSnapshot) {
  if (!email || !filtersSnapshot || typeof filtersSnapshot !== "object") return;
  const entry = {
    title: filtersSnapshot.title ?? "",
    author: filtersSnapshot.author ?? "",
    keyword: filtersSnapshot.keyword ?? "",
    type: filtersSnapshot.type ?? "",
    year: filtersSnapshot.year ?? ""
  };
  const sig = JSON.stringify(entry);
  let list = loadRecentSearches(email).filter((x) => JSON.stringify(x) !== sig);
  list.unshift(entry);
  list = list.slice(0, MAX);
  localStorage.setItem(`recent_searches_${email}`, JSON.stringify(list));
}

export function clearRecentSearches(email) {
  if (!email) return;
  localStorage.removeItem(`recent_searches_${email}`);
}
