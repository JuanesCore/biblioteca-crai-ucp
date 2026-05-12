import React, { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

const TYPE_COLORS = ["#8B0000", "#6B7280", "#0F766E", "#F59E0B", "#A855F7", "#2563EB"];

const safeParseArray = (raw) => {
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseDate = (entry) => {
  const candidate = entry?.timestamp || entry?.createdAt || entry?.date || entry?.day;
  if (!candidate) return null;
  if (typeof candidate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(candidate)) {
    return new Date(`${candidate}T00:00:00`);
  }
  const d = new Date(candidate);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDay = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const humanAgo = (date) => {
  if (!date) return "fecha no disponible";
  const diffSec = Math.max(1, Math.floor((Date.now() - date.getTime()) / 1000));
  if (diffSec < 60) return `hace ${diffSec}s`;
  if (diffSec < 3600) return `hace ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `hace ${Math.floor(diffSec / 3600)} h`;
  return `hace ${Math.floor(diffSec / 86400)} día(s)`;
};

const normalizeType = (entry) => {
  const value = String(entry?.type || entry?.docType || entry?.resourceType || "").trim().toLowerCase();
  if (!value) return "Sin tipo";
  if (value.includes("libro")) return "Libro";
  if (value.includes("art")) return "Artículo";
  if (value.includes("rev")) return "Revista";
  if (value.includes("ebook") || value.includes("e-book")) return "Ebook";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const extractKeyword = (entry) =>
  String(entry?.keyword || entry?.query || entry?.term || entry?.title || "")
    .trim()
    .toLowerCase();

const csvEscape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

const Analytics = ({ user }) => {
  const isAdmin = user?.role === "admin";
  const [range, setRange] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 450);
    return () => clearTimeout(timer);
  }, [range]);

  const computed = useMemo(() => {
    const searchLogsRaw = safeParseArray(localStorage.getItem("search_logs"));
    const favorites = safeParseArray(localStorage.getItem("favorites_ucp"));

    const now = Date.now();
    const rangeMs = range === "today" ? 24 * 60 * 60 * 1000 : range === "30d" ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const filteredLogs = searchLogsRaw.filter((entry) => {
      const d = parseDate(entry);
      if (!d) return false;
      return now - d.getTime() <= rangeMs;
    });

    const byDay = new Map();
    const byType = new Map();
    const byKeyword = new Map();
    const activeUsers = new Set();

    for (const entry of filteredLogs) {
      const d = parseDate(entry);
      if (!d) continue;
      const day = formatDay(d);
      byDay.set(day, (byDay.get(day) || 0) + 1);

      const type = normalizeType(entry);
      byType.set(type, (byType.get(type) || 0) + 1);

      const keyword = extractKeyword(entry);
      if (keyword) byKeyword.set(keyword, (byKeyword.get(keyword) || 0) + 1);

      const email = String(entry?.email || "").toLowerCase().trim();
      if (email) activeUsers.add(email);
    }

    const searchesByDay = [...byDay.entries()]
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([day, total]) => ({
        day,
        total,
        dayLabel: new Date(`${day}T00:00:00`).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
      }));

    const docTypes = [...byType.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    const topKeywords = [...byKeyword.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword, total]) => ({ keyword, total }));

    const recentActivity = filteredLogs
      .map((entry) => {
        const d = parseDate(entry);
        return {
          keyword: extractKeyword(entry) || "(sin término)",
          email: String(entry?.email || "usuario@ucp.edu.co"),
          type: normalizeType(entry),
          date: d
        };
      })
      .sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0))
      .slice(0, 10);

    return {
      totalSearches: filteredLogs.length,
      activeUsers: activeUsers.size,
      totalFavorites: favorites.length,
      topKeyword: topKeywords[0]?.keyword || "Sin datos",
      searchesByDay,
      docTypes,
      topKeywords,
      recentActivity
    };
  }, [range]);

  const exportCsv = () => {
    const headers = ["termino", "usuario", "tipo", "fecha"];
    const rows = computed.recentActivity.map((item) => [
      item.keyword,
      item.email,
      item.type,
      item.date ? item.date.toISOString() : ""
    ]);
    const csv = [headers, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-crai-${range}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) return <div className="crai-message">No autorizado</div>;

  return (
    <div className="crai-analytics">
      <header className="crai-analytics__header">
        <div>
          <h1 className="crai-analytics__title">Panel de Analítica CRAI</h1>
          <p className="crai-analytics__subtitle">Estadísticas de uso de la biblioteca digital</p>
        </div>
        <div className="crai-analytics__controls">
          <div className="crai-range-switch" role="tablist" aria-label="Rango de fechas">
            {[
              { id: "today", label: "Hoy" },
              { id: "7d", label: "7 días" },
              { id: "30d", label: "30 días" }
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`crai-range-switch__btn ${range === opt.id ? "is-active" : ""}`}
                onClick={() => setRange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <button type="button" className="crai-secondary-btn" onClick={exportCsv}>
            Exportar CSV
          </button>
        </div>
      </header>

      <section className="crai-analytics__metrics">
        {[
          { icon: "🔍", value: computed.totalSearches.toLocaleString("es-CO"), label: "Búsquedas totales" },
          { icon: "👥", value: computed.activeUsers.toLocaleString("es-CO"), label: "Usuarios activos" },
          { icon: "⭐", value: computed.totalFavorites.toLocaleString("es-CO"), label: "Recursos favoritos" },
          { icon: "🏆", value: computed.topKeyword, label: "Búsqueda más frecuente" }
        ].map((item) => (
          <article className="crai-metric-card" key={item.label}>
            {loading ? (
              <div className="crai-skeleton crai-skeleton--metric" />
            ) : (
              <>
                <div className="crai-metric-card__icon" aria-hidden>
                  {item.icon}
                </div>
                <div className="crai-metric-card__value">{item.value}</div>
                <div className="crai-metric-card__label">{item.label}</div>
              </>
            )}
          </article>
        ))}
      </section>

      <section className="crai-analytics__charts">
        <article className="crai-analytics-card">
          <h2 className="crai-analytics-card__title">Búsquedas por día</h2>
          <div className="crai-analytics-card__body">
            {loading ? (
              <div className="crai-skeleton crai-skeleton--chart" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={computed.searchesByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                  <XAxis dataKey="dayLabel" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" name="Búsquedas" stroke="#8B0000" strokeWidth={3} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="crai-analytics-card">
          <h2 className="crai-analytics-card__title">Tipos de recurso</h2>
          <div className="crai-analytics-card__body">
            {loading ? (
              <div className="crai-skeleton crai-skeleton--chart" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={computed.docTypes} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={2}>
                    {computed.docTypes.map((entry, idx) => (
                      <Cell key={`${entry.name}-${idx}`} fill={TYPE_COLORS[idx % TYPE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>

        <article className="crai-analytics-card crai-analytics-card--wide">
          <h2 className="crai-analytics-card__title">Top 5 búsquedas</h2>
          <div className="crai-analytics-card__body">
            {loading ? (
              <div className="crai-skeleton crai-skeleton--chart" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={computed.topKeywords} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(15,23,42,0.08)" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="keyword" width={170} />
                  <Tooltip />
                  <Bar dataKey="total" name="Búsquedas" fill="#8B0000" radius={[0, 6, 6, 0]} animationDuration={700} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section className="crai-analytics-card">
        <h2 className="crai-analytics-card__title">Actividad reciente</h2>
        <div className="crai-activity-list">
          {loading ? (
            Array.from({ length: 4 }).map((_, idx) => <div key={idx} className="crai-skeleton crai-skeleton--row" />)
          ) : computed.recentActivity.length === 0 ? (
            <p className="crai-helper-inline">No hay actividad reciente para este rango.</p>
          ) : (
            computed.recentActivity.map((item, idx) => (
              <div className="crai-activity-item" key={`${item.keyword}-${idx}`}>
                <div className="crai-activity-item__main">
                  <strong>“{item.keyword}”</strong> — {item.email}
                </div>
                <div className="crai-activity-item__meta">
                  <span className="crai-activity-chip">{item.type}</span>
                  <span>{humanAgo(item.date)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default Analytics;

