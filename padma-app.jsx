const { useState, useMemo, useEffect } = React;

const ATLAS = window.ATLAS;
const ALL_ENTRIES = ATLAS.entries.filter(e => !e.header);
const TOTAL = ALL_ENTRIES.length;

function cn(...a) { return a.filter(Boolean).join(" "); }
function hostnameOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (_) { return ""; }
}
function yearOf(d) {
  if (!d) return null;
  const m = String(d).match(/(19|20)\d{2}/);
  return m ? parseInt(m[0], 10) : null;
}
function slotIdFor(entry) { return "img_" + entry.id.replace(/[^A-Za-z0-9_]/g, "_"); }

function App() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("catalogue");
  const [selected, setSelected] = useState({
    section: new Set(), type: new Set(), producer: new Set(), year: new Set(), source: new Set(),
  });
  const [collapsed, setCollapsed] = useState(new Set());
  const [selectedId, setSelectedId] = useState(null);

  const toggleFacet = (kind, val) => {
    setSelected(s => {
      const next = { ...s, [kind]: new Set(s[kind]) };
      next[kind].has(val) ? next[kind].delete(val) : next[kind].add(val);
      return next;
    });
  };
  const clearFacets = () => setSelected({
    section: new Set(), type: new Set(), producer: new Set(), year: new Set(), source: new Set(),
  });
  const activeFacetCount = Object.values(selected).reduce((n, s) => n + s.size, 0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ALL_ENTRIES.filter(e => {
      if (selected.section.size && !selected.section.has(e.section)) return false;
      if (selected.type.size && !selected.type.has(e.type)) return false;
      if (selected.producer.size && !selected.producer.has(e.producer)) return false;
      if (selected.year.size) {
        const y = yearOf(e.date);
        if (!y || !selected.year.has(String(y))) return false;
      }
      if (selected.source.size && !selected.source.has(hostnameOf(e.link))) return false;
      if (q) {
        const hay = [e.title, e.title_tr, e.type, e.producer, e.date, e.notes, e.id, hostnameOf(e.link)]
          .filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [selected, query]);

  const sectionList = ATLAS.sections.map(s => {
    const c = ALL_ENTRIES.filter(e => e.section === s.id).length;
    return { id: s.id, title: s.title, count: c };
  });

  function buildFacet(getValues) {
    const c = new Map();
    for (const e of filtered) {
      const v = getValues(e);
      if (v == null || v === "") continue;
      c.set(v, (c.get(v) || 0) + 1);
    }
    return [...c.entries()].map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || String(a.value).localeCompare(String(b.value)));
  }
  const typeFacet     = useMemo(() => buildFacet(e => e.type), [filtered]);
  const producerFacet = useMemo(() => buildFacet(e => e.producer), [filtered]);
  const sourceFacet   = useMemo(() => buildFacet(e => hostnameOf(e.link)), [filtered]);
  const yearFacet     = useMemo(() => {
    const c = new Map();
    for (const e of filtered) {
      const y = yearOf(e.date);
      if (y) c.set(String(y), (c.get(String(y)) || 0) + 1);
    }
    return [...c.entries()].map(([value, count]) => ({ value, count }))
      .sort((a, b) => parseInt(a.value) - parseInt(b.value));
  }, [filtered]);

  useEffect(() => {
    function onKey(e) {
      if (e.target && (e.target.tagName === "INPUT")) return;
      if (e.key === "Escape") { setSelectedId(null); return; }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const i = filtered.findIndex(en => en.id === selectedId);
        const next = filtered[Math.min(filtered.length - 1, i + 1)];
        if (next) setSelectedId(next.id);
        e.preventDefault();
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const i = filtered.findIndex(en => en.id === selectedId);
        const prev = filtered[Math.max(0, i - 1)];
        if (prev) setSelectedId(prev.id);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, selectedId]);

  const selectedEntry = useMemo(
    () => ALL_ENTRIES.find(e => e.id === selectedId), [selectedId]
  );

  const toggleCollapse = key =>
    setCollapsed(c => { const n = new Set(c); n.has(key) ? n.delete(key) : n.add(key); return n; });

  return (
    <div className="padma">
      <MenuBar />
      <TabsRow query={query} setQuery={setQuery} tab={tab} setTab={setTab} />
      <Sidebar
        sectionList={sectionList}
        selected={selected}
        toggleFacet={toggleFacet}
        collapsed={collapsed}
        toggleCollapse={toggleCollapse}
      />
      <Main
        tab={tab}
        facets={{ type: typeFacet, producer: producerFacet, year: yearFacet, source: sourceFacet }}
        selected={selected}
        toggleFacet={toggleFacet}
        filtered={filtered}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
        setQuery={setQuery}
      />
      <StatusBar
        total={TOTAL}
        shown={filtered.length}
        selected={selected}
        toggleFacet={toggleFacet}
        clearAll={clearFacets}
        activeFacetCount={activeFacetCount}
        query={query}
        clearQuery={() => setQuery("")}
      />
      {selectedEntry && <Detail entry={selectedEntry} onClose={() => setSelectedId(null)} />}
    </div>
  );
}

// ---------- Top bars ----------
function MenuBar() {
  return (
    <div className="menubar">
      <span className="brand">V/E</span>
      <span className="item">File</span>
      <span className="item">View</span>
      <span className="item">Sort</span>
      <span className="item">Layout</span>
      <span className="item">Help</span>
      <span className="session">
        <span className="session-dot"></span>local · researcher
      </span>
    </div>
  );
}

function TabsRow({ query, setQuery, tab, setTab }) {
  const tabs = [
    { id: "catalogue", label: "Catalogue" },
    { id: "map",       label: "Map" },
    { id: "timeline",  label: "Timeline" },
    { id: "notes",     label: "Notes" },
  ];
  return (
    <div className="tabsrow">
      <div className="tabs">
        {tabs.map(t => (
          <div
            key={t.id}
            className={cn("tab", tab === t.id && "is-active")}
            onClick={() => setTab(t.id)}
          >{t.label}</div>
        ))}
      </div>
      <div className="deck-title">
        Visibility &amp; Erasure <small>Visual Atlas of the Ilısu Dam, Hasankeyf &amp; the Tigris Valley</small>
      </div>
      <div className="find">
        <label>Find</label>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="title / producer / source …"
          spellCheck={false}
        />
        {query && <button className="clear" onClick={() => setQuery("")}>×</button>}
      </div>
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ sectionList, selected, toggleFacet, collapsed, toggleCollapse }) {
  return (
    <aside className="padma-sidebar">
      <Group label="Sections" k="sections" collapsed={collapsed} onToggle={toggleCollapse}>
        <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
          {sectionList.map(s => (
            <li key={s.id}>
              <button
                className={cn("side-row", selected.section.has(s.id) && "is-active")}
                onClick={() => toggleFacet("section", s.id)}
                title={s.title}>
                <span className="side-icon" style={{
                  background: selected.section.has(s.id) ? "#000" : "#fff",
                }}></span>
                <span className="side-label"><b>{s.id}</b> &nbsp;{s.title}</span>
                <span className="side-count">{s.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </Group>
      <Group label="View" k="view" collapsed={collapsed} onToggle={toggleCollapse}>
        <div className="side-row"><span className="side-icon" style={{background:"#000"}}></span><span className="side-label">Grid</span></div>
        <div className="side-row"><span className="side-icon"></span><span className="side-label">Timeline</span></div>
        <div className="side-row"><span className="side-icon"></span><span className="side-label">Map</span></div>
      </Group>
      <div className="watermark">V</div>
    </aside>
  );
}

function Group({ label, k, collapsed, onToggle, children }) {
  const isC = collapsed.has(k);
  return (
    <section className={cn("side-group", isC && "is-collapsed")}>
      <div className="side-group-head" onClick={() => onToggle(k)}>
        <span className="caret">▾</span>
        <span>{label}</span>
        <span className="info" title="Click to collapse / expand">i</span>
      </div>
      <div className="side-group-body">{children}</div>
    </section>
  );
}

// ---------- Main: facets + grid ----------
function Main({ tab, facets, selected, toggleFacet, filtered, selectedId, setSelectedId, setQuery }) {
  if (tab === "map") {
    return (
      <div className="padma-main">
        <MapView filtered={filtered} setSelectedId={setSelectedId} setQuery={setQuery} />
      </div>
    );
  }
  if (tab === "timeline") {
    return (
      <div className="padma-main">
        <TimelineView filtered={filtered} setSelectedId={setSelectedId} selectedId={selectedId} />
      </div>
    );
  }
  if (tab === "notes") {
    return (
      <div className="padma-main">
        <NotesView />
      </div>
    );
  }
  return (
    <div className="padma-main">
      <div className="facetbar">
        <Facet
          label="Type" kind="type" data={facets.type}
          selected={selected.type} toggle={toggleFacet}
        />
        <Facet
          label="Producer" kind="producer" data={facets.producer}
          selected={selected.producer} toggle={toggleFacet}
          className="facet-producer"
        />
        <Facet
          label="Year" kind="year" data={facets.year}
          selected={selected.year} toggle={toggleFacet}
          numeric
        />
        <Facet
          label="Source domain" kind="source" data={facets.source}
          selected={selected.source} toggle={toggleFacet}
        />
        <Facet
          label="Keyword" kind="keyword"
          data={[]} selected={new Set()} toggle={() => {}}
          empty="Type into Find above to filter the catalogue. Selected facets cumulate (AND across columns)."
          className="facet-keyword"
        />
      </div>
      <Grid filtered={filtered} selectedId={selectedId} setSelectedId={setSelectedId} />
    </div>
  );
}

function Facet({ label, kind, data, selected, toggle, empty, className, numeric }) {
  return (
    <div className={cn("facet", className)}>
      <div className="facet-head">
        <span>{label}</span>
        <span className="facet-count">{data.length}</span>
        <span className="sort-arrows">▲▼</span>
      </div>
      <div className="facet-list">
        {data.length === 0 && empty && <div className="side-empty" style={{padding:"6px 8px"}}>{empty}</div>}
        {data.length === 0 && !empty && <div className="side-empty" style={{padding:"6px 8px"}}>—</div>}
        {data.map(({ value, count }) => (
          <button
            key={value}
            className={cn("facet-row", selected.has(value) && "is-active")}
            onClick={() => toggle(kind, value)}
            title={value}>
            <span className="facet-label">{value}</span>
            <span className="facet-row-count">{count}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Grid ----------
function Grid({ filtered, selectedId, setSelectedId }) {
  return (
    <div className="gridwrap">
      {filtered.length === 0 && (
        <div style={{padding:"48px 24px", textAlign:"center", fontSize:12, color:"#666"}}>
          No records match the current selection. Clear a facet or change the query.
        </div>
      )}
      <div className="gridarea">
        {filtered.map(e => (
          <button
            key={e.id}
            className={cn("gridcard", selectedId === e.id && "is-selected")}
            onClick={() => setSelectedId(e.id)}
          >
            <div className="gc-thumb">
              <image-slot
                id={slotIdFor(e)}
                shape="rect"
                fit="cover"
                placeholder=""
                style={{ width: "100%", height: "100%", display: "block" }}
              ></image-slot>
              <div className="gc-thumb-strip" aria-hidden="true"></div>
            </div>
            <div className="gc-id">
              <span>{e.id}</span>
              <span className="gc-id-sec">{e.section}</span>
            </div>
            <div className="gc-title">{e.title}</div>
            <div className="gc-date">{e.date || "—"} · {e.producer || ""}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- Status bar ----------
function StatusBar({ total, shown, selected, toggleFacet, clearAll, activeFacetCount, query, clearQuery }) {
  const chips = [];
  for (const kind of ["section","type","producer","year","source"]) {
    for (const v of selected[kind]) {
      chips.push({ kind, v });
    }
  }
  return (
    <div className="statusbar">
      <span className="left"></span>
      {query && (
        <span className="pill" onClick={clearQuery} style={{cursor:"pointer"}} title="Clear search">
          find: “{query}” ×
        </span>
      )}
      {chips.map(({ kind, v }) => (
        <span key={kind + ":" + v} className="pill" onClick={() => toggleFacet(kind, v)} style={{cursor:"pointer"}} title={`Remove ${kind} = ${v}`}>
          {kind}: {v} ×
        </span>
      ))}
      {(activeFacetCount > 0 || query) && (
        <button className="clear-all" onClick={() => { clearAll(); clearQuery(); }}>Clear all</button>
      )}
      <span className="count"></span>
      <span className="right">↑ ↓ navigate · Esc close · click to filter</span>
    </div>
  );
}

// ---------- Detail ----------
function Detail({ entry, onClose }) {
  const section = ATLAS.sections.find(s => s.id === entry.section);
  return (
    <aside className="detail" role="dialog" aria-modal="true">
      <div className="detail-bar">
        <div className="detail-bar-left">
          <span>Cat. {entry.id}</span>
          <span className="detail-bar-sep">/</span>
          <span>Section {entry.section} · {section?.title}</span>
        </div>
        <button className="detail-close" onClick={onClose} aria-label="Close">×</button>
      </div>
      <div className="detail-body">
        <div className="detail-thumb">
          <image-slot
            id={slotIdFor(entry)}
            shape="rect"
            fit="cover"
            placeholder="Drop a screenshot or image here"
            style={{ width: "100%", height: "100%", display: "block" }}
          ></image-slot>
        </div>
        <div className="detail-inner">
          <h2 className="detail-title">{entry.title}</h2>
          {entry.title_tr && entry.title_tr !== entry.title && (
            <div className="detail-title-tr"><span className="lang-tag">TR</span>{entry.title_tr}</div>
          )}
          <dl className="detail-meta">
            <div><dt>Type</dt><dd>{entry.type || "—"}</dd></div>
            <div><dt>Producer</dt><dd>{entry.producer || "—"}</dd></div>
            <div><dt>Date</dt><dd>{entry.date || "—"}</dd></div>
            <div><dt>Section</dt><dd>{entry.section} · {section?.title}</dd></div>
          </dl>
          {entry.notes && (
            <div className="detail-notes">
              <div className="detail-block-label">Editorial note</div>
              <p>{entry.notes}</p>
            </div>
          )}
          {entry.link && (
            <div className="detail-links">
              <div className="detail-block-label">Source</div>
              <a className="ext-link" href={entry.link} target="_blank" rel="noopener noreferrer">
                <span>→</span>
                <span>
                  <span className="ext-host">{hostnameOf(entry.link)}</span>
                  <span className="ext-url">{entry.link}</span>
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ---------- Map view ----------
const MAP_BBOX = { lonMin: 39.6, lonMax: 42.7, latMin: 36.8, latMax: 38.4 };

const MAP_SITES = [
  { id: "hasankeyf-old",  name: "HASANKEYF (OLD CITY)", sub: "submerged 2020",
    lat: 37.7144, lon: 41.4109, mark: "X", emphasis: 2, query: "Hasankeyf" },
  { id: "zeynel-new",     name: "ZEYNEL BEY TOMB (NEW)", sub: "Hasankeyf Cultural Park",
    lat: 37.7239, lon: 41.3919, mark: "▲", emphasis: 1, query: "Zeynel Bey" },
  { id: "new-hasankeyf",  name: "NEW HASANKEYF", sub: "TOKİ resettlement",
    lat: 37.7400, lon: 41.3650, mark: "▢", emphasis: 1, query: "New Hasankeyf" },
  { id: "ilisu-dam",      name: "ILISU DAM", sub: "wall · 19 May 2020",
    lat: 37.5278, lon: 41.8442, mark: "▮", emphasis: 2, query: "Ilısu" },
  { id: "malabadi",       name: "MALABADI BRIDGE", sub: "Depardon's last photo",
    lat: 38.0244, lon: 41.0356, mark: "○", emphasis: 1, query: "Malabadi" },
  { id: "diyarbakir",     name: "DİYARBAKIR", sub: "DSİ 16th Reg. · art scene",
    lat: 37.9144, lon: 40.2306, mark: "■", emphasis: 1, query: "Diyarbakır" },
  { id: "batman",         name: "BATMAN", sub: "provincial centre",
    lat: 37.8812, lon: 41.1351, mark: "■", emphasis: 1, query: "Batman" },
  { id: "mardin",         name: "MARDİN", sub: "Artuklu University · Arazi",
    lat: 37.3122, lon: 40.7351, mark: "■", emphasis: 1, query: "Mardin" },
  { id: "dargecit",       name: "DARGEÇİT", sub: "15 km from dam axis",
    lat: 37.5333, lon: 41.7167, mark: "·", emphasis: 0, query: "Dargeçit" },
  { id: "cizre",          name: "CİZRE", sub: "downstream",
    lat: 37.3300, lon: 42.1817, mark: "·", emphasis: 0, query: "" },
  { id: "sirnak",         name: "ŞIRNAK", sub: "provincial border",
    lat: 37.5189, lon: 42.4533, mark: "·", emphasis: 0, query: "" },
];

// Approximate Tigris course (lon, lat)
const TIGRIS_PATH = [
  [39.70, 38.30], [39.95, 38.20], [40.20, 38.00], [40.23, 37.91],
  [40.50, 37.85], [40.66, 37.85], [40.85, 37.83], [41.13, 37.88],
  [41.30, 37.78], [41.41, 37.71], [41.55, 37.62], [41.84, 37.53],
  [42.05, 37.45], [42.18, 37.33], [42.35, 37.20], [42.65, 37.00],
];

// Reservoir lake (rough polygon, upstream of dam)
const RESERVOIR = [
  [41.86, 37.55], [41.75, 37.60], [41.60, 37.66], [41.45, 37.72], [41.30, 37.78],
  [41.18, 37.85], [40.95, 37.86], [40.80, 37.84], [40.66, 37.85],
  [40.66, 37.88], [40.85, 37.86], [41.10, 37.90], [41.40, 37.83],
  [41.62, 37.72], [41.78, 37.65], [41.88, 37.58],
];

function projectMap(lon, lat, W, H, pad = 40) {
  const x = pad + (lon - MAP_BBOX.lonMin) / (MAP_BBOX.lonMax - MAP_BBOX.lonMin) * (W - pad * 2);
  const y = pad + (MAP_BBOX.latMax - lat) / (MAP_BBOX.latMax - MAP_BBOX.latMin) * (H - pad * 2);
  return [x, y];
}

function MapView({ filtered, setSelectedId, setQuery }) {
  const W = 1400, H = 700, PAD = 56;
  const [hoverSite, setHoverSite] = useState(null);

  // Grid lines: half-degree
  const gridLons = [];
  for (let l = Math.ceil(MAP_BBOX.lonMin * 2) / 2; l <= MAP_BBOX.lonMax; l += 0.5) gridLons.push(l);
  const gridLats = [];
  for (let l = Math.ceil(MAP_BBOX.latMin * 2) / 2; l <= MAP_BBOX.latMax; l += 0.5) gridLats.push(l);

  const tigrisPts = TIGRIS_PATH.map(([lo, la]) => projectMap(lo, la, W, H, PAD));
  const tigrisPath = tigrisPts.map((p, i) => (i === 0 ? "M" : "L") + p[0] + " " + p[1]).join(" ");
  const reservoirPath = RESERVOIR
    .map((p, i) => { const [x, y] = projectMap(p[0], p[1], W, H, PAD); return (i === 0 ? "M" : "L") + x + " " + y; })
    .join(" ") + " Z";

  // scale bar: ~50 km
  const [x0] = projectMap(MAP_BBOX.lonMin + 0.5, MAP_BBOX.latMin + 0.1, W, H, PAD);
  const [x1] = projectMap(MAP_BBOX.lonMin + 0.5 + (50 / 111), MAP_BBOX.latMin + 0.1, W, H, PAD);
  const scaleLen = x1 - x0;

  return (
    <div className="mapwrap">
      <div className="map-header">
        <div className="map-title">
          <span className="map-num">04 / Cartography</span>
          <span className="map-name">Tigris Valley — Hasankeyf / Ilısu</span>
        </div>
        <div className="map-coords">
          {hoverSite
            ? <>{hoverSite.lat.toFixed(4)}°N &nbsp; {hoverSite.lon.toFixed(4)}°E &nbsp; · &nbsp; <b>{hoverSite.name}</b></>
            : <>37°36′N / 41°25′E &nbsp; scale ≈ 1 : 1,400,000 &nbsp; · &nbsp; click a site to filter the catalogue</>}
        </div>
      </div>

      <div className="map-stage">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="mapsvg">
          {/* hairline border */}
          <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill="#fff" stroke="#000" strokeWidth="1" />

          {/* grid */}
          {gridLons.map(l => {
            const [x] = projectMap(l, MAP_BBOX.latMin, W, H, PAD);
            return <g key={"glon" + l}>
              <line x1={x} y1={PAD} x2={x} y2={H - PAD} stroke="#000" strokeWidth="0.3" strokeDasharray="2 4" />
              <text x={x} y={PAD - 8} fontSize="9" textAnchor="middle" fill="#000" fontFamily="Arial">
                {l.toFixed(1)}°E
              </text>
            </g>;
          })}
          {gridLats.map(l => {
            const [, y] = projectMap(MAP_BBOX.lonMin, l, W, H, PAD);
            return <g key={"glat" + l}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#000" strokeWidth="0.3" strokeDasharray="2 4" />
              <text x={PAD - 8} y={y + 3} fontSize="9" textAnchor="end" fill="#000" fontFamily="Arial">
                {l.toFixed(1)}°N
              </text>
            </g>;
          })}

          {/* reservoir (hatched) */}
          <defs>
            <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#000" strokeWidth="0.5" />
            </pattern>
          </defs>
          <path d={reservoirPath} fill="url(#hatch)" stroke="#000" strokeWidth="1.2" />

          {/* tigris */}
          <path d={tigrisPath} fill="none" stroke="#000" strokeWidth="2.4" strokeLinecap="square" strokeLinejoin="miter" />

          {/* dam wall — short thick segment perpendicular to flow */}
          {(() => {
            const [dx, dy] = projectMap(41.8442, 37.5278, W, H, PAD);
            return <g>
              <line x1={dx - 14} y1={dy - 4} x2={dx + 14} y2={dy + 4} stroke="#000" strokeWidth="5" />
            </g>;
          })()}

          {/* sites */}
          {MAP_SITES.map(s => {
            const [x, y] = projectMap(s.lon, s.lat, W, H, PAD);
            const isBig = s.emphasis >= 2;
            return (
              <g key={s.id}
                 className="map-site"
                 onMouseEnter={() => setHoverSite(s)}
                 onMouseLeave={() => setHoverSite(null)}
                 onClick={() => { if (s.query) { setQuery(s.query); } }}
                 style={{ cursor: s.query ? "pointer" : "default" }}>
                {/* hit zone */}
                <rect x={x - 8} y={y - 8} width="16" height="16" fill="transparent" />
                {/* mark */}
                {s.mark === "X" && <g>
                  <line x1={x - 6} y1={y - 6} x2={x + 6} y2={y + 6} stroke="#000" strokeWidth="2.4" />
                  <line x1={x - 6} y1={y + 6} x2={x + 6} y2={y - 6} stroke="#000" strokeWidth="2.4" />
                </g>}
                {s.mark === "▲" && <polygon points={`${x},${y-6} ${x-6},${y+5} ${x+6},${y+5}`} fill="#000" />}
                {s.mark === "▢" && <rect x={x-5} y={y-5} width="10" height="10" fill="#fff" stroke="#000" strokeWidth="1.6" />}
                {s.mark === "▮" && <rect x={x-3} y={y-7} width="6" height="14" fill="#000" />}
                {s.mark === "○" && <circle cx={x} cy={y} r="5" fill="#fff" stroke="#000" strokeWidth="1.6" />}
                {s.mark === "■" && <rect x={x-4} y={y-4} width="8" height="8" fill="#000" />}
                {s.mark === "·" && <circle cx={x} cy={y} r="2" fill="#000" />}
                {/* label */}
                <text
                  x={x + 10}
                  y={y + 3}
                  fontSize={isBig ? 11 : 9.5}
                  fontWeight={isBig ? 700 : 400}
                  fontFamily="Arial"
                  fill="#000"
                  style={{ pointerEvents: "none" }}>
                  {s.name}
                </text>
                <text
                  x={x + 10}
                  y={y + 14}
                  fontSize="8"
                  fontFamily="Arial"
                  fill="#444"
                  style={{ pointerEvents: "none" }}>
                  {s.sub}
                </text>
              </g>
            );
          })}

          {/* north arrow */}
          <g transform={`translate(${W - PAD - 30}, ${PAD + 30})`}>
            <line x1="0" y1="-22" x2="0" y2="22" stroke="#000" strokeWidth="1.4" />
            <polygon points="0,-22 -6,-10 6,-10" fill="#000" />
            <text x="0" y="-26" fontSize="10" fontWeight="700" textAnchor="middle" fontFamily="Arial">N</text>
          </g>

          {/* scale bar */}
          <g transform={`translate(${PAD + 10}, ${H - PAD + 16})`}>
            <line x1="0" y1="0" x2={scaleLen} y2="0" stroke="#000" strokeWidth="2" />
            <line x1="0" y1="-4" x2="0" y2="4" stroke="#000" strokeWidth="2" />
            <line x1={scaleLen} y1="-4" x2={scaleLen} y2="4" stroke="#000" strokeWidth="2" />
            <line x1={scaleLen/2} y1="-3" x2={scaleLen/2} y2="3" stroke="#000" strokeWidth="1" />
            <text x="0" y="16" fontSize="9" fontFamily="Arial">0</text>
            <text x={scaleLen/2} y="16" fontSize="9" textAnchor="middle" fontFamily="Arial">25 km</text>
            <text x={scaleLen} y="16" fontSize="9" textAnchor="middle" fontFamily="Arial">50 km</text>
          </g>

          {/* legend */}
          <g transform={`translate(${PAD + 10}, ${PAD + 10})`}>
            <rect x="0" y="0" width="190" height="118" fill="#fff" stroke="#000" strokeWidth="1" />
            <text x="10" y="16" fontSize="10" fontWeight="700" fontFamily="Arial">LEGEND</text>
            <g transform="translate(10,30)" fontSize="9" fontFamily="Arial">
              <line x1="0" y1="6" x2="20" y2="6" stroke="#000" strokeWidth="2.4" />
              <text x="28" y="9">Tigris course (approx.)</text>
              <rect x="0" y="16" width="20" height="10" fill="url(#hatch)" stroke="#000" />
              <text x="28" y="24">Ilısu reservoir extent</text>
              <line x1="0" y1="40" x2="14" y2="40" stroke="#000" strokeWidth="5" />
              <text x="28" y="43">Dam wall</text>
              <g transform="translate(0,52)">
                <line x1="-3" y1="-3" x2="9" y2="9" stroke="#000" strokeWidth="2.4" />
                <line x1="-3" y1="9" x2="9" y2="-3" stroke="#000" strokeWidth="2.4" />
              </g>
              <text x="28" y="62">Submerged site</text>
              <rect x="-1" y="68" width="8" height="8" fill="#000" />
              <text x="28" y="76">Provincial centre</text>
            </g>
          </g>
        </svg>

        {/* on-map footnote */}
        <div className="map-footnote">
          Cartography is schematic. Coordinates approximate. Source: catalogue locations (see sections 02, 09, 12).
        </div>
      </div>
    </div>
  );
}

// ---------- Timeline view ----------
function TimelineView({ filtered, setSelectedId, selectedId }) {
  // Compute year span
  const yearEntries = filtered.map(e => ({ ...e, _y: yearOf(e.date) })).filter(e => e._y);
  if (yearEntries.length === 0) {
    return (
      <div className="mapwrap"><div className="map-stage" style={{padding:32, fontSize:12, color:"#666"}}>
        No dated entries match the current filters.
      </div></div>
    );
  }
  const ys = yearEntries.map(e => e._y);
  const minY = Math.min(...ys, 1990), maxY = Math.max(...ys, 2026);
  const years = [];
  for (let y = minY; y <= maxY; y++) years.push(y);

  const byYear = new Map();
  for (const e of yearEntries) {
    if (!byYear.has(e._y)) byYear.set(e._y, []);
    byYear.get(e._y).push(e);
  }

  return (
    <div className="timelinewrap">
      <div className="map-header">
        <div className="map-title">
          <span className="map-num">05 / Chronology</span>
          <span className="map-name">{minY}–{maxY} · {yearEntries.length} dated record(s)</span>
        </div>
        <div className="map-coords">click a card to open</div>
      </div>
      <div className="timeline-scroll">
        {years.map(y => {
          const list = byYear.get(y) || [];
          return (
            <div key={y} className={cn("timeline-year", list.length === 0 && "is-empty")}>
              <div className="ty-label">{y}</div>
              <div className="ty-track">
                {list.map(e => (
                  <button
                    key={e.id}
                    className={cn("ty-card", selectedId === e.id && "is-selected")}
                    onClick={() => setSelectedId(e.id)}
                    title={e.title}>
                    <div className="ty-card-id">{e.id} · §{e.section}</div>
                    <div className="ty-card-title">{e.title}</div>
                    <div className="ty-card-meta">{e.producer || ""}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- Notes view ----------
function NotesView() {
  return (
    <div className="noteswrap">
      <div className="map-header">
        <div className="map-title">
          <span className="map-num">06 / Apparatus</span>
          <span className="map-name">Notes on the catalogue</span>
        </div>
      </div>
      <div className="notes-body">
        <h3>Visibility &amp; Erasure</h3>
        <p>A visual atlas compiled around three overlapping objects: a 12,000-year-old town (Hasankeyf), a dam (Ilısu) and a tomb (Zeynel Bey). The catalogue collects images, films, reports and counter-images produced by state, industry, journalism, NGOs, artists and citizens between the late 19th century and 2026.</p>
        <h3>How to use</h3>
        <p>Click facets in any column to filter; selections combine with AND. Section codes (01–15) group records thematically. The map view filters by site; the timeline view filters by year. Image slots beside each record accept drag-and-drop screenshots — they persist locally between sessions.</p>
        <h3>Status</h3>
        <p>Research apparatus, not a publication. Press images linked at source; agency rights reside with AFP, Getty, Reuters, AA, DHA. Last update 12 May 2026.</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);