import { api } from "./api";
import { cleanDisplayText } from "../utils/cleanDisplayText";

const SUMMON_FAV_STORAGE = "favorites_ucp";

export function loadSummonFavoriteIds() {
  try {
    const raw = localStorage.getItem(SUMMON_FAV_STORAGE);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.map((e) => e && e.id).filter(Boolean));
  } catch {
    return new Set();
  }
}

export function loadSummonFavoriteEntries() {
  try {
    const raw = localStorage.getItem(SUMMON_FAV_STORAGE);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persistSummonFavorites(entries) {
  localStorage.setItem(SUMMON_FAV_STORAGE, JSON.stringify(entries));
}

export function toggleSummonFavoriteInStorage(item) {
  const id = item && (item.summonId || item._id || item.id);
  if (!id) return loadSummonFavoriteIds();

  const entries = loadSummonFavoriteEntries();
  const idx = entries.findIndex((e) => e.id === id);
  if (idx >= 0) {
    entries.splice(idx, 1);
  } else {
    entries.push({
      id,
      title: item.title,
      author: item.author,
      year: item.year,
      type: item.type,
      link: item.link
    });
  }
  persistSummonFavorites(entries);
  return loadSummonFavoriteIds();
}

const firstString = (...candidates) => {
  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }
  return "";
};

export function mapSummonDocument(doc) {
  if (!doc || typeof doc !== "object") {
    return null;
  }

  const authors = Array.isArray(doc.authors)
    ? doc.authors
        .map((a) => {
          if (!a || typeof a !== "object") return "";
          return (
            firstString(a.fullname) ||
            [a.givenname, a.surname].filter((x) => typeof x === "string" && x.trim()).join(" ")
          );
        })
        .filter(Boolean)
    : [];

  const abstractObj = Array.isArray(doc.abstracts) ? doc.abstracts[0] : null;
  const abstract = cleanDisplayText(
    firstString(
      abstractObj && typeof abstractObj === "object" ? abstractObj.abstract : "",
      doc.snippet,
      doc.abstract
    )
  );

  const year = firstString(
    Array.isArray(doc.publication_years) ? doc.publication_years[0] : "",
    doc.publication_date && String(doc.publication_date).includes("/")
      ? String(doc.publication_date).split("/").pop()
      : doc.publication_date
  );

  const link = firstString(doc.open_access_link, doc.fulltext_link, doc.link);

  const type = firstString(doc.content_type, Array.isArray(doc.content_types) ? doc.content_types[0] : "");

  const keywords = Array.isArray(doc.disciplines)
    ? doc.disciplines.filter((d) => typeof d === "string" && d.trim())
    : [];

  const summonId = firstString(doc.id, doc.merged_id, doc.external_document_id) || "";

  return {
    _source: "summon",
    summonId,
    title: cleanDisplayText(firstString(doc.title, doc.full_title)) || "Sin título",
    author: authors.length ? authors.join(", ") : "-",
    year: year || "-",
    type: type || "-",
    abstract: abstract || "",
    link: link || "",
    keywords
  };
}

export function normalizeSummonResponse(data) {
  if (!data || typeof data !== "object") {
    return {
      results: [],
      totalPages: 0,
      page: 1,
      pageSize: 10,
      totalRecords: 0
    };
  }

  const docs = Array.isArray(data.documents) ? data.documents : [];
  const page = typeof data.query?.page_number === "number" ? data.query.page_number : 1;
  const pageSize = typeof data.query?.page_size === "number" ? data.query.page_size : 10;
  const totalRecords = typeof data.record_count === "number" ? data.record_count : 0;
  const totalPages =
    typeof data.page_count === "number" && data.page_count > 0
      ? data.page_count
      : pageSize > 0
        ? Math.max(1, Math.ceil(totalRecords / pageSize))
        : 1;

  const results = docs.map(mapSummonDocument).filter(Boolean);

  return {
    results,
    totalPages,
    page,
    pageSize,
    totalRecords
  };
}

export async function searchSummon(query, page, lang) {
  const q = String(query || "").trim();
  if (!q) {
    return {
      results: [],
      totalPages: 0,
      page: 1,
      pageSize: 10,
      totalRecords: 0
    };
  }

  const data = await api.librarySearch({
    q,
    page: Math.max(1, Number(page) || 1),
    lang: lang || "es-ES"
  });

  return normalizeSummonResponse(data);
}

/**
 * Construye q para Summon: texto principal primero, luego refinamientos.
 * Orden: búsqueda · autor · palabras clave · año · tipo (evita que el año “reemplace” el texto).
 */
export function buildSummonQueryFromFilters(filters) {
  if (!filters || typeof filters !== "object") return "";
  const t = (v) => (typeof v === "string" ? v.trim() : v != null && v !== "" ? String(v).trim() : "");
  const title = t(filters.title);
  const author = t(filters.author);
  const keyword = t(filters.keyword);
  const year = filters.year !== "" && filters.year != null ? t(filters.year) : "";
  const docType = t(filters.type);
  const parts = [title, author, keyword, year, docType].filter((p) => p && String(p).trim());
  return parts.join(" ").trim();
}
