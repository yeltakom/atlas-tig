const { useState, useMemo, useEffect, useRef } = React;

const ATLAS = window.ATLAS;

// ---------- helpers ----------
function classNames(...args) { return args.filter(Boolean).join(" "); }

function hostnameOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ""); } catch (_) { return ""; }
}

function normalizeDate(d) {
  if (!d) return "";
  return d;
}

// Pull out a sortable year from a date string like "12 May 2017", "c. 2017-2018", "2010s"
function yearOf(d) {
  if (!d) return null;
  const m = d.match(/(19|20)\d{2}/);
  return m ? parseInt(m[0], 10) : null;
}

// All non-header entries
const ALL_ENTRIES = ATLAS.entries.filter(e => !e.header);
const HEADERS = ATLAS.entries.filter(e => e.header);

// Counts per section
const SECTION_COUNTS = ATLAS.sections.map(s => ({
  ...s,
  count: ALL_ENTRIES.filter(e => e.section === s.id).length,
}));

const TOTAL = ALL_ENTRIES.length;

// All unique types for filters
const ALL_TYPES = Array.from(new Set(ALL_ENTRIES.map(e => e.type).filter(Boolean))).sort();

// ---------- root ----------
function App() {
  const [section, setSection] = useState("ALL"); // "ALL" or section.id
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [yearMin, setYearMin] = useState(""); // string
  const [yearMax, setYearMax] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [sortBy, setSortBy] = useState("id"); // id | year | type | producer

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = ALL_ENTRIES.filter(e => {
      if (section !== "ALL" && e.section !== section) return false;
      if (typeFilter !== "ALL" && e.type !== typeFilter) return false;
      const y = yearOf(e.date);
      if (yearMin && (y == null || y < parseInt(yearMin, 10))) return false;
      if (yearMax && (y == null || y > parseInt(yearMax, 10))) return false;
      if (q) {
        const hay = [
          e.title, e.title_tr, e.type, e.producer, e.date, e.notes, e.id, hostnameOf(e.link),
        ].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    if (sortBy === "year") {
      list = list.slice().sort((a,b) => (yearOf(a.date)||9999) - (yearOf(b.date)||9999));
    } else if (sortBy === "type") {
      list = list.slice().sort((a,b) => (a.type||"").localeCompare(b.type||""));
    } else if (sortBy === "producer") {
      list = list.slice().sort((a,b) => (a.producer||"").localeCompare(b.producer||""));
    } // else id keeps the editorial order
    return list;
  }, [section, query, typeFilter, yearMin, yearMax, sortBy]);

  const selectedEntry = useMemo(
    () => filtered.find(e => e.id === selectedId) || ALL_ENTRIES.find(e => e.id === selectedId),
    [selectedId, filtered]
  );

  // keyboard navigation: ↑ ↓ select prev/next; Esc to close detail
  useEffect(() => {
    function onKey(e) {
      if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "SELECT" || e.target.tagName === "TEXTAREA")) return;
      if (e.key === "Escape") { setSelectedId(null); return; }
      if (e.key === "ArrowDown" || e.key === "j") {
        const idx = filtered.findIndex(en => en.id === selectedId);
        const next = filtered[Math.min(filtered.length - 1, idx + 1)];
        if (next) setSelectedId(next.id);
        e.preventDefault();
      }
      if (e.key === "ArrowUp" || e.key === "k") {
        const idx = filtered.findIndex(en => en.id === selectedId);
        const prev = filtered[Math.max(0, idx - 1)];
        if (prev) setSelectedId(prev.id);
        e.preventDefault();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtered, selectedId]);

  const clearFilters = () => { setSection("ALL"); setQuery(""); setTypeFilter("ALL"); setYearMin(""); setYearMax(""); };

  return (
    <div className="archive">
      <Masthead total={TOTAL} shown={filtered.length} query={query} setQuery={setQuery}/>
      <div className="archive-grid">
        <Sidebar
          section={section} setSection={setSection}
          typeFilter={typeFilter} setTypeFilter={setTypeFilter}
          yearMin={yearMin} setYearMin={setYearMin}
          yearMax={yearMax} setYearMax={setYearMax}
          sortBy={sortBy} setSortBy={setSortBy}
          clearFilters={clearFilters}
        />
        <EntryList
          entries={filtered}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          sortBy={sortBy}
          activeSection={section}
        />
      </div>
      {selectedEntry && (
        <DetailPanel entry={selectedEntry} onClose={() => setSelectedId(null)}/>
      )}
    </div>
  );
}

// ---------- Masthead ----------
function Masthead({ total, shown, query, setQuery }) {
  return (
    <header className="masthead">
      <div className="masthead-rule top"></div>
      <div className="masthead-row">
        <div className="masthead-left">
          <div className="dept">Visual Atlas · Research Materials</div>
          <h1 className="title">{ATLAS.meta.title}</h1>
          <div className="subtitle">{ATLAS.meta.subtitle}</div>
          <div className="byline">
            Last update {ATLAS.meta.compiled}
          </div>
        </div>
        <div className="masthead-right">
        </div>
      </div>
      <div className="masthead-search-row">
        <label className="search-wrap" htmlFor="q">
          <span className="search-label">Search</span>
          <input
            id="q"
            type="text"
            className="search-input"
            placeholder="title, producer, date, type, hostname …"
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          {query && (
            <button className="search-clear" onClick={() => setQuery("")} aria-label="Clear search">×</button>
          )}
        </label>
        <div className="masthead-keys">
          <kbd>↑</kbd><kbd>↓</kbd> navigate&nbsp;&nbsp;<kbd>Esc</kbd> close
        </div>
      </div>
      <div className="masthead-rule bottom"></div>
    </header>
  );
}

// ---------- Sidebar ----------
function Sidebar({
  section, setSection,
  typeFilter, setTypeFilter,
  yearMin, setYearMin, yearMax, setYearMax,
  sortBy, setSortBy, clearFilters,
}) {
  return (
    <aside className="sidebar">
      <SidebarGroup label="Sections">
        <ul className="section-list">
          <li>
            <button
              className={classNames("section-item", section === "ALL" && "is-active")}
              onClick={() => setSection("ALL")}>
              <span className="section-code">00</span>
              <span className="section-title">All holdings</span>
              <span className="section-count">{TOTAL}</span>
            </button>
          </li>
          {SECTION_COUNTS.map(s => (
            <li key={s.id}>
              <button
                className={classNames("section-item", section === s.id && "is-active")}
                onClick={() => setSection(s.id)}
                title={s.tr}>
                <span className="section-code">{s.id}</span>
                <span className="section-title">{s.title}</span>
                <span className="section-count">{s.count}</span>
              </button>
            </li>
          ))}
        </ul>
      </SidebarGroup>

      <SidebarGroup label="Refine">
        <div className="control">
          <label htmlFor="type-filter">Type</label>
          <select id="type-filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
            <option value="ALL">All types</option>
            {ALL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="control control-row">
          <div>
            <label htmlFor="ymin">Year ≥</label>
            <input id="ymin" type="number" inputMode="numeric" min="1900" max="2100" placeholder="—"
              value={yearMin} onChange={e => setYearMin(e.target.value)} />
          </div>
          <div>
            <label htmlFor="ymax">Year ≤</label>
            <input id="ymax" type="number" inputMode="numeric" min="1900" max="2100" placeholder="—"
              value={yearMax} onChange={e => setYearMax(e.target.value)} />
          </div>
        </div>
        <div className="control">
          <label htmlFor="sort">Sort by</label>
          <select id="sort" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="id">Catalogue ID</option>
            <option value="year">Year (oldest first)</option>
            <option value="type">Type</option>
            <option value="producer">Producer</option>
          </select>
        </div>
        <button className="link-button" onClick={clearFilters}>↺ Reset all filters</button>
      </SidebarGroup>

      <SidebarGroup label="Legend">
        <dl className="legend">
          <div><dt>Cat. №</dt><dd>Section number + entry, e.g. 2.07 = section 02, entry 07.</dd></div>
          <div><dt>Producer</dt><dd>Institution, agency, or named author of the record.</dd></div>
          <div><dt>Note</dt><dd>Editorial annotation by the compiler.</dd></div>
        </dl>
      </SidebarGroup>

      <div className="colophon">
        Press materials are linked at source. Wire photography rights reside with the originating agency (AFP, Getty, Reuters, AA, DHA). This catalogue is research apparatus, not a publication.
      </div>
    </aside>
  );
}

function SidebarGroup({ label, children }) {
  return (
    <section className="sidebar-group">
      <div className="sidebar-group-label">{label}</div>
      {children}
    </section>
  );
}

// ---------- Entry list ----------
function EntryList({ entries, selectedId, setSelectedId, sortBy, activeSection }) {
  // Group by section only when section==="ALL" and sorted by id
  const grouped = useMemo(() => {
    if (activeSection !== "ALL" || sortBy !== "id") return null;
    const map = {};
    for (const e of entries) {
      if (!map[e.section]) map[e.section] = [];
      map[e.section].push(e);
    }
    return map;
  }, [entries, activeSection, sortBy]);

  return (
    <main className="entry-list">
      <div className="entry-list-head">
        <div className="col col-id">№</div>
        <div className="col col-title">Title</div>
        <div className="col col-type">Type</div>
        <div className="col col-producer">Producer</div>
        <div className="col col-date">Date</div>
      </div>

      {entries.length === 0 && (
        <div className="empty">
          No records match the current filter.<br/>
          Reset filters or broaden your search to see entries.
        </div>
      )}

      {grouped ? (
        ATLAS.sections.map(s => {
          const list = grouped[s.id];
          if (!list || list.length === 0) return null;
          return (
            <div key={s.id} className="section-block">
              <div className="section-header">
                <span className="section-header-code">{s.id}</span>
                <span className="section-header-title">{s.title}</span>
                <span className="section-header-count">{list.length} item{list.length === 1 ? "" : "s"}</span>
              </div>
              {list.map(e => (
                <EntryRow
                  key={e.id}
                  entry={e}
                  selected={selectedId === e.id}
                  onSelect={() => setSelectedId(e.id)}
                />
              ))}
              {/* render sub-headers for that section */}
            </div>
          );
        })
      ) : (
        entries.map(e => (
          <EntryRow
            key={e.id}
            entry={e}
            selected={selectedId === e.id}
            onSelect={() => setSelectedId(e.id)}
            showSection={activeSection === "ALL"}
          />
        ))
      )}
    </main>
  );
}

function slotIdFor(entry) {
  // image-slot persistence id: stable per entry
  return "img_" + entry.id.replace(/[^A-Za-z0-9_]/g, "_");
}

function EntryRow({ entry, selected, onSelect, showSection }) {
  // find subheader for this entry (if applicable)
  const subhead = useMemo(() => {
    // headers like 6.HDR-A precede entries 6.01… until next header
    const sectionHeaders = HEADERS.filter(h => h.section === entry.section);
    if (sectionHeaders.length === 0) return null;
    // find header that comes immediately before entry in original order
    const idx = ATLAS.entries.findIndex(x => x.id === entry.id);
    let last = null;
    for (let i = 0; i < idx; i++) {
      const x = ATLAS.entries[i];
      if (x.section === entry.section && x.header) last = x;
    }
    return last ? last.header : null;
  }, [entry.id]);

  return (
    <button
      className={classNames("entry-row", selected && "is-selected")}
      onClick={onSelect}
    >
      <div className="col col-id">
        <span className="entry-num">{entry.id}</span>
        {subhead && <span className="entry-sub" title={subhead}>{subhead.split("—")[0].trim()}</span>}
      </div>
      <div className="col col-title">
        <div className="entry-title">{entry.title}</div>
        {entry.title_tr && entry.title_tr !== entry.title && (
          <div className="entry-title-tr">{entry.title_tr}</div>
        )}
      </div>
      <div className="col col-type">{entry.type || "—"}</div>
      <div className="col col-producer">{entry.producer || "—"}</div>
      <div className="col col-date">{entry.date || "—"}</div>
    </button>
  );
}

// ---------- Detail panel ----------
function DetailPanel({ entry, onClose }) {
  const section = ATLAS.sections.find(s => s.id === entry.section);
  return (
    <aside className="detail" role="dialog" aria-modal="true" aria-label={`Record ${entry.id}`}>
      <div className="detail-bar">
        <div className="detail-bar-left">
          <span className="detail-bar-cat">Cat. {entry.id}</span>
          <span className="detail-bar-sep">/</span>
          <span className="detail-bar-section">Section {entry.section} · {section?.title}</span>
        </div>
        <button className="detail-close" onClick={onClose} aria-label="Close detail">×</button>
      </div>
      <div className="detail-body">
        <div className="detail-thumb">
          <image-slot
            id={slotIdFor(entry)}
            shape="rect"
            fit="cover"
            placeholder="Drop a screenshot or image here"
            style={{width: "100%", height: "100%", display: "block"}}
          ></image-slot>
        </div>
        <h2 className="detail-title">{entry.title}</h2>
        {entry.title_tr && entry.title_tr !== entry.title && (
          <div className="detail-title-tr">
            <span className="lang-tag">TR</span> {entry.title_tr}
          </div>
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
              <span className="ext-arrow">→</span>
              <span className="ext-text">
                <span className="ext-host">{hostnameOf(entry.link)}</span>
                <span className="ext-url">{entry.link}</span>
              </span>
            </a>
          </div>
        )}
        {entry.mirror && (
          <div className="detail-links">
            <div className="detail-block-label">Mirror</div>
            <a className="ext-link" href={entry.mirror} target="_blank" rel="noopener noreferrer">
              <span className="ext-arrow">→</span>
              <span className="ext-text">
                <span className="ext-host">{hostnameOf(entry.mirror)}</span>
                <span className="ext-url">{entry.mirror}</span>
              </span>
            </a>
          </div>
        )}

        <div className="detail-footer">
          <span>Catalogue entry {entry.id} of {TOTAL}.</span>
          <span>Press <kbd>↑</kbd> / <kbd>↓</kbd> to step · <kbd>Esc</kbd> to close.</span>
        </div>
      </div>
    </aside>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
